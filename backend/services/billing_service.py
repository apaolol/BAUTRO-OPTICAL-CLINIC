from excel.workbook import get_workbook, save_workbook
from services.inventory_service import update_inventory_quantity
from utils.ids import generate_code
from datetime import date

SHEET = "Billing"


def get_all_billing():
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    return rows


def get_billing_by_patient(patient_number: str):
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


def create_invoice(data):
    wb = get_workbook()
    ws = wb[SHEET]

    invoice_number = generate_code("INV", ws.max_row)
    total = data.quantity * data.unit_price

    ws.append([
        invoice_number,
        data.patient_number,
        data.product_code,
        data.quantity,
        data.unit_price,
        total,
        data.payment_method,
        str(date.today()),
    ])

    save_workbook(wb)

    # Deduct from inventory
    update_inventory_quantity(
        data.product_code,
        -data.quantity,
        "SOLD",
        f"Invoice {invoice_number}",
    )

    return {"invoice_number": invoice_number, "total": total}