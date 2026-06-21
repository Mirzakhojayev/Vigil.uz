import datetime
import logging
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from models import Invoice, PurchaseOrder, OrderItem, Supplier, SupplierPriceHistory, AuditFinding, AuditLog
from logic.deepseek_client import chat_completion

logger = logging.getLogger("vigil-auditengine")

SEVERITY_WEIGHTS = {"critical": 40, "high": 25, "medium": 10, "low": 5}


def get_iso_now() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"


def explain_finding(check_name: str, invoice: Invoice, supplier: Supplier, evidence: dict) -> str:
    """Generates a natural language explanation for an audit finding using DeepSeek."""
    system_prompt = """You are a financial auditor writing clear, concise explanations
of suspicious invoice patterns for a business owner. Be direct, cite specific
numbers, and explain why this warrants attention. 2-3 sentences max. Do not include introductory or conversational filler."""
    user_prompt = f"Check: {check_name}\nInvoice: {invoice.id}, Amt: ${invoice.amount:,.2f}, Date: {invoice.invoice_date}\nSupplier: {supplier.name if supplier else 'Unknown'}\nEvidence: {evidence}"
    return chat_completion(system=system_prompt, user=user_prompt, temperature=0.2)


def create_finding(check_name: str, severity: str, confidence: float, recommendation: str, evidence: dict, invoice: Invoice, supplier: Supplier) -> dict:
    """Helper to generate reasoning and compile a structured finding dictionary."""
    reasoning = explain_finding(check_name, invoice, supplier, evidence)
    return {
        "check_name": check_name,
        "severity": severity,
        "confidence": confidence,
        "reasoning": reasoning,
        "recommendation": recommendation
    }

# =====================================================================
# 10 AUDIT CHECKS
# =====================================================================


def check_price_deviation(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not invoice.po_id:
        return []
    items = db.query(OrderItem).filter(OrderItem.po_id == invoice.po_id).all()
    findings = []
    for item in items:
        history = db.query(SupplierPriceHistory).filter(
            SupplierPriceHistory.supplier_id == invoice.supplier_id,
            SupplierPriceHistory.item_code == item.item_code
        ).first()
        if history and history.avg_unit_price > 0:
            deviation = (item.unit_price - history.avg_unit_price) / \
                history.avg_unit_price
            if deviation > 0.15:
                sev = "critical" if deviation > 0.30 else "high"
                evidence = {"item_code": item.item_code, "unit_price": item.unit_price,
                            "historical_avg": history.avg_unit_price, "deviation_pct": round(deviation * 100, 2)}
                findings.append(create_finding("check_price_deviation", sev, 0.95, "escalate" if sev ==
                                "critical" else "human_review", evidence, invoice, supplier))
    return findings


def check_exact_duplicate(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    duplicates = db.query(Invoice).filter(
        Invoice.supplier_id == invoice.supplier_id,
        Invoice.amount == invoice.amount,
        Invoice.invoice_date == invoice.invoice_date,
        Invoice.id != invoice.id
    ).all()
    if duplicates:
        evidence = {"duplicate_invoice_ids": [
            d.id for d in duplicates], "amount": invoice.amount, "invoice_date": invoice.invoice_date}
        return [create_finding("check_exact_duplicate", "critical", 0.98, "escalate", evidence, invoice, supplier)]
    return []


def check_split_invoicing(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not invoice.po_id:
        return []
    siblings = db.query(Invoice).filter(
        Invoice.po_id == invoice.po_id, Invoice.id != invoice.id).all()
    if siblings:
        all_inv = [invoice] + siblings
        total = sum(inv.amount for inv in all_inv)
        if total > 12000 and any(5000 < inv.amount < 10000 for inv in all_inv):
            evidence = {"po_id": invoice.po_id, "invoice_count": len(
                all_inv), "total_invoiced_amount": total}
            return [create_finding("check_split_invoicing", "critical", 0.92, "escalate", evidence, invoice, supplier)]
    return []


def check_near_identical(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    try:
        current_date = datetime.datetime.strptime(
            invoice.invoice_date[:10], "%Y-%m-%d")
    except:
        return []
    others = db.query(Invoice).filter(Invoice.supplier_id ==
                                      invoice.supplier_id, Invoice.id != invoice.id).all()
    for other in others:
        try:
            other_date = datetime.datetime.strptime(
                other.invoice_date[:10], "%Y-%m-%d")
            days_diff = abs((current_date - other_date).days)
            amount_diff = abs(invoice.amount - other.amount)
            if days_diff <= 7 and 0.00 < amount_diff <= 10.00:
                evidence = {"matching_invoice_id": other.id, "amount1": invoice.amount,
                            "amount2": other.amount, "difference": round(amount_diff, 2)}
                return [create_finding("check_near_identical", "high", 0.88, "human_review", evidence, invoice, supplier)]
        except:
            continue
    return []


def check_round_numbers(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if invoice.amount >= 1000 and (invoice.amount % 1000 == 0 or invoice.amount % 5000 == 0):
        has_items = db.query(OrderItem).filter(
            OrderItem.po_id == invoice.po_id).count() > 0 if invoice.po_id else False
        evidence = {"amount": invoice.amount, "has_line_items": has_items}
        return [create_finding("check_round_numbers", "medium", 0.80, "human_review", evidence, invoice, supplier)]
    return []


def check_po_reference(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not invoice.po_id:
        return [create_finding("check_po_reference", "critical", 0.99, "escalate", {"provided_po_id": None, "reason": "No PO references provided"}, invoice, supplier)]
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == invoice.po_id).first()
    if not po:
        return [create_finding("check_po_reference", "critical", 0.99, "escalate", {"provided_po_id": invoice.po_id, "reason": "PO ID does not exist"}, invoice, supplier)]
    return []


def check_spend_concentration(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not supplier or not supplier.category:
        return []
    cat_sups = [s.id for s in db.query(Supplier).filter(
        Supplier.category == supplier.category).all()]
    all_cat_invoices = db.query(Invoice).filter(
        Invoice.supplier_id.in_(cat_sups)).all()
    total_spend = sum(inv.amount for inv in all_cat_invoices)
    supplier_spend = sum(
        inv.amount for inv in all_cat_invoices if inv.supplier_id == invoice.supplier_id)
    if total_spend > 0:
        ratio = supplier_spend / total_spend
        if ratio > 0.50 and supplier_spend > 10000:
            evidence = {"category": supplier.category, "supplier_spend": round(
                supplier_spend, 2), "total_category_spend": round(total_spend, 2), "percentage": round(ratio * 100, 2)}
            return [create_finding("check_spend_concentration", "medium", 0.85, "human_review", evidence, invoice, supplier)]
    return []


def check_new_supplier_large(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not supplier:
        return []
    prior = db.query(Invoice).filter(Invoice.supplier_id == invoice.supplier_id,
                                     Invoice.id != invoice.id, Invoice.status.in_(["approved", "paid"])).count()
    if prior == 0 and invoice.amount > 15000:
        evidence = {"amount": invoice.amount,
                    "is_new_supplier": True, "threshold": 15000.00}
        return [create_finding("check_new_supplier_large", "high", 0.90, "human_review", evidence, invoice, supplier)]
    return []


def check_sequential_timing(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    try:
        current_date = datetime.datetime.strptime(
            invoice.invoice_date[:10], "%Y-%m-%d")
    except:
        return []
    all_inv = db.query(Invoice).filter(
        Invoice.supplier_id == invoice.supplier_id).all()
    in_window = []
    for inv in all_inv:
        try:
            inv_date = datetime.datetime.strptime(
                inv.invoice_date[:10], "%Y-%m-%d")
            if abs((current_date - inv_date).days * 24) <= 72:
                in_window.append(inv)
        except:
            continue
    if len(in_window) >= 3:
        evidence = {"matching_invoices_count": len(in_window), "invoice_ids": [
            i.id for i in in_window]}
        return [create_finding("check_sequential_timing", "medium", 0.82, "human_review", evidence, invoice, supplier)]
    return []


def check_invoice_exceeds_po(invoice: Invoice, supplier: Supplier, db: Session) -> list:
    if not invoice.po_id:
        return []
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == invoice.po_id).first()
    if po and invoice.amount > po.total_value + 0.01:
        evidence = {"invoice_amount": invoice.amount, "po_amount": po.total_value,
                    "overrun": round(invoice.amount - po.total_value, 2)}
        return [create_finding("check_invoice_exceeds_po", "high", 0.94, "human_review", evidence, invoice, supplier)]
    return []

# =====================================================================
# ENGINE RUNNER
# =====================================================================


AUDIT_CHECKS = [
    check_price_deviation, check_exact_duplicate, check_split_invoicing,
    check_near_identical, check_round_numbers, check_po_reference,
    check_spend_concentration, check_new_supplier_large, check_sequential_timing,
    check_invoice_exceeds_po
]


def run_audit_on_invoice(db: Session, invoice_id: str) -> Invoice:
    """Runs all 10 audit checks, persists findings, and routes status by risk score."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        logger.warning(f"Invoice {invoice_id} not found.")
        return None
    db.query(AuditFinding).filter(
        AuditFinding.invoice_id == invoice_id).delete()

    all_findings = []
    supplier = db.query(Supplier).filter(
        Supplier.id == invoice.supplier_id).first()
    for check in AUDIT_CHECKS:
        try:
            all_findings.extend(check(invoice, supplier, db))
        except Exception as e:
            logger.error(
                f"Error running check {check.__name__} on invoice {invoice_id}: {e}", exc_info=True)

    created_at = get_iso_now()
    finding_objects = []
    for f in all_findings:
        finding_obj = AuditFinding(
            invoice_id=invoice.id, check_name=f["check_name"], severity=f["severity"],
            confidence=f["confidence"], reasoning=f["reasoning"],
            recommendation=f["recommendation"], created_at=created_at
        )
        db.add(finding_obj)
        finding_objects.append(finding_obj)

    invoice.risk_score = min(
        100, sum(SEVERITY_WEIGHTS[f.severity] for f in finding_objects))
    invoice.last_audited = created_at

    if invoice.status in ["pending", "escalated", "approved"]:
        if invoice.risk_score >= 60:
            invoice.status, action_name = "escalated", "AUTO_ESCALATE"
            log_reasoning = f"Invoice {invoice.id} risk score ({invoice.risk_score}) exceeds critical threshold. Auto-escalated."
        elif invoice.risk_score < 15:
            invoice.status, action_name = "approved", "AUTO_APPROVE"
            log_reasoning = f"Invoice {invoice.id} risk score ({invoice.risk_score}) is clean. Auto-approved."
        else:
            invoice.status, action_name = "pending", "AUTO_FLAG"
            log_reasoning = f"Invoice {invoice.id} risk score is {invoice.risk_score}. Flagged for review."

        if len(finding_objects) > 0 or action_name == "AUTO_APPROVE":
            log_entry = AuditLog(
                timestamp=created_at, actor="vigil-audit-engine-v1", action=action_name,
                entity_type="invoice", entity_id=invoice.id,
                severity="critical" if invoice.risk_score >= 60 else (
                    "high" if invoice.risk_score >= 25 else "medium"),
                reasoning=log_reasoning if not finding_objects else finding_objects[0].reasoning,
                confidence=max(
                    [f.confidence for f in finding_objects]) if finding_objects else 1.0
            )
            db.add(log_entry)

    db.commit()
    db.refresh(invoice)

    try:
        from logic.vector_store import index_document
        finding_texts = "; ".join([f.reasoning for f in invoice.findings])
        supplier_name = supplier.name if supplier else "Unknown Supplier"
        doc_text = f"Invoice {invoice.id} from {supplier_name} dated {invoice.invoice_date} for ${invoice.amount:,.2f}. Status: {invoice.status}. Risk Score: {invoice.risk_score}. Findings: {finding_texts or 'None'}"
        index_document(
            doc_id=f"invoice_{invoice.id}", text=doc_text,
            metadata={"type": "invoice", "invoice_id": invoice.id, "supplier_id": invoice.supplier_id,
                      "po_id": invoice.po_id or "", "amount": invoice.amount, "risk_score": invoice.risk_score, "status": invoice.status}
        )
        for f in invoice.findings:
            index_document(
                doc_id=f"finding_{f.id}", text=f"Audit finding: check {f.check_name} triggered on invoice {invoice.id} by {supplier_name}. Severity: {f.severity}. Reasoning: {f.reasoning}",
                metadata={"type": "audit_finding", "finding_id": f.id,
                          "invoice_id": invoice.id, "check_name": f.check_name, "severity": f.severity}
            )
    except Exception as e:
        logger.error(f"Failed to index invoice {invoice.id}: {e}")
    return invoice


def run_full_audit(db: Session):
    """Audits all invoices in the system."""
    logger.info("Starting full audit cycle...")
    for inv in db.query(Invoice).all():
        run_audit_on_invoice(db, inv.id)
    logger.info("Full audit cycle complete.")
