from fastapi import APIRouter, HTTPException , status
from app.models.Appointment import Appointment
from sqlmodel import Session, select

router = APIRouter(prefix="/Appointment", tags=["Appointment"])
from ..database import engine

@router.get("/", summary="Get all Appointment")
async def get_all():
    with Session(engine) as session:
        statement = select(Appointment)
        results = session.exec(statement).all()
        return results



@router.post("/", summary="Create a new Appointment", status_code=status.HTTP_201_CREATED)
async def create_item(_Appointment : Appointment):
    with Session(engine) as session:
        session.add(_Appointment)
        session.commit()
        session.refresh(_Appointment)
        return _Appointment
