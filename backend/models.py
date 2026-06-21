from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String)
    category = Column(String)
    reliability_score = Column(Integer)
    avg_lead_time_days = Column(Integer)

    # Relationships
    orders = relationship("PurchaseOrder", back_populates="supplier")
    invoices = relationship("Invoice", back_populates="supplier")
    price_history = relationship("SupplierPriceHistory", back_populates="supplier")
    emails = relationship("AgentEmail", back_populates="supplier")

class SupplierPriceHistory(Base):
    __tablename__ = "supplier_price_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    item_code = Column(String, index=True)
    avg_unit_price = Column(Float)
    sample_count = Column(Integer)
    last_updated = Column(String)

    # Relationships
    supplier = relationship("Supplier", back_populates="price_history")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    status = Column(String)  # confirmed|shipped|overdue|invoiced|paid
    order_date = Column(String)
    expected_delivery = Column(String)
    total_value = Column(Float)
    reminder_count = Column(Integer, default=0)
    notes = Column(Text)

    # Relationships
    supplier = relationship("Supplier", back_populates="orders")
    items = relationship("OrderItem", back_populates="po")
    emails = relationship("AgentEmail", back_populates="po")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    po_id = Column(String, ForeignKey("purchase_orders.id"))
    item_code = Column(String)
    description = Column(String)
    quantity = Column(Integer)
    unit_price = Column(Float)

    # Relationships
    po = relationship("PurchaseOrder", back_populates="items")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    po_id = Column(String, ForeignKey("purchase_orders.id"), nullable=True)
    amount = Column(Float)
    invoice_date = Column(String)
    status = Column(String, default="pending")  # pending|approved|escalated|paid
    risk_score = Column(Integer, default=0)
    last_audited = Column(String, nullable=True)

    # Relationships
    supplier = relationship("Supplier", back_populates="invoices")
    findings = relationship("AuditFinding", back_populates="invoice")

class AuditFinding(Base):
    __tablename__ = "audit_findings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(String, ForeignKey("invoices.id"))
    check_name = Column(String)
    severity = Column(String)  # critical|high|medium|low
    confidence = Column(Float)
    reasoning = Column(Text)
    recommendation = Column(String)  # auto_approve|human_review|escalate
    created_at = Column(String)

    # Relationships
    invoice = relationship("Invoice", back_populates="findings")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(String, nullable=False)
    actor = Column(String, default="vigil-audit-engine-v1")
    action = Column(String)  # FLAG_INVOICE|AUTO_APPROVE|ESCALATE|AGENT_EMAIL|REPLY_SIMULATED etc.
    entity_type = Column(String)
    entity_id = Column(String)
    severity = Column(String, nullable=True)
    reasoning = Column(Text)
    confidence = Column(Float, nullable=True)

class AgentEmail(Base):
    __tablename__ = "agent_emails"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    po_id = Column(String, ForeignKey("purchase_orders.id"), nullable=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    direction = Column(String)  # outbound|inbound
    tone = Column(String, nullable=True)  # friendly|firm|urgent
    subject = Column(String)
    body = Column(Text)
    sent_at = Column(String)
    is_reply_simulated = Column(Integer, default=0)

    # Relationships
    po = relationship("PurchaseOrder", back_populates="emails")
    supplier = relationship("Supplier", back_populates="emails")
