from sqlalchemy.orm import Session
from models.orm import Billing
from utils.ids import generate_code
import datetime

def get_all_invoices(db: Session):
    return db.query(Billing).all()

def get_invoice(db: Session, invoice_number: str):
    return db.query(Billing).filter(Billing.invoice_number == invoice_number).first()

def create_invoice(db: Session, data):
    count = db.query(Billing).count()
    invoice_number = generate_code("INV", count)
    
    new_invoice = Billing(
        invoice_number=invoice_number,
        patient_number=data.patient_number,
        date=datetime.date.today(),
        subtotal=data.subtotal,
        discount=data.discount,
        total=data.total,
        amount_paid=data.amount_paid,
        balance=data.balance,
        payment_method=data.payment_method,
        status=data.status
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return {"invoice_number": new_invoice.invoice_number}
