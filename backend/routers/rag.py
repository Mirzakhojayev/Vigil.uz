from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import schemas
from logic.rag_logic import execute_rag_query

router = APIRouter(prefix="/api/rag", tags=["rag"])

@router.post("/query", response_model=schemas.RAGQueryResponse)
def query_rag(payload: schemas.RAGQueryRequest, db: Session = Depends(get_db)):
    """
    Submits a user query to the dual-layer RAG processor.
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    try:
        result = execute_rag_query(db, payload.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing RAG query: {str(e)}")
