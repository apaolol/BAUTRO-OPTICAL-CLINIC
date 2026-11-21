import datetime

from sqlmodel import Field, SQLModel


class Billing(SQLModel, table=True):
    __tablename__ = "billing"

    id: int | None = Field(default=None, primary_key=True, index=True)
    invoice_number: str | None = Field(default=None, nullable=True, index=True, unique=True)
    patient_number: str | None = Field(default=None, nullable=True, index=True)
    date: datetime.date | None = Field(default_factory=datetime.date.today, nullable=True)
    subtotal: float | None = Field(default=0.0, nullable=True)
    discount: float | None = Field(default=0.0, nullable=True)
    total: float | None = Field(default=0.0, nullable=True)
    amount_paid: float | None = Field(default=0.0, nullable=True)
    balance: float | None = Field(default=0.0, nullable=True)
    payment_method: str | None = Field(default=None, nullable=True)
    status: str | None = Field(default=None, nullable=True)


class InvoiceCreate(SQLModel):
    patient_number: str
    subtotal: float
    discount: float
    total: float
    amount_paid: float
    balance: float
    payment_method: str | None = None
    status: str | None = 'Pending'
