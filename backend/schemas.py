from pydantic import BaseModel, Field
from typing import List, Optional

class SupplierBase(BaseModel):
    id: str
    name: str
    country: Optional[str] = None
    category: Optional[str] = None
    reliability_score: Optional[int] = None
    avg_lead_time_days: Optional[int] = None

    class Config:
        from_attributes = True

class SupplierPriceHistoryBase(BaseModel):
    id: int
    supplier_id: str
    item_code: str
    avg_unit_price: float
    sample_count: int
    last_updated: str

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    id: int
    po_id: str
    item_code: str
    description: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    id: str
    supplier_id: str
    status: str
    order_date: str
    expected_delivery: str
    total_value: float
    reminder_count: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PurchaseOrderWithSupplier(PurchaseOrderBase):
    supplier: SupplierBase
    items: List[OrderItemBase] = []

class AuditFindingBase(BaseModel):
    id: int
    invoice_id: str
    check_name: str
    severity: str
    confidence: float
    reasoning: str
    recommendation: str
    created_at: str

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    id: str
    supplier_id: str
    po_id: Optional[str] = None
    amount: float
    invoice_date: str
    status: str
    risk_score: int
    last_audited: Optional[str] = None

    class Config:
        from_attributes = True

class InvoiceWithDetails(InvoiceBase):
    supplier: SupplierBase
    findings: List[AuditFindingBase] = []
    po: Optional[PurchaseOrderBase] = None

class AuditLogBase(BaseModel):
    id: int
    timestamp: str
    actor: str
    action: str
    entity_type: str
    entity_id: str
    severity: Optional[str] = None
    reasoning: str
    confidence: Optional[float] = None

    class Config:
        from_attributes = True

class AgentEmailBase(BaseModel):
    id: int
    po_id: Optional[str] = None
    supplier_id: str
    direction: str
    tone: Optional[str] = None
    subject: str
    body: str
    sent_at: str
    is_reply_simulated: int

    class Config:
        from_attributes = True

class AgentEmailWithSupplier(AgentEmailBase):
    supplier: SupplierBase

class AuditActionRequest(BaseModel):
    invoice_id: str
    action: str  # approve|escalate|note
    note_text: Optional[str] = None

class SimulateReplyRequest(BaseModel):
    po_id: str
    scenario: str  # shipment_dispatched|delay_weather|delay_customs|dispute_pricing|partial_shipment

class RAGQueryRequest(BaseModel):
    query: str

class SourceCitation(BaseModel):
    id: str
    type: str  # invoice|supplier|po|email|audit_log|audit_finding
    text_snippet: str

class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]

class AuditSummaryResponse(BaseModel):
    total_invoices: int
    flagged_review: int
    auto_approved: int
    pending_human: int
    total_spend_under_review: float
    severity_counts: dict
