from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    full_name: str
    address: Optional[str] = None
    contact_number: str
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    occupation: Optional[str] = None
    emergency_contact: Optional[str] = None

    chief_complaint: Optional[str] = None
    medical_history: Optional[str] = None
    ocular_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None

    visual_acuity_od: Optional[str] = None
    visual_acuity_os: Optional[str] = None
    bcva_od: Optional[str] = None
    bcva_os: Optional[str] = None

    iop: Optional[str] = None
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    other_tests: Optional[str] = None