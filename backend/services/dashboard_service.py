from excel.workbook import get_workbook
from datetime import date

PATIENTS_SHEET = "Patients"
BILLING_SHEET = "Billing"
INVENTORY_SHEET = "Inventory"
PRESCRIPTIONS_SHEET = "Prescriptions"


def get_dashboard_summary():
    wb = get_workbook()

    # --- Patients ---
    ws_patients = wb[PATIENTS_SHEET]
    all_patient_rows = list(ws_patients.iter_rows(values_only=True))
    total_patients = max(len(all_patient_rows) - 1, 0)

    # --- Billing ---
    ws_billing = wb[BILLING_SHEET]
    billing_rows = list(ws_billing.iter_rows(values_only=True))

    total_revenue = 0.0
    today_revenue = 0.0
    today_str = str(date.today())

    for row in billing_rows[1:]:
        # row: invoice_number, patient_number, product_code, quantity, unit_price, total, payment_method, date
        total_val = row[5]
        row_date = str(row[7]) if row[7] else ""
        if total_val:
            total_revenue += float(total_val)
        if row_date == today_str and total_val:
            today_revenue += float(total_val)

    # --- Inventory ---
    ws_inventory = wb[INVENTORY_SHEET]
    inventory_rows = list(ws_inventory.iter_rows(values_only=True))
    total_items = max(len(inventory_rows) - 1, 0)

    low_stock_items = []
    for row in inventory_rows[1:]:
        qty = row[8]
        reorder = row[9]
        if qty is not None and reorder is not None and qty <= reorder:
            low_stock_items.append({
                "item_code": row[0],
                "brand": row[2],
                "model": row[3],
                "quantity": qty,
                "reorder_level": reorder,
            })

    # --- Prescriptions ---
    ws_rx = wb[PRESCRIPTIONS_SHEET]
    rx_rows = list(ws_rx.iter_rows(values_only=True))
    total_prescriptions = max(len(rx_rows) - 1, 0)

    return {
        "total_patients": total_patients,
        "total_prescriptions": total_prescriptions,
        "total_inventory_items": total_items,
        "total_revenue": round(total_revenue, 2),
        "today_revenue": round(today_revenue, 2),
        "low_stock_count": len(low_stock_items),
        "low_stock_items": low_stock_items,
    }