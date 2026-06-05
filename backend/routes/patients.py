from fastapi import APIRouter
from models.patient import PatientCreate
from services.patient_service import (
    get_all_patients,
    get_patient,
    create_patient,
)

router = APIRouter()


@router.get("/")
def list_patients():
    return get_all_patients()


@router.get("/{patient_number}")
def retrieve_patient(patient_number: str):
    return get_patient(patient_number)


@router.post("/")
def add_patient(payload: PatientCreate):
    return create_patient(payload)