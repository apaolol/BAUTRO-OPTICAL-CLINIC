# Refactor discovery and task index

Planning date: 2026-11-20. This pass creates task documents only. No CLI command, migration, dependency installation, scaffold or implementation has run. All boxes, including status choices, start unchecked; every task is Not started.

## Course evidence and current structure

`webdev/` is actually `C:/Users/USER/Desktop/webdev`, a separate project source folder. It is read-only reference material.

| Material | Observed conventions |
| --- | --- |
| part2/BAUTRO_PART2 | database.py, models.py, app.py, orm.py, test.py; flat HTML/styles.css. SQLModel Field/type hints, SQLite/create_engine, Session/select/where/first/get/add/commit/refresh. test.py contains working FastAPI/lifespan/CORS examples; app.py is a small ORM entry point. |
| part2 HTML | Direct DOM input reads, plain functions, async/await, fetch with JSON.stringify, response.json, try/catch, alerts and document.location.href. Axios CDN is included but inspected requests use fetch. |
| BAUTRO_EXAM | index.html, pages/*.html, src/js/*.js, src/css/universalStyles.css plus page styles, assets/. Camel-case JS functions, descriptive IDs/classes, simple comments and direct DOM updates; ordinary CSS selectors/flexbox. |
| BAUTRO_ACT / WEBDEVFUNPAGE | Basic standalone HTML/CSS; pages/, shared/page CSS and assets. |
| Teaching slides | Read actual PPTX slide XML from crud.pptx and WEBDEV + ADBMS/WEBDEV1.pptx and WEBDEV3.pptx, plus existing slides_text.txt. Confirms SQLModel CRUD, SQLite, FastAPI, lifespan, HTTP methods and Postman. SQLModel is powered by SQLAlchemy; direct SQLAlchemy application models are unnecessary. SQL/ADBMS material covers DuckDB analytics, not a requirement to use it for clinic operations. |

Current backend: database.py (SQLAlchemy SQLite), models/orm.py (six tables), four Pydantic create schemas, routes/, services/, utils/ids.py, main.py, alembic.ini and two revisions. Current frontend: React/TypeScript/React Router/Vite/lucide-react, five screens, shared API wrapper and toast hook. old_index.html is an earlier monolithic implementation, not the target structure.

Current declared backend dependencies: fastapi, uvicorn, openpyxl, pydantic, python-multipart. SQLAlchemy/Alembic imports are not declared. No endpoint currently implements file upload or spreadsheet export. Target direct dependencies: fastapi, uvicorn, sqlmodel, alembic; retain other packages only when actual use is demonstrated and recorded.

Read-only database discovery: six domain tables exist; patients has 1 row, others 0. alembic_version has one row; no clinical values were printed. Recheck during execution. Existing revisions: db4aaf8512b0 then fae1679855f7 (adds lens_brand/lens_coating). Both lens columns exist in the database. No automated test suite was found.

## Verified FISHTOOL behavior

Read remote fishtool.py, README and requirements without executing commands. Source commit: `93d4af1aefe48bfe3fd663d323f96a576df67b67`.

- [Repository and README](https://github.com/amiel103/FISHTOOL/tree/93d4af1aefe48bfe3fd663d323f96a576df67b67)
- [Verified CLI source](https://github.com/amiel103/FISHTOOL/blob/93d4af1aefe48bfe3fd663d323f96a576df67b67/fishtool.py)
- [Requirements](https://github.com/amiel103/FISHTOOL/blob/93d4af1aefe48bfe3fd663d323f96a576df67b67/requirements.txt): fastapi, uvicorn, sqlmodel, alembic.

All future commands run from backend/ with fishtool.py there.

| Command | Actual implementation |
| --- | --- |
| python fishtool.py new [path] | Writes app/main.py, database.py, dependencies.py, routers/, models/, internal/admin.py and package initializers. Can overwrite scaffold files; run once after absence/backup check. No install or Alembic setup. |
| python fishtool.py makemodel Patient | capitalize() normalizes name; writes models/Patient.py, routers/Patient.py and class Patient containing only integer id. Registers model in models/__init__.py and router in main.py. Prefix /Patient. README's lowercase example filenames disagree with source. |
| python fishtool.py makerouter dashboard | Generates/registers blank dashboard router with placeholder GET / and /dashboard prefix. |
| python fishtool.py list | Regex-scans router decorators; lists relative paths, not authoritative resolved prefixes. |
| python fishtool.py serve | Current interpreter runs uvicorn app.main:app --reload (port 8000). |
| python fishtool.py init | Installs requirements then alembic init migrations and patches env/mako. Avoid creating a second migration chain. |
| python fishtool.py makemigrations "message" | Initializes migrations/ if missing, autogenerates, saves latest filename, then interactively rewrites nullable=False lines with server defaults. Review/repair output, never invent defaults. Embedded latest-file path uses Windows separators. |
| python fishtool.py migrate [--rev REV] | Alembic upgrade head or specified revision. |
| python fishtool.py rollback | Alembic downgrade -1. Rehearsal copies only. |

Generated CRUD: GET collection, POST (201/full table object), GET integer ID (404 missing), PUT integer ID using supplied fields, DELETE (204). Clinic POSTs are 200/code-only and lookups use business numbers. Adapt generated routers; remove unused operations rather than expose extra APIs. Keep generated capitalized files/classes instead of renaming scaffolding. Default DB is app//database.db, requiring explicit change.

## Target decisions

- Generate backend/app/. Use simple SQLModel models/create schemas and direct session logic inside generated routers; small shared code-format function in app/internal/. No service/repository abstraction.
- Preserve SQLite at backend/bautro.db using a module-relative resolved path. Runtime and Alembic must point to the same database regardless of working directory.
- Copy existing Alembic history to backend/migrations/ for FISHTOOL conventions, preserve revision IDs, adapt metadata/model imports and ini. Retain old history until acceptance. No new initial revision, blind stamp or database reset. Schema-equivalent conversion needs no migration.
- Preserve all six tables. Generate Appointment/Expense models but disable their auto-generated routers: no current endpoint/UI uses them.
- Frontend: index.html = dashboard; pages/patients.html, prescriptions.html, inventory.html, billing.html. src/js/api.js, common.js and one screen JS each; src/css/universalStyles.css and page CSS where needed; assets/ for clinic branding. Classic deferred scripts, normal links, descriptive functions/IDs. Preserve current cyan/black/white styling with plain CSS.
- Backend http://127.0.0.1:8000, static frontend http://127.0.0.1:5500. CORS allows 127.0.0.1:5500 and localhost:5500, credentials disabled. Fetch checks HTTP status and displays recoverable errors. Use textContent for user text, loading/empty/error states and submit disabling/finally recovery.
- Keep legacy backend/frontend backups until verified cutover. Remove old framework/source only in the final task. No deployment is planned.

## Endpoint gap analysis

Preserve these contracts, including current imperfect behavior, unless owner-approved changes are recorded.

| Current endpoint | Coverage and customization |
| --- | --- |
| GET / | Customize scaffold root: 200 {message: Bautro Optical Clinic API}. |
| GET /patients/ | Generated collection adapted to lowercase prefix; full record list or []. |
| GET /patients/{patient_number} | Customize lookup to string code; missing returns 200/null. |
| POST /patients/ | Customize generated create: required full_name/contact_number, optional demographic/clinical fields; server date_created, P code; 200 {patient_number}. |
| GET /prescriptions/ | Generated collection adapted; full record list. |
| GET /prescriptions/{prescription_number} | String RX lookup; missing 200/null. |
| POST /prescriptions/ | Custom create: patient_number required; OD/OS, lens/frame/notes; server date and RX code; 200 {prescription_number}. No current patient check. |
| GET /inventory/ | Generated collection adapted; full record list. |
| POST /inventory/ | Custom create/defaults, ITM code; 200 {item_code}. |
| PUT /inventory/{item_code}?quantity=INT | Custom generated update: required integer query delta, increments quantity; 200 {item_code,new_quantity}; missing 200 {error: Not found}. No replacement JSON body. |
| GET /billing/ | Generated collection adapted; full invoice records. |
| GET /billing/{invoice_number} | String INV lookup; missing 200/null. |
| POST /billing/ | Custom create, server date/code, persist submitted monetary fields/status; 200 {invoice_number}. No current recalculation or patient check. |
| GET /dashboard/ | Custom blank router: total_patients, total_prescriptions, total_inventory_items, today_revenue, total_revenue, low_stock_count, low_stock_items. Inventory counts rows; revenue sums amount_paid; low stock quantity <= reorder_level; empty revenue 0.0. |

## Model/data gap analysis

All six generated models contain only id, so every domain field must be added. Source of truth: backend/models/orm.py, four create-schema files, and actual SQLite PRAGMA schema/indexes. Explicitly preserve table names, integer IDs, unique/indexed business codes, column nullability, dates, floats and defaults. Existing patient_number links are strings without foreign keys; add no relationship/cascade or constraint redesign. Database nullable fields stay readable even when create schemas require input. date_of_birth stays a string.

| Table/model | Required field coverage beyond generated id |
| --- | --- |
| patients/Patient | patient_number,date_created,full_name,address,contact_number,date_of_birth,age,sex,occupation,emergency_contact; chief_complaint,medical_history,ocular_history,allergies,current_medications; visual_acuity_od/os,bcva_od/os,iop,diagnosis,clinical_notes,other_tests. |
| prescriptions/Prescription | prescription_number,patient_number,date; od_sphere/cylinder/axis/add/pd and os equivalents; lens_type,lens_brand,lens_coating,frame_brand,frame_model,notes. |
| inventory/Inventory | item_code,brand,model,category,quantity(default 0),reorder_level(default 5),cost,selling_price,supplier. Create schema cost/selling_price default 0.0 but accepts null; quantity/reorder accept null too. |
| billing/Billing | invoice_number,patient_number,date,subtotal,discount,total,amount_paid,balance,payment_method,status. Six monetary create inputs required; payment_method optional, status default Pending and accepts null. |
| appointments/Appointment | appointment_number,patient_number,date_time,optometrist,status,notes. Preserve table only. |
| expenses/Expense | date,category,description,amount,payment_method,notes. Preserve table only. |

Codes currently use count+1, formatting PREFIX-00001 with P/RX/ITM/INV prefixes. Preserve for parity and record collision limitations. Server dates use datetime.date.today(). No deletion API is added.

## Frontend behavior to preserve

- Patients: all clinical/demographic form values, list/detail, search name/number/contact, required name/contact, optional blank-to-null and age numeric conversion.
- Prescriptions: bilateral and lens/frame fields, search RX/patient numbers, details and selected prescription window.print with print CSS.
- Inventory: add, search brand/model/code/category, low-stock indicators, positive integer UI restock query and refresh.
- Billing: search invoice/patient numbers, details, pesos, create. total=max(0,subtotal-discount); balance=max(0,total-paid); Paid if balance<=0, otherwise Partial if paid>0, otherwise Pending. Backend stores supplied values.
- Dashboard: six cards, low-stock warning/table, refresh/retry, zero/empty behavior. All screens need loading/errors, cancellation and success/list refresh.

## Open questions (record, do not guess)

1. Should missing lookups become 404? Default here: preserve existing 200/null/error object.
2. Should server compute invoices or require existing patients? Default: retain current contract and frontend calculations.
3. Must public codes handle deletion/concurrent creates? count+1 can collide. Default: preserve behavior, no deletes, record limitation; production redesign is separate.
4. Should API restock reject negative/zero deltas? Current API accepts integer deltas, UI restricts positives. Preserve each behavior.
5. Are appointment/expense screens planned? Default: table preservation only.
6. Is public/multi-user deployment/authentication needed? Current Admin is a UI label, no auth exists. Default: local development only; do not copy insecure course credential examples or claim production readiness.
7. Which installed interpreter/dependency versions are supported? Workspace contains Python 3.14 artifacts; compatibility was not tested. Task 01 records versions; stop dependency setup if no supported interpreter is available.

## Task index

All tasks are Not started; execute singly in numeric order.

- [01 Baseline and backup](01-baseline-and-backup.md)
- [02 Generate project](02-generate-fishtool-project.md)
- [03 Generate models](03-generate-sqlmodel-models.md)
- [04 Database and migrations](04-preserve-database-and-migrations.md)
- [05 Patients API](05-patients-api.md)
- [06 Prescriptions API](06-prescriptions-api.md)
- [07 Inventory API](07-inventory-api.md)
- [08 Billing API](08-billing-api.md)
- [09 Dashboard API](09-dashboard-api.md)
- [10 Vanilla shell](10-vanilla-frontend-shell.md)
- [11 Patients frontend](11-patients-frontend.md)
- [12 Prescriptions frontend](12-prescriptions-frontend.md)
- [13 Inventory frontend](13-inventory-frontend.md)
- [14 Billing frontend](14-billing-frontend.md)
- [15 Dashboard frontend](15-dashboard-frontend.md)
- [16 Acceptance and cutover](16-acceptance-and-cutover.md)
