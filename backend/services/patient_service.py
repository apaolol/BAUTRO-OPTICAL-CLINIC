from excel.workbook import get_workbook, save_workbook
from utils.ids import generate_code
from datetime import date

SHEET = "Patients"


def get_all_patients():
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    return rows


def get_patient(patient_number: str):
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return None
    header = rows[0]
    for row in rows[1:]:
        if row[0] == patient_number:
            return dict(zip(header, row))
    return None


def create_patient(data):
    wb = get_workbook()
    ws = wb[SHEET]

    patient_number = generate_code("P", ws.max_row)

    ws.append([
        patient_number,
        str(date.today()),       # date_created
        data.full_name,
        data.address,
        data.contact_number,
        data.date_of_birth,
        data.age,
        data.sex,
        data.occupation,
        data.emergency_contact,
        data.chief_complaint,
        data.medical_history,
        data.ocular_history,
        data.allergies,
        data.current_medications,
        data.visual_acuity_od,
        data.visual_acuity_os,
        data.bcva_od,
        data.bcva_os,
        data.iop,
        data.diagnosis,
        data.clinical_notes,
        data.other_tests,
    ])

    save_workbook(wb)

    return {"patient_number": patient_number}