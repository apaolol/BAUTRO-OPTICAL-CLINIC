from fastapi import APIRouter
from models.billing import BillingCreate
from services.billing_service import (
    get_all_billing,
    get_billing_by_patient,
    create_invoice,
)

router = APIRouter()


@router.get("/")
def list_billing():
    return get_all_billing()


@router.get("/{patient_number}")
def list_billing_by_patient(patient_number: str):
    return get_billing_by_patient(patient_number)


@router.post("/")
def add_invoice(payload: BillingCreate):
    return create_invoice(payload)