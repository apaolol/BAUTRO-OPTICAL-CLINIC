import datetime

from fastapi import APIRouter
from app.models.Prescription import Prescription, PrescriptionCreate
from app.internal.ids import generate_code
from sqlmodel import Session, func, select

router = APIRouter(prefix="/prescriptions", tags=["Prescription"])
from ..database import engine

@router.get("/", summary="Get all Prescription")
async def get_all():
    with Session(engine) as session:
        statement = select(Prescription)
        results = session.exec(statement).all()
        return results



@router.get("/{prescription_number}", summary="Get Prescription by prescription number")
async def get_prescription(prescription_number: str):
    with Session(engine) as session:
        statement = select(Prescription).where(Prescription.prescription_number == prescription_number)
        return session.exec(statement).first()


@router.post("/", summary="Create a new Prescription")
async def create_item(payload: PrescriptionCreate):
    with Session(engine) as session:
        count = session.exec(select(func.count()).select_from(Prescription)).one()
        prescription = Prescription(
            **payload.model_dump(),
            prescription_number=generate_code("RX", count),
            date=datetime.date.today(),
        )
        session.add(prescription)
        session.commit()
        session.refresh(prescription)
        return {"prescription_number": prescription.prescription_number}
