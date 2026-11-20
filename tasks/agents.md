# Rules for the future execution agent

## Project and architecture

Bautro Optical Clinic manages patients, prescriptions, inventory, billing and dashboard summaries. Rebuild WITH FISHTOOL: FastAPI + SQLModel + SQLite in `backend/app/`, and multi-page vanilla HTML/JavaScript/standard CSS in `frontend/`. Course references live at `C:/Users/USER/Desktop/webdev`, a separate source folder. Read `README.md` here for discovery, contracts, generator details and open questions.

## Hard constraints

- Use FISHTOOL commands to generate structure before hand-editing. Generate each model/router before customization. Keep the tool at the verified upstream revision; do not rewrite it or hand-build an imitation scaffold.
- Follow actual webdev conventions: SQLModel Field/type hints, direct `with Session(engine)` and `session.exec(select(...))`, simple functions, DOM input reads, native fetch/JSON and try/catch. No extra service/repository framework. SQLModel internally uses SQLAlchemy; retain its transitive dependency and Alembic migration imports.
- Frontend uses vanilla JS and standard CSS only. No React, TypeScript, bundler, preprocessor, Axios or new UI framework. Follow BAUTRO_EXAM's pages/src/js/src/css layout and part2's fetch pattern; preserve clinic branding.
- Note any new dependency, reason and resolved version in the current task before installation. Planned direct backend dependencies: fastapi, uvicorn, sqlmodel, alembic. No frontend dependencies.
- Preserve existing data, schema and API behavior unless an approved deviation is logged. Do not run migrations/rollback/destructive tests on the only database copy. No patient values in logs. Do not modify webdev materials or execute backend/refactor_backend.py.
- No appointments/expenses features, authentication, payment processing, deployment or analytics additions in this refactor.

## Workflow

1. Read this file, README and the current numbered task before touching code.
2. Work one task at a time in numeric order. Verify dependencies before starting.
3. After finishing a task, tick verified checklist boxes and fill its Completion Log before starting the next. Status starts with all choices unchecked and prose Not started; select In progress during execution and Done only after verification.
4. Record blockers or scope changes under Deviations / notes; never silently deviate. Unresolved product questions default to compatibility. Block an action if a missing decision prevents safe data preservation.
5. Never tick a box unless it was actually verified. Discovery does not complete execution tasks. Failed/partial checks remain unchecked.
6. Preserve user edits and verified rollback backups. Review explicit paths before retiring old files after acceptance.

## Future run/test commands

These commands are for execution only. None ran during planning.

- From backend/: `python -m pip install -r requirements.txt` after dependency review. Record supported interpreter and resolved versions.
- From backend/: `python fishtool.py new`, `python fishtool.py makemodel Patient` (then other names in Task 03), `python fishtool.py makerouter dashboard`. Never repeat new over customized files or use --force.
- From backend/: `python fishtool.py serve`, equivalent to `python -m uvicorn app.main:app --reload`. Do not start before wiring the database: default startup creates app/database.db.
- From frontend/: `python -m http.server 5500 --bind 127.0.0.1`; open `http://127.0.0.1:5500/`. No npm build/install needed.
- `python fishtool.py list` is preliminary; verify resolved paths/statuses at `http://127.0.0.1:8000/openapi.json`, exercise `/docs` or Postman with synthetic data and inspect browser network/errors.
- `python fishtool.py makemigrations "message"` only for an actual reviewed schema change; `python fishtool.py migrate` after history reconciliation. `python fishtool.py rollback` only on rehearsal copies. Inspect migration output/defaults before applying. FISHTOOL can log failures without a failing process exit code: verify actual revision/schema.
- Compare schema/indexes/counts and run SQLite `PRAGMA integrity_check` on rehearsal copies. Manual Swagger/Postman/browser checks match the course materials; no new test framework is required.

## Definition of done

Every numbered task has verified checks and a completed log. All 14 existing routes including root match the compatibility table; no unintended generated routes are exposed. All six tables and existing records survive with consistent migration history. Five vanilla screens preserve forms, search, details, restock, billing calculations, prescription printing, errors and restart persistence. Document run/restore commands and dependencies. Retire legacy implementation only after parity and verified backups; do not claim deployment.
