# Task 02: Generate FISHTOOL project
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 01

## Objective
Generate backend/app before customizing backend code.

## Commands / Reference
- FISHTOOL command (if relevant): From backend/: python fishtool.py new; python fishtool.py list
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/database.py; test.py
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Obtain fishtool.py at README pinned commit and record source/hash. Check backend/app is absent; stop instead of overwriting an unexpected scaffold.
- [x] Review requirements: fastapi, uvicorn, sqlmodel, alembic; retain other packages only for demonstrated use. Record versions/reasons, then install with python -m pip install -r requirements.txt during execution only. Avoid fishtool init and a second migration chain.
- [x] Run new once from backend/ and record generated files. Preserve legacy source/database. Do not start generated lifespan against its default database.
- [x] Verified: scaffold matches source templates, dependencies import successfully, app.* imports are consistent and no app/database.db was created.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `03-generate-sqlmodel-models.md` (Task 03); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Completed reviewed dependency installation and generated the pristine FISHTOOL scaffold after Task 01 backup verification. No models, migrations or custom runtime changes.
- **Commands run / files created or changed:** Downloaded backend/fishtool.py from upstream commit 93d4af1aefe48bfe3fd663d323f96a576df67b67. SHA-256: d29dd56f57c2f30f3f36f80634246d78870211d3ed8b9ee184aeb264ad8d2bc0. Reviewed/pinned backend/requirements.txt before installation. Ran .venv Python pip install -r backend/requirements.txt, then from backend/ fishtool.py new and fishtool.py list. Generated eight app package files: __init__.py, main.py, database.py, dependencies.py, routers/__init__.py, models/__init__.py, internal/__init__.py and internal/admin.py. Evidence: tasks/02-setup-verification.json.
- **Verification result:** All eight generated files exactly match upstream templates. Dependency/generated-package imports pass on Python 3.14.2; isolated in-memory SQLModel create/read passes; pip check finds no conflicts. Original database/source hashes (except requirements) and persistent backup hashes match baseline. No app/database.db or migrations directory exists. CLI list correctly reports no router endpoints. No lifespan/server started.
- **Deviations / notes:** Dependency review: retain installed FastAPI 0.136.3 (API) and Uvicorn 0.48.0 (server); add SQLModel 0.0.50 (course ORM) and Alembic 1.20.1 (existing migration chain/FISHTOOL). Pin direct versions. Dry-run transitive additions: SQLAlchemy 2.1.9, Mako 1.4.3, MarkupSafe 3.0.4. Pydantic remains SQLModel/FastAPI's installed transitive dependency. Removed openpyxl/python-multipart from the manifest because no current route uses spreadsheet export/uploads; do not uninstall existing packages. Existing runtime code unchanged. Upstream script emits SyntaxWarning for invalid escape sequences in logo/latest-migration path on Python 3.14; new/list completed successfully, upstream left unchanged. Runtime database-path customization remains Task 04; do not serve the empty scaffold yet.
