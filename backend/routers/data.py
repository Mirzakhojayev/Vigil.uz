from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from data.seed import seed_database, db_is_seeded
from logic.audit_engine import run_full_audit
from logic.vector_store import reset_vector_store, index_document

router = APIRouter(prefix="/api/data", tags=["data"])

@router.get("/suppliers", response_model=List[schemas.SupplierBase])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

@router.get("/orders", response_model=List[schemas.PurchaseOrderWithSupplier])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).all()

@router.get("/orders/{po_id}", response_model=schemas.PurchaseOrderWithSupplier)
def get_order(po_id: str, db: Session = Depends(get_db)):
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/price-history", response_model=List[schemas.SupplierPriceHistoryBase])
def get_price_history(db: Session = Depends(get_db)):
    return db.query(models.SupplierPriceHistory).all()

@router.post("/reset")
def reset_database(db: Session = Depends(get_db)):
    """
    Clears all tables, recreates them, seeds them, and reruns audits and indexing.
    """
    # 1. Clear database
    models.Base.metadata.drop_all(bind=db.get_bind())
    models.Base.metadata.create_all(bind=db.get_bind())
    
    # 2. Seed database
    seed_database(db)
    
    # 3. Reset Vector Store
    reset_vector_store()
    
    # 4. Index Static Supplier Info
    suppliers = db.query(models.Supplier).all()
    for s in suppliers:
        avg_prices = db.query(models.SupplierPriceHistory).filter(models.SupplierPriceHistory.supplier_id == s.id).all()
        hist_prices_text = "; ".join([f"{ap.item_code} historical average unit price is ${ap.avg_unit_price:,.3f}" for ap in avg_prices])
        
        doc_text = f"Supplier Profile: {s.name} ({s.id}) from {s.country}. Category: {s.category}. Reliability Score: {s.reliability_score}/100. Avg Lead Time: {s.avg_lead_time_days} days. {hist_prices_text}"
        
        index_document(
            doc_id=f"supplier_{s.id}",
            text=doc_text,
            metadata={
                "type": "supplier_profile",
                "supplier_id": s.id,
                "category": s.category,
                "name": s.name
            }
        )
        
    # Index Static Purchase Orders
    orders = db.query(models.PurchaseOrder).all()
    for po in orders:
        items = db.query(models.OrderItem).filter(models.OrderItem.po_id == po.id).all()
        items_text = "; ".join([f"{item.quantity}x {item.description} ({item.item_code}) at ${item.unit_price:,.2f}/unit" for item in items])
        
        doc_text = f"Purchase Order {po.id} for {po.supplier.name if po.supplier else 'Unknown Supplier'}. Status: {po.status}. Order Date: {po.order_date}, Expected Delivery: {po.expected_delivery}. Value: ${po.total_value:,.2f}. Items: {items_text if items_text else 'None'}. Notes: {po.notes or 'None'}"
        
        index_document(
            doc_id=f"po_{po.id}",
            text=doc_text,
            metadata={
                "type": "order_summary",
                "po_id": po.id,
                "supplier_id": po.supplier_id,
                "status": po.status,
                "total_value": po.total_value
            }
        )
        
    # 5. Run Audit on all invoices
    run_full_audit(db)
    
    return {"status": "success", "message": "Database and Vector store reset and re-seeded successfully."}
