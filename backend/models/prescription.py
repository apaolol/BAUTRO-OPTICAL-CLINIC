from pydantic import BaseModel
from typing import Optional


class PrescriptionCreate(BaseModel):
    patient_number: str

    od_sphere: Optional[str] = None
    od_cylinder: Optional[str] = None
    od_axis: Optional[str] = None
    od_add: Optional[str] = None
    od_pd: Optional[str] = None

    os_sphere: Optional[str] = None
    os_cylinder: Optional[str] = None
    os_axis: Optional[str] = None
    os_add: Optional[str] = None
    os_pd: Optional[str] = None

    lens_type: Optional[str] = None
    lens_brand: Optional[str] = None
    lens_coating: Optional[str] = None

    frame_brand: Optional[str] = None
    frame_model: Optional[str] = None

    notes: Optional[str] = None