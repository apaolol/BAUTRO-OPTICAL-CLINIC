# Task 16: Acceptance and cutover
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 15

## Objective
Verify full parity before retiring legacy code.

## Commands / Reference
- FISHTOOL command (if relevant): backend/: python fishtool.py list; python fishtool.py serve. frontend/: python -m http.server 5500 --bind 127.0.0.1. Swagger/Postman/browser checks.
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): WEBDEV + ADBMS/WEBDEV3.pptx Postman; BAUTRO_EXAM layout
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Exercise all README endpoint contracts and screen scenarios on isolated synthetic data; record statuses/shapes, clinical fields/codes, increments, revenue, print and persistence across restart.
- [ ] Confirm fresh/populated-copy migration paths, schema/index/count parity, integrity_check and usable backup restoration. Rehearse legacy startup/restore on disposable copy, then return to generated backend.
- [ ] Check direct URLs, desktop/narrow layouts, keyboard/labeled forms and network/error recovery. Confirm no React/TS/bundler runtime is used.
- [ ] Only after parity, record explicit retirement paths and remove legacy backend routes/services/models/refactor script and duplicate old migration directory; retire React/Vite/TS manifests/source and unused assets. Preserve generated app, database, tool, current history, task logs and external verified rollback backup.
- [ ] Document final Python run/restore commands and dependency rationale; record unresolved limitations. No deployment. Complete all logs before claiming success.
- [ ] Verified: final diff is intentional, all active features run without npm, existing data survives, only intended routes are exposed and rollback instructions are usable.

## Chat handoff
- Default recommendation: No next refactor task. Keep this chat for questions about final verification; use a fresh chat for a separately scoped feature.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
