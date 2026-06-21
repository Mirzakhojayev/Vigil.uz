import datetime
from sqlalchemy.orm import Session
from models import Supplier, SupplierPriceHistory, PurchaseOrder, OrderItem, Invoice, AuditLog, AgentEmail

def db_is_seeded(db: Session) -> bool:
    return db.query(Supplier).count() > 0

def seed_database(db: Session):
    print("Seeding database...")
    
    # 1. Suppliers
    suppliers = [
        Supplier(id="SUP-001", name="Apex Components Ltd", country="Germany", category="Electronics", reliability_score=87, avg_lead_time_days=12),
        Supplier(id="SUP-002", name="Meridian Logistics", country="Netherlands", category="Freight", reliability_score=72, avg_lead_time_days=8),
        Supplier(id="SUP-003", name="GlobalParts Inc", country="China", category="Electronics", reliability_score=65, avg_lead_time_days=20),
        Supplier(id="SUP-004", name="Nexus Supply Co", country="USA", category="Chemicals", reliability_score=91, avg_lead_time_days=7),
        Supplier(id="SUP-005", name="Harmon Industrial", country="UK", category="Machinery", reliability_score=83, avg_lead_time_days=15),
        Supplier(id="SUP-006", name="BlueStar Materials", country="India", category="Raw Materials", reliability_score=78, avg_lead_time_days=25),
        Supplier(id="SUP-007", name="Vantage Freight", country="Singapore", category="Freight", reliability_score=88, avg_lead_time_days=10),
        Supplier(id="SUP-008", name="Crestline Tech", country="Taiwan", category="Electronics", reliability_score=70, avg_lead_time_days=14)
    ]
    for s in suppliers:
        db.add(s)
    db.commit()

    # 2. Historical Prices
    price_histories = [
        # SUP-001 Apex
        SupplierPriceHistory(supplier_id="SUP-001", item_code="ITEM-RESISTOR-10K", avg_unit_price=0.045, sample_count=100, last_updated="2024-01-01T00:00:00Z"),
        SupplierPriceHistory(supplier_id="SUP-001", item_code="ITEM-CAPACITOR-10UF", avg_unit_price=0.12, sample_count=85, last_updated="2024-01-15T00:00:00Z"),
        # SUP-003 GlobalParts
        SupplierPriceHistory(supplier_id="SUP-003", item_code="ITEM-MICROCON-32", avg_unit_price=4.50, sample_count=50, last_updated="2024-02-01T00:00:00Z"),
        # SUP-004 Nexus
        SupplierPriceHistory(supplier_id="SUP-004", item_code="CHEM-SOLVENT-A", avg_unit_price=22.50, sample_count=40, last_updated="2024-01-10T00:00:00Z"),
        # SUP-008 Crestline
        SupplierPriceHistory(supplier_id="SUP-008", item_code="ITEM-SCREEN-7INCH", avg_unit_price=35.00, sample_count=30, last_updated="2024-03-01T00:00:00Z")
    ]
    for ph in price_histories:
        db.add(ph)
    db.commit()

    # 3. Purchase Orders
    pos = [
        # Standard POs
        PurchaseOrder(id="PO-2024-0001", supplier_id="SUP-001", status="invoiced", order_date="2026-05-10", expected_delivery="2026-05-22", total_value=3015.00, notes="Resistors for project Alpha."),
        PurchaseOrder(id="PO-2024-0002", supplier_id="SUP-001", status="paid", order_date="2026-01-05", expected_delivery="2026-01-17", total_value=1200.00, notes="Capacitors stock replenish."),
        PurchaseOrder(id="PO-2024-0003", supplier_id="SUP-002", status="paid", order_date="2026-02-12", expected_delivery="2026-02-20", total_value=3240.00, notes="Freight charges for batch #44."),
        PurchaseOrder(id="PO-2024-0004", supplier_id="SUP-003", status="paid", order_date="2026-03-01", expected_delivery="2026-03-21", total_value=9000.00, notes="Microcontrollers batch."),
        PurchaseOrder(id="PO-2024-0005", supplier_id="SUP-004", status="paid", order_date="2026-03-15", expected_delivery="2026-03-22", total_value=11250.00, notes="Solvent-A bulk buy."),
        PurchaseOrder(id="PO-2024-0006", supplier_id="SUP-005", status="paid", order_date="2026-04-01", expected_delivery="2026-04-16", total_value=18500.00, notes="Factory spares."),
        PurchaseOrder(id="PO-2024-0007", supplier_id="SUP-006", status="paid", order_date="2026-04-15", expected_delivery="2026-05-10", total_value=6400.00, notes="Raw copper material."),
        
        # Anomaly POs
        # PO-2024-0012: GlobalParts split invoice target ($28,000)
        PurchaseOrder(id="PO-2024-0012", supplier_id="SUP-003", status="invoiced", order_date="2026-05-25", expected_delivery="2026-06-15", total_value=28000.00, notes="Bulk microcontroller order for product beta."),
        # PO-2024-0015: Nexus near-identical PO ($10,000 total)
        PurchaseOrder(id="PO-2024-0015", supplier_id="SUP-004", status="invoiced", order_date="2026-06-01", expected_delivery="2026-06-08", total_value=10000.00, notes="Solvent-A regular restocking."),
        # PO-2024-0016: Crestline Tech electronics spend concentrations
        PurchaseOrder(id="PO-2024-0016", supplier_id="SUP-008", status="invoiced", order_date="2026-05-20", expected_delivery="2026-06-03", total_value=30000.00, notes="7-inch touch displays batch A."),
        PurchaseOrder(id="PO-2024-0017", supplier_id="SUP-008", status="invoiced", order_date="2026-05-22", expected_delivery="2026-06-05", total_value=31000.00, notes="7-inch touch displays batch B."),
        # PO-2024-0018: Vantage Freight large invoice target ($22,500)
        PurchaseOrder(id="PO-2024-0018", supplier_id="SUP-007", status="invoiced", order_date="2026-06-10", expected_delivery="2026-06-20", total_value=22500.00, notes="International sea freight shipment shipment-88A."),
        # PO-2024-0019: GlobalParts Round numbers target (no line item details, PO value is $30,000)
        PurchaseOrder(id="PO-2024-0019", supplier_id="SUP-003", status="invoiced", order_date="2026-05-02", expected_delivery="2026-05-22", total_value=30000.00, notes="Consulting and general tooling setup."),
        
        # Overdue POs for Agent follow-ups
        PurchaseOrder(id="PO-2026-0020", supplier_id="SUP-001", status="overdue", order_date="2026-05-15", expected_delivery="2026-06-10", total_value=850.00, reminder_count=0, notes="Express capacitor replacements."),
        PurchaseOrder(id="PO-2026-0021", supplier_id="SUP-002", status="overdue", order_date="2026-05-18", expected_delivery="2026-06-12", total_value=4200.00, reminder_count=1, notes="Urgent air cargo for German batch."),
        PurchaseOrder(id="PO-2026-0022", supplier_id="SUP-003", status="overdue", order_date="2026-05-20", expected_delivery="2026-06-14", total_value=12500.00, reminder_count=2, notes="PCB custom fabrication backlog.")
    ]
    for p in pos:
        db.add(p)
    db.commit()

    # 4. Order Items
    order_items = [
        # PO-2024-0001 (Apex price spike - 50,000 Resistors at $0.0603 instead of $0.045)
        OrderItem(po_id="PO-2024-0001", item_code="ITEM-RESISTOR-10K", description="10k Ohm Metal Film Resistors", quantity=50000, unit_price=0.0603),
        # PO-2024-0002 (Apex standard)
        OrderItem(po_id="PO-2024-0002", item_code="ITEM-CAPACITOR-10UF", description="10uF Electrolytic Capacitors", quantity=10000, unit_price=0.12),
        # PO-2024-0003 (Meridian freight standard)
        OrderItem(po_id="PO-2024-0003", item_code="SRV-FREIGHT", description="Customs Clearance & Trucking Services", quantity=1, unit_price=3240.00),
        # PO-2024-0004 (Globalparts standard)
        OrderItem(po_id="PO-2024-0004", item_code="ITEM-MICROCON-32", description="32-bit Cortex Microcontrollers", quantity=2000, unit_price=4.50),
        # PO-2024-0005 (Nexus solvent standard)
        OrderItem(po_id="PO-2024-0005", item_code="CHEM-SOLVENT-A", description="Industrial Cleaning Solvent Type A", quantity=500, unit_price=22.50),
        # PO-2024-0012 (Globalparts split PO items)
        OrderItem(po_id="PO-2024-0012", item_code="ITEM-MICROCON-32", description="32-bit Cortex Microcontrollers", quantity=6222, unit_price=4.50),
        # PO-2024-0015 (Nexus near identical PO items)
        OrderItem(po_id="PO-2024-0015", item_code="CHEM-SOLVENT-A", description="Industrial Cleaning Solvent Type A", quantity=444, unit_price=22.52),
        # PO-2024-0016 (Crestline Tech electronics spend)
        OrderItem(po_id="PO-2024-0016", item_code="ITEM-SCREEN-7INCH", description="7-inch TFT Capacitive Touch Screen", quantity=857, unit_price=35.00),
        # PO-2024-0017 (Crestline Tech electronics spend)
        OrderItem(po_id="PO-2024-0017", item_code="ITEM-SCREEN-7INCH", description="7-inch TFT Capacitive Touch Screen", quantity=885, unit_price=35.03),
        # PO-2024-0018 (Vantage Freight first invoice PO item)
        OrderItem(po_id="PO-2024-0018", item_code="SRV-FREIGHT", description="Ocean Liner Container Shipment SG-US", quantity=1, unit_price=22500.00)
    ]
    for oi in order_items:
        db.add(oi)
    db.commit()

    # 5. Invoices (35 invoices total)
    # Statuses: approved, paid, pending, escalated
    invoices = [
        # Standard Clean Invoices (Approved or Paid)
        Invoice(id="INV-1001", supplier_id="SUP-001", po_id="PO-2024-0002", amount=1200.00, invoice_date="2026-01-20", status="paid", risk_score=0),
        Invoice(id="INV-1002", supplier_id="SUP-002", po_id="PO-2024-0003", amount=3240.00, invoice_date="2026-02-22", status="paid", risk_score=0),
        Invoice(id="INV-1003", supplier_id="SUP-003", po_id="PO-2024-0004", amount=9000.00, invoice_date="2026-03-25", status="paid", risk_score=0),
        Invoice(id="INV-1004", supplier_id="SUP-004", po_id="PO-2024-0005", amount=11250.00, invoice_date="2026-03-28", status="paid", risk_score=0),
        Invoice(id="INV-1005", supplier_id="SUP-005", po_id="PO-2024-0006", amount=18500.00, invoice_date="2026-04-18", status="paid", risk_score=0),
        Invoice(id="INV-1006", supplier_id="SUP-006", po_id="PO-2024-0007", amount=6400.00, invoice_date="2026-05-12", status="approved", risk_score=0),
        
        # 1. Price Spike Anomaly
        Invoice(id="INV-8821", supplier_id="SUP-001", po_id="PO-2024-0001", amount=3015.00, invoice_date="2026-05-24", status="pending", risk_score=0),
        
        # 2. Exact Duplicate Anomalies
        Invoice(id="INV-9901", supplier_id="SUP-002", po_id="PO-2024-0003", amount=3240.00, invoice_date="2026-05-28", status="pending", risk_score=0),
        Invoice(id="INV-9902", supplier_id="SUP-002", po_id="PO-2024-0003", amount=3240.00, invoice_date="2026-05-28", status="pending", risk_score=0),
        
        # 3. Split Invoicing Anomalies (3 Invoices for PO-2024-0012, each just below $10k manager threshold)
        Invoice(id="INV-3011", supplier_id="SUP-003", po_id="PO-2024-0012", amount=9333.33, invoice_date="2026-06-01", status="pending", risk_score=0),
        Invoice(id="INV-3012", supplier_id="SUP-003", po_id="PO-2024-0012", amount=9333.33, invoice_date="2026-06-01", status="pending", risk_score=0),
        Invoice(id="INV-3013", supplier_id="SUP-003", po_id="PO-2024-0012", amount=9333.33, invoice_date="2026-06-01", status="pending", risk_score=0),
        
        # 4. Near-Identical Pair
        Invoice(id="INV-7741", supplier_id="SUP-004", po_id="PO-2024-0015", amount=4999.97, invoice_date="2026-06-10", status="pending", risk_score=0),
        Invoice(id="INV-7742", supplier_id="SUP-004", po_id="PO-2024-0015", amount=5000.03, invoice_date="2026-06-12", status="pending", risk_score=0),
        
        # 5. Round Number Patterns
        Invoice(id="INV-3021", supplier_id="SUP-003", po_id="PO-2024-0019", amount=10000.00, invoice_date="2026-05-10", status="pending", risk_score=0),
        Invoice(id="INV-3022", supplier_id="SUP-003", po_id="PO-2024-0019", amount=10000.00, invoice_date="2026-05-15", status="pending", risk_score=0),
        Invoice(id="INV-3023", supplier_id="SUP-003", po_id="PO-2024-0019", amount=10000.00, invoice_date="2026-05-20", status="pending", risk_score=0),
        
        # 6. Invoice Without PO (references PO-9999 which does not exist)
        Invoice(id="INV-6610", supplier_id="SUP-006", po_id="PO-9999", amount=7850.00, invoice_date="2026-06-05", status="pending", risk_score=0),
        
        # 7. Spend Concentration
        Invoice(id="INV-4001", supplier_id="SUP-008", po_id="PO-2024-0016", amount=30000.00, invoice_date="2026-05-25", status="pending", risk_score=0),
        Invoice(id="INV-4002", supplier_id="SUP-008", po_id="PO-2024-0017", amount=31000.00, invoice_date="2026-05-28", status="pending", risk_score=0),
        
        # 8. New Supplier, Large Invoice
        Invoice(id="INV-5501", supplier_id="SUP-007", po_id="PO-2024-0018", amount=22500.00, invoice_date="2026-06-18", status="pending", risk_score=0),
    ]
    
    # Fill remaining invoices up to 35 so we have a substantial historical dataset
    # We add 15 extra standard invoices for various suppliers to show historical data
    import random
    random.seed(42)
    start_date = datetime.datetime(2025, 12, 1)
    
    standard_po_list = [f"PO-2024-000{i}" for i in range(2, 8)]
    supplier_list = [f"SUP-00{i}" for i in range(1, 7)] # SUP-001 to SUP-006
    
    for i in range(15):
        inv_id = f"INV-200{i}"
        sup_id = random.choice(supplier_list)
        po_ref = random.choice(standard_po_list)
        amt = round(random.uniform(500, 5000), 2)
        days_offset = i * 10
        inv_date = (start_date + datetime.timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        invoices.append(
            Invoice(id=inv_id, supplier_id=sup_id, po_id=po_ref, amount=amt, invoice_date=inv_date, status="paid", risk_score=0)
        )
        
    for inv in invoices:
        db.add(inv)
        
    db.commit()

    # 6. Seed some historical agent emails to make the UI look rich
    pre_emails = [
        AgentEmail(po_id="PO-2026-0021", supplier_id="SUP-002", direction="outbound", tone="friendly", subject="Outbound follow-up for PO-2026-0021", body="Dear Meridian Logistics, we are writing to friendly check in on the delivery status of PO-2026-0021.", sent_at="2026-06-15T09:00:00Z", is_reply_simulated=0),
        AgentEmail(po_id="PO-2026-0022", supplier_id="SUP-003", direction="outbound", tone="friendly", subject="Outbound follow-up for PO-2026-0022", body="Dear GlobalParts, just checking in regarding PO-2026-0022 delivery timing. Let us know when it will ship.", sent_at="2026-06-12T10:00:00Z", is_reply_simulated=0),
        AgentEmail(po_id="PO-2026-0022", supplier_id="SUP-003", direction="outbound", tone="firm", subject="URGENT outreach: PO-2026-0022 delay", body="Dear GlobalParts, this is our second follow-up. The components are critical for our production.", sent_at="2026-06-18T14:30:00Z", is_reply_simulated=0)
    ]
    for email in pre_emails:
        db.add(email)
        
    # 7. Seed Initial Audit Log Entry
    initial_log = AuditLog(
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
        actor="system",
        action="SYSTEM_BOOT",
        entity_type="system",
        entity_id="VIGIL-SERVER",
        severity="low",
        reasoning="Vigil Procurement Audit engine initialized. Databases created and seeded successfully.",
        confidence=1.0
    )
    db.add(initial_log)
    
    db.commit()
    print("Database seeding complete.")
