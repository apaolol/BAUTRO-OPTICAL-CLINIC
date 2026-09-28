from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.dashboard_service import get_dashboard_metrics
from database import get_db

router = APIRouter()

@router.get("/")
def retrieve_dashboard_metrics(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)
