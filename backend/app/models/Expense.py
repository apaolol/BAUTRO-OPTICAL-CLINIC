import datetime

from sqlmodel import Field, SQLModel, Text


class Expense(SQLModel, table=True):
    __tablename__ = "expenses"

    id: int | None = Field(default=None, primary_key=True, index=True)
    date: datetime.date | None = Field(default_factory=datetime.date.today, nullable=True)
    category: str | None = Field(default=None, nullable=True)
    description: str | None = Field(default=None, nullable=True)
    amount: float | None = Field(default=0.0, nullable=True)
    payment_method: str | None = Field(default=None, nullable=True)
    notes: str | None = Field(default=None, nullable=True, sa_type=Text)
