import datetime

from fastapi import APIRouter
from app.models.Billing import Billing, InvoiceCreate
from app.internal.ids import generate_code
from sqlmodel import Session, func, select

router = APIRouter(prefix="/billing", tags=["Billing"])
from ..database import engine

@router.get("/", summary="Get all Billing")
async def get_all():
    with Session(engine) as session:
        statement = select(Billing)
        results = session.exec(statement).all()
        return results



@router.get("/{invoice_number}", summary="Get Billing by invoice number")
async def get_invoice(invoice_number: str):
    with Session(engine) as session:
        statement = select(Billing).where(Billing.invoice_number == invoice_number)
        return session.exec(statement).first()


@router.post("/", summary="Create a new Billing")
async def create_item(payload: InvoiceCreate):
    with Session(engine) as session:
        count = session.exec(select(func.count()).select_from(Billing)).one()
        invoice = Billing(
            **payload.model_dump(),
            invoice_number=generate_code("INV", count),
            date=datetime.date.today(),
        )
        session.add(invoice)
        session.commit()
        session.refresh(invoice)
        return {"invoice_number": invoice.invoice_number}
