# Task 05: Port patients API
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 04

## Objective
Preserve patient requests, records and responses in generated routers.

## Commands / Reference
- FISHTOOL command (if relevant): Customize generated app/routers/Patient.py; no new generation
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; models.py
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Implement only GET/POST /patients/ and GET /patients/{patient_number} using direct SQLModel sessions/select and string business-code lookup.
- [x] Keep all demographic/clinical values, required full_name/contact_number, server date_created and P-{count+1:05d}. Put shared formatting in a small app/internal function. Return 200 with only patient_number on create; missing lookup remains 200/null.
- [x] Verified: isolated create/list/detail/missing scenarios cover all optional/null clinical values, required-field 422, generated code/date and restart persistence.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `06-prescriptions-api.md` (Task 06); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Customized generated Patient router with PatientCreate input, direct SQLModel count/select/session logic, string business-code lookup and legacy 200 responses. Added app/internal/ids.py shared formatter. Preserved all fields and server-owned code/date; no model/schema changes.
- **Commands run / files created or changed:** Read task history/evidence, git status, legacy patient route/service/schema and actual webdev test.py/models.py/orm.py. Changed backend/app/routers/Patient.py; added backend/app/internal/ids.py, tasks/05-verify-patients.py and tasks/05-patients-verification.json. Ran .venv Python tasks/05-verify-patients.py outside sandbox through a subprocess with a 50-second timeout; verifier bounds restart child to 25 seconds. Updated this checklist and README progress. No generation, migration or dependency installation.
- **Verification result:** In-process ASGI requests through FastAPI passed empty/list/create/detail/missing, every optional field populated/null/omitted, required/missing/null and invalid-age 422, ignored client id/code/date, exact create 200/code-only, missing 200/null, only three patient OpenAPI operations and PUT/DELETE 405. A fresh Python process reopened synthetic SQLite, read the persisted records and generated P-00004. Synthetic integrity_check passed. Original database SHA-256 matches Task 01; both baseline backup hashes match. No default database created.
- **Deviations / notes:** No contract deviations. Initial sandbox verification stalled without output and was stopped; bounded outside-sandbox run resolved it, consistent with Task 04 asyncio restrictions. First outside-sandbox run passed assertions but failed temporary-directory cleanup because sqlite3 context management does not close the handle; fixed with contextlib.closing and reran successfully. Aborted/failed runs may leave synthetic-only task05-* directories under .setup-backups; baseline backups untouched. No network HTTP/browser or concurrency checks performed. Count+1 collision limitations remain intentionally compatible. Other routers/root remain pending Tasks 06-09; Task 06 not started. Chat recommendation: KEEP THIS CHAT for Task 06 (tasks/06-prescriptions-api.md), which continues the same API phase. Shared formatter is ready for reuse.
