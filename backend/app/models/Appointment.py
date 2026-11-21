import datetime

from sqlmodel import Field, SQLModel, Text


class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: int | None = Field(default=None, primary_key=True, index=True)
    appointment_number: str | None = Field(default=None, nullable=True, index=True, unique=True)
    patient_number: str | None = Field(default=None, nullable=True, index=True)
    date_time: datetime.datetime | None = Field(default=None, nullable=True)
    optometrist: str | None = Field(default=None, nullable=True)
    status: str | None = Field(default=None, nullable=True)
    notes: str | None = Field(default=None, nullable=True, sa_type=Text)
