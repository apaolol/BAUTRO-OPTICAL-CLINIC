# Task 01: Baseline and backup
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** none

## Objective
Capture current contracts and protect existing data before generation.

## Commands / Reference
- FISHTOOL command (if relevant): None; read-only baseline first.
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; WEBDEV + ADBMS/WEBDEV3.pptx
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Record git status, interpreter/package versions and course-folder availability; preserve pre-existing user changes. Confirm a supported interpreter before dependency setup.
- [x] Read existing routes, schemas and screens; record synthetic request/response examples for every README endpoint, including errors and statuses. Do not execute refactor_backend.py.
- [x] Close database writers and make verified database and legacy-source backups; record absolute locations and restoration steps without clinical values. Recheck table counts/schema/indexes and exact alembic_version.
- [x] Verified: SQLite backup integrity_check is ok, schema/counts match source and baseline covers all endpoints and five screens.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `02-generate-fishtool-project.md` (Task 02); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Recorded source-derived endpoint/UI baseline and validated synthetic POST schemas; captured environment, consistent SQLite backup and source archive.
- **Commands run / files created or changed:** git status, Python version/pip list and pip dependency dry run; source reads; standard-library SQLite backup/zip/hash verification. Created tasks/setup-baseline.json and tasks/01-baseline-evidence.md. Backup: C:\Users\USER\Desktop\BAUTRO OPTICAL CLINIC\.setup-backups\tasks-01-02-20261120
- **Verification result:** All 14 routes and five screens documented from source; four POST examples schema-valid; backup integrity/schema/counts/archive hashes verified; original DB hash unchanged.
- **Deviations / notes:** CIM process inspection unavailable; used online backup, without killing processes. Legacy SQLAlchemy missing, so HTTP/browser baseline is explicitly source-derived, not runtime-tested. Backup excludes dependency/cache/build directories; backup is retained in Git-ignored .setup-backups outside backend/frontend. A first sandbox-temp snapshot was inaccessible on the next invocation, so the backup was recreated and fully reverified in this persistent location before scaffolding.
