# Refactor discovery and task index

Planning date: 2026-11-20. Execution update (2026-11-21): Tasks 01â€“16 are Done. Local acceptance/cutover passed: all 14 resolved API operations, full-field synthetic contracts and fresh-process persistence, all five vanilla screens, integrated browser create/search/details/restock/billing/dashboard/restart, and fresh/populated-copy migrations and backup/legacy startup restoration. Task 12 native print preview is user-confirmed. Thirty explicit legacy paths were moved out of the active tree into private rollback storage after parity; all original backups, generated source, task history and uncommitted vanilla work are preserved. Clinic database schema/index/counts and SHA-256 remain unchanged. No deployment or live restore was performed. See [RUNBOOK.md](../RUNBOOK.md), Task 16 log and evidence.

## Course evidence and current structure

`webdev/` is actually `C:/Users/USER/Desktop/webdev`, a separate project source folder. It is read-only reference material.

| Material | Observed conventions |
| --- | --- |
| part2/BAUTRO_PART2 | database.py, models.py, app.py, orm.py, test.py; flat HTML/styles.css. SQLModel Field/type hints, SQLite/create_engine, Session/select/where/first/get/add/commit/refresh. test.py contains working FastAPI/lifespan/CORS examples; app.py is a small ORM entry point. |
| part2 HTML | Direct DOM input reads, plain functions, async/await, fetch with JSON.stringify, response.json, try/catch, alerts and document.location.href. Axios CDN is included but inspected requests use fetch. |
| BAUTRO_EXAM | index.html, pages/*.html, src/js/*.js, src/css/universalStyles.css plus page styles, assets/. Camel-case JS functions, descriptive IDs/classes, simple comments and direct DOM updates; ordinary CSS selectors/flexbox. |
| BAUTRO_ACT / WEBDEVFUNPAGE | Basic standalone HTML/CSS; pages/, shared/page CSS and assets. |
| Teaching slides | Read actual PPTX slide XML from crud.pptx and WEBDEV + ADBMS/WEBDEV1.pptx and WEBDEV3.pptx, plus existing slides_text.txt. Confirms SQLModel CRUD, SQLite, FastAPI, lifespan, HTTP methods and Postman. SQLModel is powered by SQLAlchemy; direct SQLAlchemy application models are unnecessary. SQL/ADBMS material covers DuckDB analytics, not a requirement to use it for clinic operations. |

Current backend: generated/customized app/ with six SQLModel models, four create schemas, five registered domain routers, shared code formatter and module-relative SQLite. migrations/ retains both original revisions. Current frontend: index.html plus pages/*.html, src/js/*.js, src/css/*.css and assets/ clinic logo. Legacy backend layers, duplicate alembic/ and React/Vite/TypeScript source/manifests/dependencies were retired reversibly under .setup-backups/task16-retired/. Explicit paths and hashes: 16-retirement-manifest.json.

Current pinned direct backend dependencies: FastAPI 0.136.3, Uvicorn 0.48.0, SQLModel 0.0.50 and Alembic 1.20.1. SQLAlchemy/Pydantic remain required transitive dependencies. No frontend dependencies; Node was used only for verification. No upload/export route requires openpyxl/python-multipart. Task 16 installed nothing.

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
| billing/Billing | invoice_number,patient_number,date,subtotal,discount,total,amount_paid,balance,payment_method,status. Five monetary create inputs required; payment_method optional, status default Pending and accepts null. |
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
7. Runtime setup resolved by Tasks 01-02: Python 3.14.2, FastAPI 0.136.3, Uvicorn 0.48.0, SQLModel 0.0.50 and Alembic 1.20.1 pass imports, in-memory SQLModel create/read and pip check. Exact transitive versions are recorded in 02-setup-verification.json. Endpoint/runtime acceptance is complete through Task 16 within the documented local/synthetic verification boundaries.

## Task index

Tasks 01â€“16 are Done. The refactor task sequence is complete. Do not start separately scoped feature work without authorization.

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

## Chat continuity

Every task includes a Chat handoff reminder. After completion, the execution agent recommends staying or starting fresh, and supplies a filled context prompt when fresh is useful. See [chat-handoff.md](chat-handoff.md). Default fresh boundaries are after Tasks 04, 09 and 15; this advice does not interrupt an authorized task range or create a new chat.

The following carryovers are historical snapshots of each task completion; Task 16 above and below supersedes their pending-work statements.

## Task 03 carryover

Models and create schemas are verified in 03-model-verification.json; generation provenance is in 03-generation-evidence.json. Four active lowercase collection routers retain provisional generated POST behavior (table input/full record/201); domain behavior and create-schema wiring are deferred to Tasks 05-08. Business-code lookups/restock are not yet implemented. Task 04 has now wired the module-relative backend/bautro.db path and migration history. The intermediate generated API still lacks business-code responses/lookups; API customization begins in Task 05. No real database data/schema changes were needed.

## Task 04 carryover

Database wiring and history preservation are complete; see 04-migration-verification.json. Activate the project virtual environment before FISHTOOL migration commands, since it invokes alembic via PATH. Both original revisions are retained unchanged under migrations/ and legacy alembic/. No new revision was generated. Only synthetic rehearsal data was downgraded. The actual database remained at fae1679855f7 with its Task 01 SHA-256 unchanged after no-op migrate and lifespan checks. Recommend a fresh chat for Task 05; do not regenerate scaffolding or rerun migrations to load context.

## Task 05 carryover

Patient API customization is complete; see 05-patients-verification.json and repeatable 05-verify-patients.py. It now uses PatientCreate, server-generated date/code, 200 code-only POST and string-code GET with 200/null when missing. Shared app/internal/ids.py preserves count+1 formatting for later routers. All 20 optional fields, validation, OpenAPI/method restrictions and fresh-process persistence passed on synthetic SQLite; real database and backup hashes remain unchanged. No HTTP server/browser or concurrency test ran. Sandbox asyncio stalled; bounded outside-sandbox checks passed. Keep this chat for Task 06 when authorized; prescription/inventory/billing handlers remain provisional and root/dashboard work is still pending. No regeneration or migrations needed for context.

## Task 06 carryover

Prescription API customization is complete; see 06-prescriptions-verification.json and repeatable 06-verify-prescriptions.py (reuses the Task 05 ASGI request helper). It uses PrescriptionCreate, shared RX formatting, server date, 200 code-only create and string-code lookup with missing 200/null. All 16 optional fields, signed optical strings, null/omitted/empty values, required-field validation and full-field fresh-process persistence passed on synthetic SQLite. Patient existence is deliberately not checked. Real database and backup hashes remain unchanged. Bounded outside-sandbox ASGI checks passed; no network HTTP/browser or concurrency test ran. Keep this chat for Task 07 when authorized. Inventory/billing handlers remain provisional; root/dashboard work is pending. No generation or migrations needed for context.

## Task 07 carryover

Inventory API customization is complete; see 07-inventory-verification.json and repeatable 07-verify-inventory.py. InventoryCreate preserves defaults/optional fields; POST returns 200/item_code, and PUT takes a required integer query delta and returns the updated quantity or 200/error for a missing code. Synthetic ASGI checks cover null/zero prices, defaults, fields, repeated positive/zero/negative increments, query/body behavior, validation and fresh-process persistence. Separate legacy in-memory insertion confirms explicit null quantity/reorder use ORM defaults 0/5; prices remain null. Existing SQL NULL quantity restock still fails as in legacy; zero/negative deltas and count+1 collision risk remain compatible. Real database and backup hashes unchanged. No network HTTP/browser or concurrency tests; bounded outside-sandbox verification passed. Keep this chat for Task 08 when authorized. Billing remains provisional; root/dashboard work is pending. No regeneration or migrations needed for context.

## Task 08 carryover

Billing API customization is complete; see 08-billing-verification.json and repeatable 08-verify-billing.py. InvoiceCreate requires patient_number plus FIVE monetary fields: subtotal, discount, total, amount_paid, balance. Earlier references to six monetary inputs were a documentation counting error; historical baseline evidence is retained with this clarification. Direct sessions, shared INV code formatter, server date, 200/code-only create and missing 200/null lookup preserve legacy behavior. Synthetic ASGI checks cover Paid/Partial/Pending/default/null/blank status/payment, every required input, decimal and inconsistent monetary values without recalculation, no patient check, server fields and full-field fresh-process persistence. Real database and backup hashes unchanged. No network HTTP/browser/concurrency test; float money and count+1 collision behavior retained. Bounded outside-sandbox verification passed. Keep this chat for Task 09 when authorized; root/dashboard work is pending, then the frontend phase begins. No generation or migrations needed for context.

## Task 09 carryover

Backend API phase complete; see 09-generation-evidence.json, 09-dashboard-verification.json and 09-verify-dashboard.py. Dashboard uses simple selects/Python aggregates with SQL null handling, seven keys and full low-stock records. Root/title/version and explicit localhost/127.0.0.1:5500 CORS without credentials are wired. Exactly 14 clinic operations verified via resolved OpenAPI; FISHTOOL list scans inactive files and reports 17, including unregistered Appointment/Expense. Generation wrote dashboard.py then hit a cp1252 icon error before registration; manually registered during customization without regeneration/tool edits. All Tasks 05-09 synthetic ASGI verifiers pass after final wiring. Original database and backup hashes unchanged. No network HTTP/browser/concurrency tests or frontend changes; no server left running. Recommend a fresh chat for Task 10, tasks/10-vanilla-frontend-shell.md. Preserve legacy frontend and all uncommitted work; do not regenerate scaffolding or rerun migrations for context.

## Task 10 carryover

Static frontend shell complete; see 10-shell-verification.json, 10-verify-shell.js and frontend/README.md. Five normal HTML URLs use classic deferred JS and standard CSS, with clinic branding and read-only root connection/retry status. Shared apiRequest/apiSend and small status/button/peso helpers are ready. No domain workflows/data lists/forms implemented; screen scripts reserve Tasks 11Ã¢â‚¬â€œ15. Original React index preserved exactly as frontend/legacy_index.html; all legacy sources/manifests/assets and verified rollback backups remain. All direct URLs/assets, browser navigation/refresh, stopped-backend error/recovery and both origins' real network CORS checks passed. Synthetic shared-JS checks passed; database/backup/retained legacy hashes unchanged. No migrations, generation or installs. Sandbox sockets require outside-sandbox verification; owned servers stopped. Browser viewport override timed out/reset; narrow layout visually verified, explicit desktop visual QA pending. Keep this chat for Task 11, tasks/11-patients-frontend.md, only when authorized. Billing still has five monetary fields as clarified in Task 08; resolved OpenAPI remains authoritative at 14 operations.

## Task 11 carryover

Patient frontend complete; see 11-patients-frontend-verification.json and 11-verify-patients-frontend.js. All 21 inputs, blank/null/age conversion, list/search/counts, full details, success refresh, cancellation and failure recovery use vanilla DOM/native fetch. Browser tested full/minimal creation and restart/retry on a dedicated synthetic database via 11-preview-server.py (only Patient router redirected; do not exercise other domain routes with this harness). Every persisted full/minimal field matches; only three expected synthetic records exist. Pending duplicate-submit guard and shared helper regression passed. Patient desktop/narrow layouts verified without page overflow; viewport reset. Original DB, backups and legacy source hashes unchanged; owned servers stopped. No generation, migrations or installs. Keep this chat for Task 12, tasks/12-prescriptions-frontend.md, only when authorized. Existing count+1/idempotency limitations remain; failed ambiguous saves advise refresh before retry.

## Task 12 carryover

Prescription frontend complete; see 12-prescriptions-frontend-verification.json and 12-verify-prescriptions-frontend.js. All 17 inputs, string optical values/leading zeros/nulls, list/search/counts, safe full details and selected-record window.print with standard print CSS are implemented. Actual isolated API/browser full/minimal saves, failure/restart/retry/persistence, desktop/narrow layout and JS duplicate/recovery checks passed; Tasks 10/11 JS regression passed. Native preview could not be inspected through the connected browser tools; user explicitly confirmed only selected RX-00001 printed with both eyes/lens brand/coating/notes and without navigation/forms/other records. Original DB/backups/legacy source hashes unchanged; both servers stopped and viewport reset. Preview harness redirects only Prescription.engine; do not use it for other domain requests. No generation/migrations/installs. Keep this chat for Task 13, tasks/13-inventory-frontend.md, only when authorized. Count+1/idempotency limitations remain unchanged.

## Task 13 carryover

Inventory frontend complete; see 13-inventory-frontend-verification.json and 13-verify-inventory-frontend.js. All eight create fields, numeric/default/null/zero handling, four search keys, list/counts, low-stock equality/badges and positive-integer restock query PUT without body verified. Browser two adds, repeated restocks, global count refresh, cancel, real 200/missing-item error, network failure/restart/retry and persistence passed on isolated synthetic SQLite; stale synthetic code restored immediately. Duplicate guards/encoded special code/query/body checks and shared helper regression passed. Null stock/reorder excluded from low count and shown Unknown, matching backend semantics. Original DB/backups/legacy hashes unchanged; servers stopped and viewport reset. Preview harness redirects only Inventory.engine. No generation/migrations/installs. Keep this chat for Task 14, tasks/14-billing-frontend.md, only when authorized. Billing has five monetary fields, not six (Task 08 clarification); do not change that API contract.

## Task 14 carryover

Billing frontend complete; see 14-billing-frontend-verification.json and 14-verify-billing-frontend.js. Live calculations/status, all five monetary payload fields, optional payment/null, list/search/counts/full safe details, success refresh/cancel/failure recovery implemented. Actual isolated browser/API verified zero/unpaid/partial/full/overpaid/excess-discount plus decimal retry; all seven persisted invoices match every monetary/status/payment field. Duplicate guard, invalid inputs, disabled/finally recovery and shared-helper regression passed. Desktop/narrow containment verified, viewport reset and servers stopped. Original DB/backups/legacy hashes unchanged; no generation/migrations/installs. Preview harness redirects Billing.engine only. Corrected Task 14's stale six-field prose to five per Task 08; no API contract change. Keep this chat for Task 15, tasks/15-dashboard-frontend.md, only when authorized. Float money, count+1 codes, no patient existence check and non-idempotent creates remain unchanged.

## Task 15 carryover

Frontend implementation complete; see 15-dashboard-frontend-verification.json and 15-verify-dashboard-frontend.js. Dashboard six cards, collected revenue, stock warning/table, empty/loading/error/retry verified. All active engines redirected to a single synthetic SQLite DB in 15-preview-server.py for cross-screen reconciliation; original app unchanged. Actual browser/API counts 2 patients/1 prescription/3 inventory rows, today paid 40/total paid 50 reconcile with other pages. Equality item visible then removed after UI restock above threshold and refresh; backend stop/restart Retry recovered. Desktop/narrow layout, zero states, safe DOM, malformed-response and duplicate/finally tests passed. Original DB/backups/legacy hashes unchanged; servers stopped, viewport reset, no generation/migrations/installs. Start a fresh chat for Task 16 only when authorized; ready prompt in 15-task16-handoff.md. Task 16 acceptance/restore/cutover is not done; legacy code/manifests are retained. Task 12 native print preview was explicitly user-confirmed. Resolved OpenAPI remains authoritative at 14 operations (FISHTOOL scans inactive files); billing has five monetary fields. Earlier per-domain preview harnesses redirect only one router; Task 15 redirects all active routers. Preserve all uncommitted work and verified rollback backups.

## Task 16 completion and recovery

See 16-acceptance-verification.json and 16-retirement-manifest.json. All active API/startup engines used a dedicated synthetic database for final browser writes; original database and both Task 01 backup hashes remain unchanged. Final browser records reconcile at 3 patients, 2 prescriptions, 4 inventory rows and 3 invoices; today paid 80, total paid 90, low count 1. Restock 5â†’6 crossed the threshold. Contract/restart checks also passed after retirement; all six JS verifiers and pip check passed. Direct URLs/assets and both origins' HTTP/CORS passed. No live database migration or restore ran during Task 16.

Retirement was a reversible move of 30 explicit paths to .setup-backups/task16-retired/, with original archive plus a separately verified pre-cutover source archive retained outside active backend/frontend. Restored legacy backend reads and Vite 8.3.1 shell startup passed; returned to generated app. Run/restore commands and unresolved compatibility limitations are in RUNBOOK.md; 16-restore-copy.py refuses existing targets and was rehearsed.

Discrepancies reconciled: this README's former current-structure/dependency prose was stale; the Task 01 zip actually includes 483 nested backend/.venv pip files among 538 files despite its historical exclusion note. Use the root environment. Fixed a patient connection-loading text encoding artifact. Initial sandbox asyncio timed out; bounded outside-sandbox rehearsals passed. Later Task 16 viewport reapplication did not change measured desktop width, so final billing/dashboard narrow views rely on verified Tasks 14/15 evidence; Task 16 separately observed narrow patient/prescription/inventory layouts. Print retains Task 12 explicit user confirmation; no new native preview claimed.

All owned test servers are stopped; browser viewport reset. Keep this chat for final verification/recovery questions. No next numbered refactor task or deployment is pending; use a fresh chat only for a separately scoped feature.

### Post-completion verification

On 2026-11-21, the user requested another full verification. `16-reverify.py` passed against new private rehearsal copies; fresh results are in `16-reverification.json`. This reran API contracts/restart, aggregate/routes/CORS, migrations/restore/legacy reads, all six JS checks, syntax/dependencies, HTTP/assets and data/backup/retirement preservation. Active source and clinic DB were unchanged; owned servers stopped. This was an automated rerun, retaining earlier browser visual and user-confirmed print evidence rather than claiming new manual checks.
