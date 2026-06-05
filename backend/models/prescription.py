from pydantic import BaseModel
from typing import Optional


class PrescriptionCreate(BaseModel):
    patient_number: str

    od_sphere: Optional[str] = None
    od_cylinder: Optional[str] = None
    od_axis: Optional[str] = None
    od_add: Optional[str] = None

    os_sphere: Optional[str] = None
    os_cylinder: Optional[str] = None
    os_axis: Optional[str] = None
    os_add: Optional[str] = None

    distance_pd: Optional[str] = None
    near_pd: Optional[str] = None

    right_seg_height: Optional[str] = None
    left_seg_height: Optional[str] = None

    right_pupil_height: Optional[str] = None
    left_pupil_height: Optional[str] = None

    lens_type: Optional[str] = None
    lens_brand: Optional[str] = None
    lens_coating: Optional[str] = None
    tint: Optional[str] = None

    frame_model: Optional[str] = None
    frame_brand: Optional[str] = None

    special_instructions: Optional[str] = None