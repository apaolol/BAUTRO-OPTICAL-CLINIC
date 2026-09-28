from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.patient import PatientCreate
from services.patient_service import get_all_patients, get_patient, create_patient
from database import get_db

router = APIRouter()

@router.get("/")
def list_patients(db: Session = Depends(get_db)):
    return get_all_patients(db)

@router.get("/{patient_number}")
def retrieve_patient(patient_number: str, db: Session = Depends(get_db)):
    return get_patient(db, patient_number)

@router.post("/")
def add_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    return create_patient(db, payload)
