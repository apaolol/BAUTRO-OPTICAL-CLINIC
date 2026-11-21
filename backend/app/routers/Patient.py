import datetime

from fastapi import APIRouter
from app.models.Patient import Patient, PatientCreate
from app.internal.ids import generate_code
from sqlmodel import Session, func, select

router = APIRouter(prefix="/patients", tags=["Patient"])
from ..database import engine

@router.get("/", summary="Get all Patient")
async def get_all():
    with Session(engine) as session:
        statement = select(Patient)
        results = session.exec(statement).all()
        return results



@router.get("/{patient_number}", summary="Get Patient by patient number")
async def get_patient(patient_number: str):
    with Session(engine) as session:
        statement = select(Patient).where(Patient.patient_number == patient_number)
        return session.exec(statement).first()


@router.post("/", summary="Create a new Patient")
async def create_item(payload: PatientCreate):
    with Session(engine) as session:
        count = session.exec(select(func.count()).select_from(Patient)).one()
        patient = Patient(
            **payload.model_dump(),
            patient_number=generate_code("P", count),
            date_created=datetime.date.today(),
        )
        session.add(patient)
        session.commit()
        session.refresh(patient)
        return {"patient_number": patient.patient_number}
