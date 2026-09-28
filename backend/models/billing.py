from pydantic import BaseModel
from typing import Optional

class InvoiceCreate(BaseModel):
    patient_number: str
    subtotal: float
    discount: float
    total: float
    amount_paid: float
    balance: float
    payment_method: Optional[str] = None
    status: Optional[str] = "Pending"