import datetime

from sqlmodel import Field, SQLModel, Text


class Patient(SQLModel, table=True):
    __tablename__ = "patients"

    id: int | None = Field(default=None, primary_key=True, index=True)
    patient_number: str | None = Field(default=None, nullable=True, index=True, unique=True)
    date_created: datetime.date | None = Field(default_factory=datetime.date.today, nullable=True)
    full_name: str | None = Field(default=None, nullable=True, index=True)
    address: str | None = Field(default=None, nullable=True)
    contact_number: str | None = Field(default=None, nullable=True)
    date_of_birth: str | None = Field(default=None, nullable=True)
    age: int | None = Field(default=None, nullable=True)
    sex: str | None = Field(default=None, nullable=True)
    occupation: str | None = Field(default=None, nullable=True)
    emergency_contact: str | None = Field(default=None, nullable=True)
    chief_complaint: str | None = Field(default=None, nullable=True, sa_type=Text)
    medical_history: str | None = Field(default=None, nullable=True, sa_type=Text)
    ocular_history: str | None = Field(default=None, nullable=True, sa_type=Text)
    allergies: str | None = Field(default=None, nullable=True, sa_type=Text)
    current_medications: str | None = Field(default=None, nullable=True, sa_type=Text)
    visual_acuity_od: str | None = Field(default=None, nullable=True)
    visual_acuity_os: str | None = Field(default=None, nullable=True)
    bcva_od: str | None = Field(default=None, nullable=True)
    bcva_os: str | None = Field(default=None, nullable=True)
    iop: str | None = Field(default=None, nullable=True)
    diagnosis: str | None = Field(default=None, nullable=True)
    clinical_notes: str | None = Field(default=None, nullable=True, sa_type=Text)
    other_tests: str | None = Field(default=None, nullable=True, sa_type=Text)


class PatientCreate(SQLModel):
    full_name: str
    address: str | None = None
    contact_number: str
    date_of_birth: str | None = None
    age: int | None = None
    sex: str | None = None
    occupation: str | None = None
    emergency_contact: str | None = None
    chief_complaint: str | None = None
    medical_history: str | None = None
    ocular_history: str | None = None
    allergies: str | None = None
    current_medications: str | None = None
    visual_acuity_od: str | None = None
    visual_acuity_os: str | None = None
    bcva_od: str | None = None
    bcva_os: str | None = None
    iop: str | None = None
    diagnosis: str | None = None
    clinical_notes: str | None = None
    other_tests: str | None = None
