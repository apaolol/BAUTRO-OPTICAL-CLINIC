from excel.workbook import get_workbook, save_workbook
from utils.ids import generate_code
from datetime import date

SHEET = "Prescriptions"


def get_all_prescriptions():
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    return rows


def get_prescriptions_by_patient(patient_number: str):
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    header = rows[0]
    return [
        dict(zip(header, row))
        for row in rows[1:]
        if row[1] == patient_number
    ]


def create_prescription(data):
    wb = get_workbook()
    ws = wb[SHEET]

    prescription_number = generate_code("RX", ws.max_row)

    ws.append([
        prescription_number,
        data.patient_number,
        str(date.today()),

        data.od_sphere,
        data.od_cylinder,
        data.od_axis,
        data.od_add,

        data.os_sphere,
        data.os_cylinder,
        data.os_axis,
        data.os_add,

        data.distance_pd,
        data.near_pd,

        data.right_seg_height,
        data.left_seg_height,

        data.right_pupil_height,
        data.left_pupil_height,

        data.lens_type,
        data.lens_brand,
        data.lens_coating,
        data.tint,

        data.frame_model,
        data.frame_brand,

        data.special_instructions,
    ])

    save_workbook(wb)

    return {"prescription_number": prescription_number}