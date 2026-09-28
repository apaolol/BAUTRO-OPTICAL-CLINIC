from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.prescription import PrescriptionCreate
from services.prescription_service import get_all_prescriptions, get_prescription, create_prescription
from database import get_db

router = APIRouter()

@router.get("/")
def list_prescriptions(db: Session = Depends(get_db)):
    return get_all_prescriptions(db)

@router.get("/{prescription_number}")
def retrieve_prescription(prescription_number: str, db: Session = Depends(get_db)):
    return get_prescription(db, prescription_number)

@router.post("/")
def add_prescription(payload: PrescriptionCreate, db: Session = Depends(get_db)):
    return create_prescription(db, payload)
