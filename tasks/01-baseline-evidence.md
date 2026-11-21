# Task 01 baseline evidence

Date: 2026-11-20 (Asia/Singapore).

## Verification boundaries

API examples below are source-derived contracts, not executed HTTP tests. The pre-setup environment lacks SQLAlchemy, so legacy app startup cannot succeed yet. Source inspection and request-schema validation are verified; full runtime parity remains in the later API/acceptance tasks. Each example uses synthetic data only and assumes an initially empty disposable database with preceding successful creates. GET lookup examples use the created records; missing codes return 200/null. All successful endpoints currently default to 200.

## Backup and environment

- Backup directory: `C:\Users\USER\Desktop\BAUTRO OPTICAL CLINIC\.setup-backups\tasks-01-02-20261120` (Git-ignored private local backup outside backend/frontend; retain until final acceptance).
- Source archive: `legacy-source.zip`; SQLite online snapshot: `bautro.db`.
- Verified archive CRC and every source SHA-256; SQLite integrity_check = ok; source/backup table counts, columns and indexes match; original database SHA-256 unchanged.
- Exact revision: `fae1679855f7`. Full environment/schema/hash inventory is in [setup-baseline.json](setup-baseline.json), containing no row values.
- Python 3.14.2; existing FastAPI 0.136.3, Uvicorn 0.48.0, Pydantic 2.13.4. Pip dry run resolved sqlmodel 0.0.50, alembic 1.20.1 and SQLAlchemy 2.1.9 CPython 3.14 Windows wheel. No install occurred in Task 01.
- Prior git status: only untracked tasks/. Course sources confirmed present.
- Process enumeration via CIM was unavailable. Used SQLite online backup instead of terminating user processes; this provides a consistent committed snapshot with active writers. No source files changed during backup.

## Restore instructions (do not run during setup)

Stop backend writers before restoring. Extract legacy-source.zip into a separate review directory, verify hashes against setup-baseline.json and restore only intended backend/frontend paths. Restore the backed-up bautro.db via SQLite backup API into the target database after confirming active sessions are closed; validate integrity/schema/counts. Do not overwrite newer user work or leave stale WAL/SHM sidecars attached to a replaced file. Legacy entry point: from backend/, use the environment interpreter with `-m uvicorn main:app --reload`; legacy frontend uses its existing package scripts. A complete pre-setup environment inventory is preserved; source archive excludes installed dependencies, build outputs and Python caches.

## Synthetic endpoint examples

### GET /

Request: `no body`

Expected 200: `{"message": "Bautro Optical Clinic API"}`

### GET /patients/

Request: `no body`

Expected 200: `"array of Patient records"`

### GET /patients/P-00001

Request: `no body`

Expected 200: `"Patient record, or null if missing"`

### POST /patients/

Request: `{"full_name": "Synthetic Patient", "contact_number": "00000000000"}`

Expected 200: `{"patient_number": "P-00001"}`

### GET /prescriptions/

Request: `no body`

Expected 200: `"array of Prescription records"`

### GET /prescriptions/RX-00001

Request: `no body`

Expected 200: `"Prescription record, or null if missing"`

### POST /prescriptions/

Request: `{"patient_number": "P-00001", "od_sphere": "-1.25", "lens_brand": "Synthetic Brand", "lens_coating": "Synthetic Coating"}`

Expected 200: `{"prescription_number": "RX-00001"}`

### GET /inventory/

Request: `no body`

Expected 200: `"array of Inventory records"`

### POST /inventory/

Request: `{"brand": "Synthetic Brand", "quantity": 2, "reorder_level": 5}`

Expected 200: `{"item_code": "ITM-00001"}`

### PUT /inventory/ITM-00001?quantity=3

Request: `no body`

Expected 200: `{"item_code": "ITM-00001", "new_quantity": 5}`

### GET /billing/

Request: `no body`

Expected 200: `"array of Billing records"`

### GET /billing/INV-00001

Request: `no body`

Expected 200: `"Billing record, or null if missing"`

### POST /billing/

Request: `{"patient_number": "P-00001", "subtotal": 100, "discount": 10, "total": 90, "amount_paid": 40, "balance": 50, "payment_method": "Cash", "status": "Partial"}`

Expected 200: `{"invoice_number": "INV-00001"}`

### GET /dashboard/

Request: `no body`

Expected 200: `{"total_patients": 1, "total_prescriptions": 1, "total_inventory_items": 1, "today_revenue": 40.0, "total_revenue": 40.0, "low_stock_count": 1, "low_stock_items": "array containing synthetic inventory record"}`

## Error and validation cases

- Missing patient/RX/invoice lookup: 200 JSON null. Missing inventory restock: 200 {"error":"Not found"}.
- POST /patients/ missing full_name or contact_number: 422; POST /prescriptions/ missing patient_number: 422.
- POST /billing/ missing patient_number or any of six monetary inputs: 422. Inventory empty object uses defaults; omitted versus explicit-null prices remain distinct.
- Restock missing quantity or noninteger quantity: 422. Zero/negative integers are accepted by current API; UI accepts positives only.
- Unknown route: FastAPI 404; wrong method: 405. Current code does not validate linked patient existence or recompute submitted invoice totals.
- Invalid JSON or incorrect schema types produce framework validation errors; DB constraint collisions are not handled by custom code. count+1 codes can collide after deletion/concurrent creates.

## Five-screen source baseline

- Patients: list/create/details; search name/code/contact; every clinical/demographic input retained; required name/contact and blank-to-null conversion.
- Prescriptions: list/create/details, bilateral/lens/frame fields, RX/patient search and selected-record window.print.
- Inventory: list/create, brand/model/code/category search, low-stock badges and positive-integer restock query.
- Billing: list/create/details, invoice/patient search, peso formatting; total=max(0,subtotal-discount), balance=max(0,total-paid); Paid/Partial/Pending derived on frontend.
- Dashboard: six cards, low-stock warning/table, refresh/retry, amount_paid revenue and empty/error/loading states.

These are source-verified requirements, not claims of browser execution.

The four synthetic POST payloads passed the existing Pydantic create schemas in isolation.
