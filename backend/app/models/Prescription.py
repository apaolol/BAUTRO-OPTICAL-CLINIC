import datetime

from sqlmodel import Field, SQLModel, Text


class Prescription(SQLModel, table=True):
    __tablename__ = "prescriptions"

    id: int | None = Field(default=None, primary_key=True, index=True)
    prescription_number: str | None = Field(default=None, nullable=True, index=True, unique=True)
    patient_number: str | None = Field(default=None, nullable=True, index=True)
    date: datetime.date | None = Field(default_factory=datetime.date.today, nullable=True)
    od_sphere: str | None = Field(default=None, nullable=True)
    od_cylinder: str | None = Field(default=None, nullable=True)
    od_axis: str | None = Field(default=None, nullable=True)
    od_add: str | None = Field(default=None, nullable=True)
    od_pd: str | None = Field(default=None, nullable=True)
    os_sphere: str | None = Field(default=None, nullable=True)
    os_cylinder: str | None = Field(default=None, nullable=True)
    os_axis: str | None = Field(default=None, nullable=True)
    os_add: str | None = Field(default=None, nullable=True)
    os_pd: str | None = Field(default=None, nullable=True)
    lens_type: str | None = Field(default=None, nullable=True)
    lens_brand: str | None = Field(default=None, nullable=True)
    lens_coating: str | None = Field(default=None, nullable=True)
    frame_brand: str | None = Field(default=None, nullable=True)
    frame_model: str | None = Field(default=None, nullable=True)
    notes: str | None = Field(default=None, nullable=True, sa_type=Text)


class PrescriptionCreate(SQLModel):
    patient_number: str
    od_sphere: str | None = None
    od_cylinder: str | None = None
    od_axis: str | None = None
    od_add: str | None = None
    od_pd: str | None = None
    os_sphere: str | None = None
    os_cylinder: str | None = None
    os_axis: str | None = None
    os_add: str | None = None
    os_pd: str | None = None
    lens_type: str | None = None
    lens_brand: str | None = None
    lens_coating: str | None = None
    frame_brand: str | None = None
    frame_model: str | None = None
    notes: str | None = None
