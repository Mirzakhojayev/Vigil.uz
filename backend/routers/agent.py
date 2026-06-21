from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from logic.agent_logic import run_agent_cycle, simulate_supplier_reply

router = APIRouter(prefix="/api/agent", tags=["agent"])

@router.post("/run")
def trigger_agent_cycle(db: Session = Depends(get_db)):
    """
    Manually runs the autonomous agent scan to monitor overdue POs and send follow-ups.
    """
    drafts = run_agent_cycle(db)
    return {"status": "success", "emails_drafted": drafts}

@router.get("/emails", response_model=List[schemas.AgentEmailWithSupplier])
def get_emails(db: Session = Depends(get_db)):
    """
    Returns all sent or received supplier emails.
    """
    return db.query(models.AgentEmail).order_by(models.AgentEmail.id.desc()).all()

@router.post("/simulate-reply", response_model=schemas.AgentEmailBase)
def simulate_reply(payload: schemas.SimulateReplyRequest, db: Session = Depends(get_db)):
    """
    Simulates a supplier reply to the latest outreach based on the given operational scenario.
    """
    email = simulate_supplier_reply(db, payload.po_id, payload.scenario)
    if not email:
        raise HTTPException(status_code=400, detail="Failed to simulate supplier reply. Verify the Purchase Order exists.")
    return email
