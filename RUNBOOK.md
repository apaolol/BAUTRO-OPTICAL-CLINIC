# Bautro Optical Clinic local run and recovery

Task 16 accepted the generated FastAPI/SQLModel backend and five vanilla pages on 2026-11-21. This is a local development cutover; no deployment was performed.

## Run

Open PowerShell at `C:/Users/USER/Desktop/BAUTRO OPTICAL CLINIC`. Use the project-root `.venv`, not the historical nested `backend/.venv`.

```powershell
Set-Location 'C:/Users/USER/Desktop/BAUTRO OPTICAL CLINIC'
. ./.venv/Scripts/Activate.ps1
Set-Location backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In a second PowerShell window:

```powershell
Set-Location 'C:/Users/USER/Desktop/BAUTRO OPTICAL CLINIC/frontend'
../.venv/Scripts/python.exe -m http.server 5500 --bind 127.0.0.1
```

Open [Dashboard](http://127.0.0.1:5500/), or any `pages/patients.html`, `prescriptions.html`, `inventory.html`, `billing.html` URL directly. API documentation is at [Swagger](http://127.0.0.1:8000/docs). Stop each server with Ctrl+C. No npm install/build or frontend dependencies are needed.

Python 3.14.2 was verified. `backend/requirements.txt` pins FastAPI 0.136.3 for API handling, Uvicorn 0.48.0 for serving, SQLModel 0.0.50 for course-style persistence and Alembic 1.20.1 for the preserved history. SQLAlchemy/Pydantic are required transitive dependencies. No upload/export route uses openpyxl or python-multipart, so those are absent from the manifest. An already-working environment needs no reinstall. For a new environment, install this reviewed manifest with `python -m pip install -r backend/requirements.txt` from the project root, then `python -m pip check`.

Runtime and Alembic share module-relative `backend/bautro.db`. Existing data is at revision `fae1679855f7`. No new migration was needed. For a reviewed NEW empty database setup, run migrations before first application startup; create_all alone does not establish migration history. Activate the root environment, enter backend, and use `python fishtool.py migrate`. Do not regenerate scaffolding, stamp blindly or downgrade live clinic data. FISHTOOL shells out to Alembic, so the environment Scripts directory must be on PATH. Resolved OpenAPI has exactly 14 operations; FISHTOOL list also scans inactive Appointment/Expense router files.

## Preserved rollback material

Keep all `.setup-backups` material private and out of Git. It contains clinical data even though evidence JSON contains schema/counts/hashes only.

- `.setup-backups/tasks-01-02-20261120/legacy-source.zip` and `bautro.db`: original verified baseline. Their hashes are in `tasks/setup-baseline.json`.
- `.setup-backups/task16-acceptance/pre-cutover-source.zip`: verified current source immediately before retirement, including uncommitted vanilla work. It excludes database/dependency/cache directories. Hash and explicit retirement paths are in `tasks/16-retirement-manifest.json`.
- `.setup-backups/task16-retired/`: exact legacy paths moved out of the active tree after acceptance, including existing frontend/node_modules. Source hashes match baseline. Moving back into a new review folder is reversible.
- `.setup-backups/task16-acceptance/legacy/`: successfully rehearsed legacy backend restoration. Fresh/populated migration rehearsal copies are nearby. Do not serve these private directories with the static server.

Baseline documentation correction: the original source zip actually contains 538 files, including 483 nested legacy `backend/.venv` pip files; it excludes frontend/node_modules. Treat that nested environment as historical material, not a usable restored runtime. Use the root environment or install reviewed dependencies in a new environment.

## Restore and rehearse safely

From the project root, choose a NEW review name (the script refuses existing destinations):

```powershell
./.venv/Scripts/python.exe tasks/16-restore-copy.py my-review
```

This verifies both baseline backup hashes and archive CRC, extracts the original source to `.setup-backups/restore-my-review/`, verifies every extracted hash, restores SQLite with its backup API, and checks integrity/schema/index/count parity without printing records. The exact command was rehearsed with `task16-command-rehearsal`.

For legacy backend startup, stop any existing port-8000 server first. From the project root:

```powershell
Set-Location .setup-backups/restore-my-review/backend
../../../.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Legacy database.py uses the current directory; this working directory is mandatory. Task 16 exercised the restored legacy application with an explicit session override pointing only to the disposable restored DB; it returned 200 for root, four lists and dashboard without changing the copy. For the legacy frontend, use the restored frontend as working directory, with its archived original index and manifests. Recover the retained dependencies into that review folder or run its locked `npm ci` in a separately reviewed recovery environment, then `npm run dev -- --host 127.0.0.1`. Task 16 successfully launched Vite 8.3.1 using the existing retained dependencies and rendered the React shell; the generated backend was deliberately stopped during that shell check, so its expected load-error state was visible. Full legacy feature/browser parity is source-derived plus generated acceptance evidence, not a newly repeated legacy UI test.

Return to generated runtime using the Run commands above; do not copy old entry points into the accepted active source tree.

For an actual live-data rollback, stop all writers and close database sessions first. Take a NEW online SQLite backup of the latest clinic database before any replacement; the Task 01 backup predates future entries. Restore into a new candidate file, validate it and compare with the intended recovery point. Keep current source/data separately and reconcile newer records before selecting any older snapshot. Never overwrite newer user work or leave WAL/SHM files from a different database attached. The provided restore command intentionally does not replace the live database. No live restore or data rollback was performed during this refactor.

## Acceptance evidence and limits

See `tasks/16-acceptance-verification.json`, `16-retirement-manifest.json` and the Task 16 Completion Log. Tasks 10–15 preserve the detailed browser create/search/detail/restock/calculation/error/restart evidence; Task 12 selected-record native print preview was explicitly user-confirmed. Task 16 reran all domain contract verifiers and all six JS verifiers, checked browser direct URLs/layouts/labeled forms/keyboard cancellation/network recovery, migration/restore rehearsals, and repeated domain contracts/restart after retirement. Node is only a verification tool. The main acceptance script refuses to reuse an existing synthetic database rather than delete evidence; run its `contracts` and `restart` worker modes against a NEW private SQLite path for a focused repeat.

Compatibility limitations remain: count+1 codes can collide under concurrent creates/deletion; creates/restocks lack idempotency; money uses floats; API stores submitted invoice totals/status and does not check linked patient existence; missing lookups return 200/null or an error object; API accepts zero/negative restock deltas while the UI requires positives; existing SQL NULL stock cannot be incremented. Appointments/expenses are preserved tables without active routes/screens. There is no authentication, payment processing, production hardening or deployment. Desktop and narrow QA is functional/visual, not a formal assistive-technology audit or concurrency/load test.
