import logging
import re
from sqlalchemy.orm import Session
from models import Supplier, PurchaseOrder, Invoice, AuditFinding, AuditLog, AgentEmail
from logic.vector_store import search_documents
from logic.deepseek_client import chat_completion

logger = logging.getLogger("vigil-rag")

SYSTEM_PROMPT = """You are Vigil, an AI financial audit assistant for a procurement business.
You answer questions grounded strictly in the provided context — supplier data,
purchase orders, invoices, audit findings, and communications. 
Be concise, precise, and flag anything suspicious. 
Always cite source IDs in brackets (e.g. [INV-9901], [SUP-002], [PO-2024-0012], [LOG-00042]) when discussing specific entities.
Do not make up facts. If the information is not in the context, state that you do not have that data."""

def query_sql_facts(db: Session, query: str) -> str:
    """
    Scans the query for structured finance intents and extracts concrete metrics from SQLite.
    """
    query_lower = query.lower()
    facts = []
    
    # 1. Identify supplier mentioned
    supplier_id = None
    supplier_name = None
    suppliers = db.query(Supplier).all()
    for s in suppliers:
        short_name = s.name.split()[0].lower() # e.g. "apex"
        if short_name in query_lower or s.name.lower() in query_lower:
            supplier_id = s.id
            supplier_name = s.name
            break
            
    # 2. Spend analytics
    if any(k in query_lower for k in ["spend", "spent", "total value", "amount", "cost"]):
        if supplier_id:
            invoices = db.query(Invoice).filter(Invoice.supplier_id == supplier_id).all()
            total_spend = sum(inv.amount for inv in invoices)
            facts.append(f"SQL Fact: Total spend with supplier {supplier_name} ({supplier_id}) is ${total_spend:,.2f} across {len(invoices)} invoices.")
        else:
            invoices = db.query(Invoice).all()
            total_spend = sum(inv.amount for inv in invoices)
            facts.append(f"SQL Fact: Total spend across all suppliers in the database is ${total_spend:,.2f} across {len(invoices)} invoices.")
            
    # 3. Invoice count and status analytics
    if any(k in query_lower for k in ["how many invoices", "invoice count", "number of invoices"]):
        if supplier_id:
            count = db.query(Invoice).filter(Invoice.supplier_id == supplier_id).count()
            facts.append(f"SQL Fact: Supplier {supplier_name} ({supplier_id}) has {count} invoices in the system.")
        else:
            count = db.query(Invoice).count()
            facts.append(f"SQL Fact: There are {count} total invoices in the database.")
            
    # 4. Overdue purchase orders
    if any(k in query_lower for k in ["order", "purchase order", "po"]):
        if "overdue" in query_lower:
            if supplier_id:
                count = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id, PurchaseOrder.status == "overdue").count()
                facts.append(f"SQL Fact: Supplier {supplier_name} ({supplier_id}) has {count} overdue purchase orders.")
            else:
                count = db.query(PurchaseOrder).filter(PurchaseOrder.status == "overdue").count()
                facts.append(f"SQL Fact: There are {count} total overdue purchase orders in the system.")
        else:
            if supplier_id:
                count = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).count()
                facts.append(f"SQL Fact: Supplier {supplier_name} ({supplier_id}) has {count} total purchase orders.")
            else:
                count = db.query(PurchaseOrder).count()
                facts.append(f"SQL Fact: There are {count} total purchase orders in the database.")
                
    # 5. Vendor reliability
    if "reliability" in query_lower or "reliability score" in query_lower:
        if supplier_id:
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            facts.append(f"SQL Fact: {supplier_name} ({supplier_id}) has a reliability score of {supplier.reliability_score}/100 and an average lead time of {supplier.avg_lead_time_days} days.")
        else:
            suppliers_list = db.query(Supplier).all()
            details = [f"{s.name} ({s.id}): {s.reliability_score}/100" for s in suppliers_list]
            facts.append("SQL Fact: Supplier reliability scores: " + ", ".join(details))
            
    # 6. Specific invoice lookup
    invoice_match = re.search(r"inv-\d+", query_lower)
    if invoice_match:
        inv_id = invoice_match.group(0).upper()
        invoice = db.query(Invoice).filter(Invoice.id == inv_id).first()
        if invoice:
            facts.append(f"SQL Fact: Invoice {invoice.id} amount is ${invoice.amount:,.2f}, date is {invoice.invoice_date}, PO reference is {invoice.po_id or 'None'}, risk score is {invoice.risk_score}/100, status is '{invoice.status}'.")

    return "\n".join(facts)

def execute_rag_query(db: Session, query: str) -> dict:
    """
    Executes the dual-layer RAG query pipeline.
    """
    logger.info(f"RAG query received: '{query}'")
    
    # 1. Fetch SQL layer facts
    sql_context = query_sql_facts(db, query)
    
    # 2. Fetch Vector layer chunks
    vector_results = search_documents(query, n_results=5)
    
    vector_context_list = []
    vector_metadata_list = []
    
    if vector_results and "documents" in vector_results and len(vector_results["documents"][0]) > 0:
        documents = vector_results["documents"][0]
        metadatas = vector_results["metadatas"][0]
        ids = vector_results["ids"][0]
        
        for doc, meta, doc_id in zip(documents, metadatas, ids):
            doc_type = meta.get("type", "unknown")
            ref_id = ""
            if doc_type == "invoice":
                ref_id = meta.get("invoice_id", "")
            elif doc_type == "supplier_profile":
                ref_id = meta.get("supplier_id", "")
            elif doc_type == "order_summary":
                ref_id = meta.get("po_id", "")
            elif doc_type == "email":
                ref_id = f"email_{meta.get('email_id', '')}"
            elif doc_type == "audit_finding":
                ref_id = f"finding_{meta.get('finding_id', '')}"
                
            vector_context_list.append(f"[Source: {doc_type} {ref_id}] {doc}")
            vector_metadata_list.append({
                "id": ref_id or doc_id,
                "type": doc_type,
                "text_snippet": doc[:160] + "..." if len(doc) > 160 else doc
            })
            
    vector_context = "\n".join(vector_context_list)
    
    # 3. Assemble full context
    full_context = ""
    if sql_context:
        full_context += f"Structured DB Facts:\n{sql_context}\n\n"
    if vector_context:
        full_context += f"Retrieved Context Chunks:\n{vector_context}\n"
        
    if not full_context.strip():
        full_context = "No direct facts or context found."
        
    # 4. Request DeepSeek to synthesize response
    prompt_user = f"Context:\n{full_context}\n\nQuestion: {query}"
    answer = chat_completion(system=SYSTEM_PROMPT, user=prompt_user, temperature=0.3)
    
    # 5. Extract cited sources to return structured citation links
    # Match strings inside square brackets like [INV-9901], [SUP-001]
    citations = re.findall(r"\[([A-Z0-9\-]+)\]", answer)
    citations_set = set(citations)
    
    # Create final sources list based on metadata or matched citations
    final_sources = []
    seen_source_ids = set()
    
    # First, match items from metadata that were explicitly mentioned in the text or citations
    for item in vector_metadata_list:
        meta_id = item["id"]
        # If the ID (e.g. SUP-001) is cited, or is inside the text, add it
        if meta_id in citations_set or meta_id in answer or meta_id.lower() in query.lower():
            if meta_id not in seen_source_ids:
                final_sources.append(item)
                seen_source_ids.add(meta_id)
                
    # If no sources matched but we retrieved some, add top 2 retrieved chunks as general context
    if not final_sources and vector_metadata_list:
        for item in vector_metadata_list[:2]:
            final_sources.append(item)
            
    return {
        "answer": answer,
        "sources": final_sources
    }
