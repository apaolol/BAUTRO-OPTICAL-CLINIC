from excel.workbook import get_workbook, save_workbook
from utils.ids import generate_code
from datetime import date

SHEET = "Inventory"
HISTORY_SHEET = "InventoryHistory"


def get_all_inventory():
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    return rows


def get_inventory_item(item_code: str):
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return None
    header = rows[0]
    for row in rows[1:]:
        if row[0] == item_code:
            return dict(zip(header, row))
    return None


def create_inventory_item(data):
    wb = get_workbook()
    ws = wb[SHEET]

    item_code = generate_code("ITM", ws.max_row)

    ws.append([
        item_code,
        data.category,
        data.brand,
        data.model,
        data.color,
        data.supplier,
        data.purchase_cost,
        data.selling_price,
        data.quantity,
        data.reorder_level,
    ])

    # Log history
    wh = wb[HISTORY_SHEET]
    wh.append([
        str(date.today()),
        item_code,
        "ADDED",
        data.quantity,
        "Initial stock",
    ])

    save_workbook(wb)

    return {"item_code": item_code}


def update_inventory_quantity(item_code: str, quantity_change: int, action: str, remarks: str = ""):
    wb = get_workbook()
    ws = wb[SHEET]

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return None

    header = list(rows[0])
    qty_col = header.index("quantity") + 1  # 1-based for openpyxl

    for i, row in enumerate(rows[1:], start=2):
        if row[0] == item_code:
            current_qty = row[qty_col - 1] or 0
            new_qty = current_qty + quantity_change
            ws.cell(row=i, column=qty_col, value=new_qty)

            # Log history
            wh = wb[HISTORY_SHEET]
            wh.append([
                str(date.today()),
                item_code,
                action,
                quantity_change,
                remarks,
            ])

            save_workbook(wb)
            return {"item_code": item_code, "new_quantity": new_qty}

    return None


def get_low_stock():
    wb = get_workbook()
    ws = wb[SHEET]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    header = rows[0]
    return [
        dict(zip(header, row))
        for row in rows[1:]
        if row[8] is not None and row[9] is not None and row[8] <= row[9]
    ]