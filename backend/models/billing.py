from pydantic import BaseModel


class BillingCreate(BaseModel):
    patient_number: str

    product_code: str
    quantity: int

    unit_price: float

    payment_method: str