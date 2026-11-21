# Task 15: Build dashboard frontend
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 14

## Objective
Preserve six cards and low-stock overview on static index.

## Commands / Reference
- FISHTOOL command (if relevant): Static server/backend
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): BAUTRO_EXAM/index.html; part2/BAUTRO_PART2/register.html
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Implement dashboard.js GET /dashboard/ with six cards, peso revenue, low-stock warning/list, refresh/retry and empty/loading/error states.
- [x] Verified: values reconcile with other pages, threshold equality is visible, restock removes an above-threshold item on refresh, navigation back to index works and stopped-backend retry recovers.

## Chat handoff
- Default recommendation: Start a fresh chat after this task: frontend implementation is finished and acceptance/cutover review begins.
- Next planned task: `16-acceptance-and-cutover.md` (Task 16); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-21 (Asia/Singapore)
- **Summary of what was done:** Replaced dashboard workspace shell with six data cards and low-stock overview. Implemented GET /dashboard/, peso revenue, safe text table, equality-inclusive backend stock warning, explicit no-low-stock/zero states and refresh/retry/loading/errors. Hides stale content while loading or after failure, restores controls in finally and guards duplicate requests. Added responsive three/two/one-column cards and contained stock table scrolling.
- **Commands run / files created or changed:** Read task rules/README carryover, Task 15/16 requirements, git status, legacy Dashboard.tsx/current root/backend dashboard and actual BAUTRO_EXAM index layout; native-fetch course convention reviewed in preceding tasks. Changed frontend/index.html and src/js/dashboard.js; added src/css/dashboard.css, tasks/15-preview-server.py and 15-verify-dashboard-frontend.js. Harness redirects ALL active router engines to one .setup-backups/task15-synthetic/clinic.db and disables lifespan, preventing original DB access. Browser verified initial empty data, seeded reconciliation across all four screens/navigation, Inventory restock→Dashboard refresh, network stop/restart/retry and desktop/narrow layouts. Seeded via actual synthetic POST APIs only; set one synthetic invoice to prior day directly for date-filter verification. Ran new DOM tests and Task 10 shared-helper regression. Read-only SQLite final counts/stock/revenue/integrity and baseline DB/backup/legacy hash checks passed. Added verification JSON and updated README/task progress. No generation/migrations/installs, no original DB writes; both servers stopped.
- **Verification result:** Empty dashboard displayed four count zeros, two peso zeros and no-low-stock message/table hidden. Seeded cards showed 2 patients, 1 prescription, 3 inventory rows, today revenue 40 and total revenue 50, low count 2; list page counts and billing paid sum reconciled. Inventory row count was not unit count; today/prior invoice amount_paid sums distinguished. Equality item 5/5 appeared with zero-stock item; UI restock +1 made it 6/5 and Dashboard refresh removed it, leaving count 1 and only the zero-stock row. Normal Dashboard link returned to index from all four pages. Stopped backend produced visible error/Retry and hid stale content; restart of same synthetic DB and Retry recovered correct persisted values. DOM checks passed six cards, zeros/stock warning/no-stock, safe literal text/null display, malformed response rejection, pending duplicate guard, loading hide/disable and error/finally/retry recovery. Desktop page/viewport 1265/1265 with three card columns; narrow page/viewport 360/360 with one column and 600px table inside 290px scrolling container; screenshots verified and viewport reset. Final synthetic counts 2/1/3/2, collected total 50, restocked quantity 6, integrity ok. Original DB, both baseline backups and retained legacy frontend hashes unchanged; git diff --check passed.
- **Deviations / notes:** No backend/API contract changes. Kept aggregate semantics from verified backend: row counts, amount_paid revenue, today server date and null-safe stock threshold. Response shape/count validation shows recoverable error rather than silently fabricating zeros. All active routers are redirected in this task's harness so cross-screen synthetic navigation is safe; earlier per-domain harnesses redirect only their own router. Legacy sources, manifests, backup and original data remain for Task 16; no cutover or deployment performed. Task 12 native print preview is user-confirmed as recorded there, not automatically inspected. Existing float/count+1/no-idempotency/backend compatibility limitations remain. Task 16 is confirmed Not started with Task 15 prerequisite complete. Chat recommendation: START A FRESH CHAT for Task 16 (tasks/16-acceptance-and-cutover.md), since frontend implementation is complete and acceptance/retirement review begins. Use tasks/15-task16-handoff.md; preserve uncommitted work and verified backups. Stop after Task 15.
