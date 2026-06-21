import datetime
import logging
from sqlalchemy.orm import Session
from models import PurchaseOrder, Supplier, AgentEmail, AuditLog
from logic.deepseek_client import chat_completion

logger = logging.getLogger("vigil-agent")

def get_iso_now() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"

def get_days_overdue(po: PurchaseOrder) -> int:
    try:
        expected = datetime.datetime.strptime(po.expected_delivery[:10], "%Y-%m-%d")
        now = datetime.datetime.utcnow()
        delta = (now - expected).days
        return max(0, delta)
    except Exception:
        return 5 # fallback

def draft_followup_email(po: PurchaseOrder, supplier: Supplier, reminder_count: int) -> tuple[str, str]:
    """
    Drafts a follow-up email with dynamic tone progression using DeepSeek.
    """
    tones = ["polite and friendly", "firm and direct", "urgent and formal"]
    tone = tones[min(reminder_count, 2)]
    
    days_overdue = get_days_overdue(po)
    
    system_prompt = "You are a professional procurement manager drafting supplier follow-up emails. Keep it concise, professional, and clear. Start directly with the subject line on line 1, then the email body. Do not output any markdown formatting or meta text."
    
    user_prompt = f"""
    Draft a {tone} follow-up email for an overdue purchase order.
    Supplier: {supplier.name} ({supplier.country})
    PO ID: {po.id}
    Order Date: {po.order_date}
    Expected Delivery: {po.expected_delivery}
    Days Overdue: {days_overdue}
    Order Value: ${po.total_value:,.2f}
    Previous reminders sent: {reminder_count}
    """
    
    response = chat_completion(system=system_prompt, user=user_prompt, temperature=0.6)
    
    # Parse subject and body from LLM output
    subject = f"Follow-up: Outstanding Purchase Order {po.id}"
    body = response
    
    lines = [line.strip() for line in response.split("\n") if line.strip()]
    for line in lines:
        if line.lower().startswith("subject:"):
            subject = line[8:].strip()
            body = "\n".join(lines[lines.index(line)+1:])
            break
            
    return subject, body

def run_agent_cycle(db: Session) -> list:
    """
    Scans for overdue purchase orders and drafts automated follow-up communications.
    """
    logger.info("Running agent execution cycle...")
    overdue_pos = db.query(PurchaseOrder).filter(PurchaseOrder.status == "overdue").all()
    
    drafts_created = []
    created_at = get_iso_now()
    
    for po in overdue_pos:
        supplier = db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
        if not supplier:
            continue
            
        # Get count
        reminder_count = po.reminder_count
        subject, body = draft_followup_email(po, supplier, reminder_count)
        
        # Advance count
        po.reminder_count += 1
        
        # Determine tone keyword
        tones = ["friendly", "firm", "urgent"]
        tone_keyword = tones[min(reminder_count, 2)]
        
        # Save email
        email = AgentEmail(
            po_id=po.id,
            supplier_id=po.supplier_id,
            direction="outbound",
            tone=tone_keyword,
            subject=subject,
            body=body,
            sent_at=created_at,
            is_reply_simulated=0
        )
        db.add(email)
        db.flush() # get email.id
        
        # Log to AuditLog
        log_entry = AuditLog(
            timestamp=created_at,
            actor="vigil-autonomous-agent-v1",
            action="AGENT_EMAIL",
            entity_type="purchase_order",
            entity_id=po.id,
            severity="medium" if tone_keyword == "firm" else ("high" if tone_keyword == "urgent" else "low"),
            reasoning=f"Sent {tone_keyword} follow-up email to {supplier.name} for overdue PO {po.id} (Value: ${po.total_value:,.2f}, Days Overdue: {get_days_overdue(po)}). Reminder #{po.reminder_count}.",
            confidence=1.0
        )
        db.add(log_entry)
        
        # Index to vector store
        try:
            from logic.vector_store import index_document
            doc_text = f"Outbound email drafted to {supplier.name} (PO {po.id}). Subject: {subject}. Tone: {tone_keyword}. Body: {body}"
            index_document(
                doc_id=f"email_{email.id}",
                text=doc_text,
                metadata={
                    "type": "email",
                    "email_id": email.id,
                    "po_id": po.id,
                    "supplier_id": po.supplier_id,
                    "direction": "outbound",
                    "tone": tone_keyword
                }
            )
        except Exception as e:
            logger.error(f"Failed to index email {email.id}: {e}")
            
        drafts_created.append({
            "po_id": po.id,
            "supplier": supplier.name,
            "tone": tone_keyword,
            "subject": subject
        })
        
    db.commit()
    logger.info(f"Agent cycle complete. Sent {len(drafts_created)} reminders.")
    return drafts_created

def simulate_supplier_reply(db: Session, po_id: str, scenario: str) -> AgentEmail:
    """
    Simulates a supplier reply to the latest overdue outreach and updates database state.
    """
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        logger.error(f"PO {po_id} not found.")
        return None
        
    supplier = db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
    if not supplier:
        return None
        
    # Get last outbound email if any
    last_email = db.query(AgentEmail).filter(
        AgentEmail.po_id == po_id,
        AgentEmail.direction == "outbound"
    ).order_by(AgentEmail.id.desc()).first()
    
    subject_ref = last_email.subject if last_email else f"Purchase Order {po_id}"
    
    # Sim reply using DeepSeek
    system_prompt = "You are a supplier representative replying to a customer's follow-up email. Write a natural business response. Avoid markdown formatting or meta text. Keep it brief (1-2 paragraphs)."
    
    user_prompt = f"""
    Write a realistic supplier reply email for scenario: {scenario}.
    Supplier: {supplier.name}
    PO: {po.id}, Value: ${po.total_value:,.2f}
    Original Subject: {subject_ref}
    Make it feel like a real business email — specific, slightly informal, matching the scenario.
    """
    
    reply_body = chat_completion(system=system_prompt, user=user_prompt, temperature=0.8)
    reply_subject = f"Re: {subject_ref}" if not subject_ref.startswith("Re:") else subject_ref
    
    created_at = get_iso_now()
    
    # Save email
    email = AgentEmail(
        po_id=po.id,
        supplier_id=po.supplier_id,
        direction="inbound",
        tone=None,
        subject=reply_subject,
        body=reply_body,
        sent_at=created_at,
        is_reply_simulated=1
    )
    db.add(email)
    
    # Update PO status and notes based on scenario
    notes_update = ""
    if scenario == "shipment_dispatched":
        po.status = "shipped"
        notes_update = "Shipment dispatched via Express Freight (TRK-88271-X)."
    elif scenario == "delay_weather":
        # Keep status overdue or update notes
        notes_update = "Delay reported: Severe regional storms grounded flights. Estimated 3-4 days delay."
    elif scenario == "delay_customs":
        notes_update = "Delay reported: Shipment held at customs for certification review. Est. 5 days delay."
    elif scenario == "dispute_pricing":
        notes_update = "Billing discrepancy: Supplier claims Catalog unit price is $60.30 vs PO unit price of $45.00."
    elif scenario == "partial_shipment":
        notes_update = "Partial fulfillment: 50% of PO quantity shipped (TRK-9982). Remaining scheduled for next week."
        
    po.notes = f"[{datetime.datetime.utcnow().strftime('%Y-%m-%d')}] {notes_update} " + (po.notes or "")
    
    # Log to AuditLog
    log_entry = AuditLog(
        timestamp=created_at,
        actor="vigil-autonomous-agent-v1",
        action="REPLY_SIMULATED",
        entity_type="purchase_order",
        entity_id=po.id,
        severity="low",
        reasoning=f"Supplier reply received from {supplier.name} for PO {po.id}. Scenario: {scenario}. Notes updated: {notes_update}",
        confidence=1.0
    )
    db.add(log_entry)
    db.flush() # get email.id
    
    # Index to vector store
    try:
        from logic.vector_store import index_document
        doc_text = f"Inbound reply received from {supplier.name} (PO {po.id}). Subject: {reply_subject}. Scenario: {scenario}. Body: {reply_body}"
        index_document(
            doc_id=f"email_{email.id}",
            text=doc_text,
            metadata={
                "type": "email",
                "email_id": email.id,
                "po_id": po.id,
                "supplier_id": po.supplier_id,
                "direction": "inbound",
                "is_reply_simulated": 1
            }
        )
    except Exception as e:
        logger.error(f"Failed to index reply email {email.id}: {e}")
        
    db.commit()
    db.refresh(email)
    return email
