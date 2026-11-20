# Task 04: Preserve database and migrations
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
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
- [ ] Resolve backend/bautro.db relative to generated database.py, with FastAPI-compatible SQLite thread settings; runtime/Alembic share the exact path regardless of working directory. Import all models before create_all.
- [ ] Copy legacy revisions into backend/migrations, configure alembic.ini there, adapt env.py to SQLModel.metadata/generated imports and engine, and retain revision IDs/mako imports. Retain legacy history until final acceptance.
- [ ] Rehearse existing populated-copy upgrade and fresh disposable database upgrade through the preserved chain. Never stamp blindly, reset data or create a competing initial migration. Schema-equivalent conversion requires no new revision.
- [ ] For any necessary change, log reason, generate through FISHTOOL, review/repair all nullable/default rewriting and operations before apply. Test rollback only on rehearsal copies; confirm actual revision/schema rather than trusting process exit.
- [ ] Verified: counts/IDs/dates/lens columns/indexes survive, integrity_check is ok, metadata matches schema, startup is schema-neutral and no app/database.db appears.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
