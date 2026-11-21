import datetime

from fastapi import APIRouter
from sqlmodel import Session, select
from app.database import engine
from app.models.Patient import Patient
from app.models.Prescription import Prescription
from app.models.Inventory import Inventory
from app.models.Billing import Billing

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
@router.get("/")
async def read_root():
    with Session(engine) as session:
        patients = session.exec(select(Patient)).all()
        prescriptions = session.exec(select(Prescription)).all()
        inventory = session.exec(select(Inventory)).all()
        invoices = session.exec(select(Billing)).all()
        today = datetime.date.today()
        low_stock_items = [item for item in inventory
                           if item.quantity is not None and item.reorder_level is not None
                           and item.quantity <= item.reorder_level]
        return {
            "total_patients": len(patients),
            "total_prescriptions": len(prescriptions),
            "total_inventory_items": len(inventory),
            "today_revenue": float(sum(invoice.amount_paid for invoice in invoices
                                       if invoice.date == today and invoice.amount_paid is not None)),
            "total_revenue": float(sum(invoice.amount_paid for invoice in invoices
                                       if invoice.amount_paid is not None)),
            "low_stock_count": len(low_stock_items),
            "low_stock_items": low_stock_items,
        }
