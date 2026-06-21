import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from logic.audit_engine import run_full_audit, run_audit_on_invoice

router = APIRouter(prefix="/api/audit", tags=["audit"])

def get_iso_now() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"

@router.post("/run")
def trigger_audit(db: Session = Depends(get_db)):
    """
    Manually triggers a full audit scan on all invoices.
    """
    run_full_audit(db)
    return {"status": "success", "message": "Audit run successfully."}

@router.get("/invoices", response_model=List[schemas.InvoiceWithDetails])
def get_invoices(db: Session = Depends(get_db)):
    """
    Returns all invoices with their pre-computed risk scores, suppliers, and findings.
    """
    return db.query(models.Invoice).order_by(models.Invoice.risk_score.desc()).all()

@router.get("/invoices/{invoice_id}", response_model=schemas.InvoiceWithDetails)
def get_invoice(invoice_id: str, db: Session = Depends(get_db)):
    """
    Returns details for a single invoice.
    """
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("/action")
def perform_audit_action(payload: schemas.AuditActionRequest, db: Session = Depends(get_db)):
    """
    Approves, escalates, or adds audit notes to an invoice, writing to the audit log.
    """
    invoice = db.query(models.Invoice).filter(models.Invoice.id == payload.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    created_at = get_iso_now()
    action_type = payload.action.lower()
    
    if action_type == "approve":
        invoice.status = "approved"
        log_action = "APPROVE_INVOICE"
        log_reasoning = f"User manually approved Invoice {invoice.id}."
        if payload.note_text:
            log_reasoning += f" Note: {payload.note_text}"
            
    elif action_type == "escalate":
        invoice.status = "escalated"
        log_action = "ESCALATE_INVOICE"
        log_reasoning = f"User manually escalated Invoice {invoice.id}."
        if payload.note_text:
            log_reasoning += f" Note: {payload.note_text}"
            
    elif action_type == "note":
        log_action = "ADD_NOTE"
        log_reasoning = f"User added note to Invoice {invoice.id}: {payload.note_text}"
        
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve', 'escalate', or 'note'")

    # Save to immutable audit log
    log_entry = models.AuditLog(
        timestamp=created_at,
        actor="user-human",
        action=log_action,
        entity_type="invoice",
        entity_id=invoice.id,
        severity="low" if action_type == "note" else "high",
        reasoning=log_reasoning,
        confidence=1.0
    )
    db.add(log_entry)
    db.commit()
    
    # Re-index invoice status to vector store
    try:
        from logic.vector_store import index_document
        finding_texts = "; ".join([f.reasoning for f in invoice.findings])
        supplier_name = invoice.supplier.name if invoice.supplier else "Unknown Supplier"
        doc_text = f"Invoice {invoice.id} from {supplier_name} dated {invoice.invoice_date} for ${invoice.amount:,.2f}. Status: {invoice.status}. Risk Score: {invoice.risk_score}. Findings: {finding_texts if finding_texts else 'None'}"
        
        index_document(
            doc_id=f"invoice_{invoice.id}",
            text=doc_text,
            metadata={
                "type": "invoice",
                "invoice_id": invoice.id,
                "supplier_id": invoice.supplier_id,
                "po_id": invoice.po_id or "",
                "amount": invoice.amount,
                "risk_score": invoice.risk_score,
                "status": invoice.status
            }
        )
    except Exception as e:
        pass
        
    return {"status": "success", "message": f"Action '{payload.action}' completed on Invoice {invoice.id}."}

@router.get("/summary", response_model=schemas.AuditSummaryResponse)
def get_audit_summary(db: Session = Depends(get_db)):
    """
    Aggregates invoice audit stats for the dashboard.
    """
    total = db.query(models.Invoice).count()
    flagged = db.query(models.Invoice).filter(models.Invoice.risk_score >= 15, models.Invoice.status != "approved").count()
    auto_approved = db.query(models.Invoice).filter(models.Invoice.status == "approved", models.Invoice.risk_score < 15).count()
    
    # Pending human actions (status is either pending or escalated)
    pending_human = db.query(models.Invoice).filter(models.Invoice.status.in_(["pending", "escalated"])).count()
    
    # Total spend under review
    under_review_invoices = db.query(models.Invoice).filter(models.Invoice.status.in_(["pending", "escalated"])).all()
    total_spend_under_review = sum(inv.amount for inv in under_review_invoices)
    
    # Severity counts from findings
    findings = db.query(models.AuditFinding).all()
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = f.severity.lower()
        if sev in severity_counts:
            severity_counts[sev] += 1
            
    return schemas.AuditSummaryResponse(
        total_invoices=total,
        flagged_review=flagged,
        auto_approved=auto_approved,
        pending_human=pending_human,
        total_spend_under_review=total_spend_under_review,
        severity_counts=severity_counts
    )

@router.get("/log", response_model=List[schemas.AuditLogBase])
def get_audit_log(
    severity: Optional[str] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns the immutable audit log list with optional filters.
    """
    query = db.query(models.AuditLog)
    if severity:
        query = query.filter(models.AuditLog.severity == severity)
    if action:
        query = query.filter(models.AuditLog.action == action)
        
    return query.order_by(models.AuditLog.id.desc()).all()
