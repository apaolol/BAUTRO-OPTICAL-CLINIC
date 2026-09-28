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
