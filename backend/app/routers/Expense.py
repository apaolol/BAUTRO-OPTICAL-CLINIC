from fastapi import APIRouter, HTTPException , status
from app.models.Expense import Expense
from sqlmodel import Session, select

router = APIRouter(prefix="/Expense", tags=["Expense"])
from ..database import engine

@router.get("/", summary="Get all Expense")
async def get_all():
    with Session(engine) as session:
        statement = select(Expense)
        results = session.exec(statement).all()
        return results



@router.post("/", summary="Create a new Expense", status_code=status.HTTP_201_CREATED)
async def create_item(_Expense : Expense):
    with Session(engine) as session:
        session.add(_Expense)
        session.commit()
        session.refresh(_Expense)
        return _Expense
