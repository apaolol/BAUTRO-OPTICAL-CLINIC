# Task 04: Preserve database and migrations
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 03

## Objective
Wire generated runtime and FISHTOOL migration layout to existing SQLite safely.

## Commands / Reference
- FISHTOOL command (if relevant): From backend/: python fishtool.py migrate; makemigrations "message" only for a required schema change; rollback only on disposable copies
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/database.py; test.py lifespan
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Resolve backend/bautro.db relative to generated database.py, with FastAPI-compatible SQLite thread settings; runtime/Alembic share the exact path regardless of working directory. Import all models before create_all.
- [x] Copy legacy revisions into backend/migrations, configure alembic.ini there, adapt env.py to SQLModel.metadata/generated imports and engine, and retain revision IDs/mako imports. Retain legacy history until final acceptance.
- [x] Rehearse existing populated-copy upgrade and fresh disposable database upgrade through the preserved chain. Never stamp blindly, reset data or create a competing initial migration. Schema-equivalent conversion requires no new revision.
- [x] For any necessary change, log reason, generate through FISHTOOL, review/repair all nullable/default rewriting and operations before apply. Test rollback only on rehearsal copies; confirm actual revision/schema rather than trusting process exit.
- [x] Verified: counts/IDs/dates/lens columns/indexes survive, integrity_check is ok, metadata matches schema, startup is schema-neutral and no app/database.db appears.

## Chat handoff
- Default recommendation: Start a fresh chat after this task: database/model setup is finished and backend API work begins.
- Next planned task: `05-patients-api.md` (Task 05); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Wired generated runtime to module-relative backend/bautro.db with SQLite check_same_thread=False; ensured model registration before create_all. Copied unchanged legacy revisions into FISHTOOL-compatible migrations layout; shared runtime engine/URL and SQLModel metadata in migration env. No schema change or new revision required.
- **Commands run / files created or changed:** Changed backend/app/database.py and backend/alembic.ini (migrations script path, module-relative imports, URL delegated to app). Added backend/migrations/env.py, script.py.mako with sqlmodel import, README and two byte-identical revision files. Ran FISHTOOL migrate on fresh/populated rehearsal copies, rollback/re-upgrade on synthetic data, offline upgrade SQL, Alembic current/check from outside backend, lifespan checks and actual existing-head migrate. Evidence: tasks/04-migration-verification.json. Rehearsals retained under .setup-backups/task04-migration-rehearsal/.
- **Verification result:** Full-chain fresh upgrade, populated-copy preservation, synthetic rollback/re-upgrade and six-table/index/lens-column comparisons passed. Alembic check reports no changes on both copies and real database. Runtime and Alembic resolve the same absolute path from project-root cwd. Lifespan is schema-neutral on copies and real DB. Original database SHA-256 still matches Task 01 byte-for-byte; legacy code/revision files unchanged except intended requirements and Alembic ini setup. No cwd/default database was created.
- **Deviations / notes:** No makemigrations needed because metadata matches existing schema. Retained legacy alembic/ directory for rollback until Task 16. First rehearsal exposed missing venv Scripts on PATH (FISHTOOL shells out to alembic); corrected session PATH and reran successfully. Sandbox asyncio local socket initialization stalled before lifespan; terminated only the rehearsal child and reran outside sandbox with subprocess timeouts, without altering app logic. No HTTP server was started. No new dependencies. Generated collection POSTs remain provisional until Tasks 05-08. Chat recommendation: START A FRESH CHAT for Task 05, the API phase; use the context prompt in the completion reply and tasks/chat-handoff.md. Stop here; Task 05 not started.
