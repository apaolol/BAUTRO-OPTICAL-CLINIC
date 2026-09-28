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
