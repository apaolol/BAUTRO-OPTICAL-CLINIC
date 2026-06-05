from fastapi import APIRouter
from models.prescription import PrescriptionCreate
from services.prescription_service import (
    get_all_prescriptions,
    get_prescriptions_by_patient,
    create_prescription,
)

router = APIRouter()


@router.get("/")
def list_prescriptions():
    return get_all_prescriptions()


@router.get("/{patient_number}")
def list_prescriptions_by_patient(patient_number: str):
    return get_prescriptions_by_patient(patient_number)


@router.post("/")
def add_prescription(payload: PrescriptionCreate):
    return create_prescription(payload)