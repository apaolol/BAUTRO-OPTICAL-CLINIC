from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.billing import InvoiceCreate
from services.billing_service import get_all_invoices, get_invoice, create_invoice
from database import get_db

router = APIRouter()

@router.get("/")
def list_invoices(db: Session = Depends(get_db)):
    return get_all_invoices(db)

@router.get("/{invoice_number}")
def retrieve_invoice(invoice_number: str, db: Session = Depends(get_db)):
    return get_invoice(db, invoice_number)

@router.post("/")
def add_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    return create_invoice(db, payload)
