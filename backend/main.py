import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from routers import data, audit, agent, rag
from data.seed import db_is_seeded, seed_database
from logic.audit_engine import run_full_audit
from logic.vector_store import index_document

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vigil-main")

app = FastAPI(
    title="Vigil Procurement AI Backend",
    description="FastAPI service for Vigil procurement intelligence platform, providing rule-based audits, RAG search, and autonomous vendor reminders.",
    version="1.0.0"
)

# CORS configuration to allow local development with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(data.router)
app.include_router(audit.router)
app.include_router(agent.router)
app.include_router(rag.router)

@app.on_event("startup")
def startup_db_init():
    """
    Ensures SQLite tables exist, seeds them if empty, runs the first audit scan,
    and performs the initial embedding indexing.
    """
    logger.info("Starting Vigil Backend initialization...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        if not db_is_seeded(db):
            logger.info("Database is empty. Initiating seed process...")
            seed_database(db)
            
            # Run initial audit to compute risk scores for seeded invoices
            logger.info("Running initial financial audits on seeded invoices...")
            run_full_audit(db)
            
            # Embed seeded data to ChromaDB
            logger.info("Performing initial semantic indexing in ChromaDB...")
            
            # Suppliers
            suppliers = db.query(data.models.Supplier).all()
            for s in suppliers:
                avg_prices = db.query(data.models.SupplierPriceHistory).filter(data.models.SupplierPriceHistory.supplier_id == s.id).all()
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
                
            # Purchase Orders
            orders = db.query(data.models.PurchaseOrder).all()
            for po in orders:
                items = db.query(data.models.OrderItem).filter(data.models.OrderItem.po_id == po.id).all()
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
                
            # Invoices + Findings (run_full_audit does indexing for invoices and their findings, so we are covered there!)
            logger.info("Seeding and vector indexing complete.")
        else:
            logger.info("Database is already seeded. Ready.")
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}", exc_info=True)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "app": "Vigil Procurement AI Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }
