import os

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content.strip() + "\n")

routes_patients = """
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
"""

services_patient = """
from sqlalchemy.orm import Session
from models.orm import Patient
from utils.ids import generate_code
import datetime

def get_all_patients(db: Session):
    return db.query(Patient).all()

def get_patient(db: Session, patient_number: str):
    return db.query(Patient).filter(Patient.patient_number == patient_number).first()

def create_patient(db: Session, data):
    count = db.query(Patient).count()
    patient_number = generate_code("P", count)
    
    new_patient = Patient(
        patient_number=patient_number,
        date_created=datetime.date.today(),
        full_name=data.full_name,
        address=data.address,
        contact_number=data.contact_number,
        date_of_birth=data.date_of_birth,
        age=data.age,
        sex=data.sex,
        occupation=data.occupation,
        emergency_contact=data.emergency_contact,
        chief_complaint=data.chief_complaint,
        medical_history=data.medical_history,
        ocular_history=data.ocular_history,
        allergies=data.allergies,
        current_medications=data.current_medications,
        visual_acuity_od=data.visual_acuity_od,
        visual_acuity_os=data.visual_acuity_os,
        bcva_od=data.bcva_od,
        bcva_os=data.bcva_os,
        iop=data.iop,
        diagnosis=data.diagnosis,
        clinical_notes=data.clinical_notes,
        other_tests=data.other_tests
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return {"patient_number": new_patient.patient_number}
"""

routes_prescriptions = """
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
"""

services_prescription = """
from sqlalchemy.orm import Session
from models.orm import Prescription
from utils.ids import generate_code
import datetime

def get_all_prescriptions(db: Session):
    return db.query(Prescription).all()

def get_prescription(db: Session, prescription_number: str):
    return db.query(Prescription).filter(Prescription.prescription_number == prescription_number).first()

def create_prescription(db: Session, data):
    count = db.query(Prescription).count()
    prescription_number = generate_code("RX", count)
    
    new_rx = Prescription(
        prescription_number=prescription_number,
        patient_number=data.patient_number,
        date=datetime.date.today(),
        od_sphere=data.od_sphere,
        od_cylinder=data.od_cylinder,
        od_axis=data.od_axis,
        od_add=data.od_add,
        od_pd=data.od_pd,
        os_sphere=data.os_sphere,
        os_cylinder=data.os_cylinder,
        os_axis=data.os_axis,
        os_add=data.os_add,
        os_pd=data.os_pd,
        lens_type=data.lens_type,
        frame_brand=data.frame_brand,
        frame_model=data.frame_model,
        notes=data.notes
    )
    db.add(new_rx)
    db.commit()
    db.refresh(new_rx)
    return {"prescription_number": new_rx.prescription_number}
"""

routes_inventory = """
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.inventory_service import get_all_items, add_item, update_item_quantity
from database import get_db
from models.inventory import InventoryCreate

router = APIRouter()

@router.get("/")
def list_inventory(db: Session = Depends(get_db)):
    return get_all_items(db)

@router.post("/")
def create_item(payload: InventoryCreate, db: Session = Depends(get_db)):
    return add_item(db, payload)

@router.put("/{item_code}")
def restock_item(item_code: str, quantity: int, db: Session = Depends(get_db)):
    return update_item_quantity(db, item_code, quantity)
"""

services_inventory = """
from sqlalchemy.orm import Session
from models.orm import Inventory
from utils.ids import generate_code

def get_all_items(db: Session):
    return db.query(Inventory).all()

def add_item(db: Session, data):
    count = db.query(Inventory).count()
    item_code = generate_code("ITM", count)
    
    new_item = Inventory(
        item_code=item_code,
        brand=data.brand,
        model=data.model,
        category=data.category,
        quantity=data.quantity,
        reorder_level=data.reorder_level,
        cost=data.cost,
        selling_price=data.selling_price,
        supplier=data.supplier
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"item_code": new_item.item_code}

def update_item_quantity(db: Session, item_code: str, added_quantity: int):
    item = db.query(Inventory).filter(Inventory.item_code == item_code).first()
    if item:
        item.quantity += added_quantity
        db.commit()
        return {"item_code": item.item_code, "new_quantity": item.quantity}
    return {"error": "Not found"}
"""

routes_billing = """
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.billing import InvoiceCreate
from services.billing_service import get_all_invoices, get_invoice, create_invoice
from database import get_db

router = APIRouter()

@router.get("/")
def list_invoices(db: Session = Depends(get_db)):
    return get_all_invoices(db)

@router.get("/{invoice_number}")
def retrieve_invoice(invoice_number: str, db: Session = Depends(get_db)):
    return get_invoice(db, invoice_number)

@router.post("/")
def add_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    return create_invoice(db, payload)
"""

services_billing = """
from sqlalchemy.orm import Session
from models.orm import Billing
from utils.ids import generate_code
import datetime

def get_all_invoices(db: Session):
    return db.query(Billing).all()

def get_invoice(db: Session, invoice_number: str):
    return db.query(Billing).filter(Billing.invoice_number == invoice_number).first()

def create_invoice(db: Session, data):
    count = db.query(Billing).count()
    invoice_number = generate_code("INV", count)
    
    new_invoice = Billing(
        invoice_number=invoice_number,
        patient_number=data.patient_number,
        date=datetime.date.today(),
        subtotal=data.subtotal,
        discount=data.discount,
        total=data.total,
        amount_paid=data.amount_paid,
        balance=data.balance,
        payment_method=data.payment_method,
        status=data.status
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return {"invoice_number": new_invoice.invoice_number}
"""

routes_dashboard = """
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.dashboard_service import get_dashboard_metrics
from database import get_db

router = APIRouter()

@router.get("/")
def retrieve_dashboard_metrics(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)
"""

services_dashboard = """
from sqlalchemy.orm import Session
from models.orm import Patient, Prescription, Inventory, Billing
from sqlalchemy import func
import datetime

def get_dashboard_metrics(db: Session):
    total_patients = db.query(Patient).count()
    total_prescriptions = db.query(Prescription).count()
    total_inventory = db.query(Inventory).count()
    
    today = datetime.date.today()
    
    today_revenue = db.query(func.sum(Billing.amount_paid)).filter(Billing.date == today).scalar() or 0.0
    total_revenue = db.query(func.sum(Billing.amount_paid)).scalar() or 0.0
    
    low_stock_items = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_level).all()
    
    return {
        "total_patients": total_patients,
        "total_prescriptions": total_prescriptions,
        "total_inventory_items": total_inventory,
        "today_revenue": float(today_revenue),
        "total_revenue": float(total_revenue),
        "low_stock_count": len(low_stock_items),
        "low_stock_items": low_stock_items
    }
"""

import shutil
if os.path.exists('excel'):
    shutil.rmtree('excel')

write_file("routes/patients.py", routes_patients)
write_file("routes/prescriptions.py", routes_prescriptions)
write_file("routes/inventory.py", routes_inventory)
write_file("routes/billing.py", routes_billing)
write_file("routes/dashboard.py", routes_dashboard)

write_file("services/patient_service.py", services_patient)
write_file("services/prescription_service.py", services_prescription)
write_file("services/inventory_service.py", services_inventory)
write_file("services/billing_service.py", services_billing)
write_file("services/dashboard_service.py", services_dashboard)

print("Backend refactored successfully.")
