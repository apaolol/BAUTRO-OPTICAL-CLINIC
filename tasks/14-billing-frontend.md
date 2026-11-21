# Task 14: Build billing frontend
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 13

## Objective
Preserve invoice forms, details, search and frontend calculations.

## Commands / Reference
- FISHTOOL command (if relevant): Static server/backend
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/register.html; BAUTRO_EXAM/src/js/editProfile.js
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Create billing page/JS using GET/POST /billing/, patient/subtotal/discount/paid/payment inputs, details, peso formatting, statuses, code feedback and list refresh; search invoice/patient number.
- [x] Use total=max(0,subtotal-discount), balance=max(0,total-paid), Paid when balance<=0 else Partial if paid>0 else Pending. Send all five monetary values, payment_method and status.
- [x] Verified: zero/partial/full/overpayment and excess discount match existing formulas; blank patient, search/details, saved values and failed-submit recovery work.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `15-dashboard-frontend.md` (Task 15); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-21 (Asia/Singapore)
- **Summary of what was done:** Built vanilla billing list/create/search/full details using shared native fetch/peso helpers. Required trimmed patient number; subtotal/discount/amount-paid inputs default blank to zero; optional payment method blank becomes null. Live total=max(0,subtotal-discount), balance=max(0,total-paid) and Paid/Partial/Pending match legacy. Sends all five monetary fields, patient number, payment method and status. Added generated INV feedback/list refresh, counts, loading/empty/no-match/errors, cancel/reset, details close/focus return and duplicate-submit/finally recovery. Standard responsive CSS contains horizontal table scrolling.
- **Commands run / files created or changed:** Read rules/current task/README carryover, git status, legacy Billing.tsx, current shell, generated model/router and actual part2 register.html native-fetch example. Changed frontend/pages/billing.html and src/js/billing.js; added src/css/billing.css, tasks/14-preview-server.py and 14-verify-billing-frontend.js. Corrected stale current-task checklist from six monetary values to five per Task 08 evidence. Actual Billing.engine redirected to .setup-backups/task14-synthetic/billing.db with lifespan off. Ran static/isolated API servers, browser six calculation/create scenarios, searches/details/blank validation/cancel, stopped-backend save/list failure, restart/retry/refresh persistence and responsive layout checks. Ran new DOM verifier and Task 10 shared-helper regression. Read-only SQLite assertions checked all seven saved invoices' monetary/status/payment/code/patient/date fields, row count and integrity; baseline DB/backup/retained legacy source hashes verified. Added verification JSON and updated task/README progress. No generation, migrations, installs or original DB writes; both servers stopped.
- **Verification result:** Browser zero invoice returned Paid/0; unpaid 100 returned Pending/100 balance; 100 subtotal/10 discount/40 paid returned Partial/90 total/50 balance; full 90 and overpaid 120 returned Paid/zero balance; discount 150 on subtotal 100 returned Paid/zero total/balance. All six saves displayed generated code and refreshed list with correct payment method/null and pesos. Invoice/patient mixed-case searches and clear/no-match/counts worked; all ten detail fields displayed safely. Blank trimmed patient rejected and cancel/reset worked. Stopped backend retained decimal form inputs and enabled retry controls; restart recovered six records and successful retry saved INV-00007 (12.50/2.25/10.25/4.50/5.75, Partial), all seven persisted on refresh. Unit checks covered those cases, five monetary payload keys/types, live display, blank-to-zero, nonfinite/negative rejection, duplicate guard (one POST), disabling/finally/error retention and literal text details. Desktop page/viewport 1265/1265, table/container 1000/935; narrow page/viewport 360/360, table/container 1000/290 with contained scrolling. Screenshots/details verified; viewport reset. SQLite integrity and baseline DB/backups/legacy hashes unchanged; git diff --check passed.
- **Deviations / notes:** Documentation correction only: Task 14 still said six monetary values despite Task 08 clarification; corrected to five without API/schema change. Backend continues to store submitted monetary fields/status without recalculation or patient existence check; frontend formulas preserve existing behavior. Float money/rounding and count+1/non-idempotent create limitations remain; ambiguous network failures advise refresh before retry. Test harness redirects Billing router only; do not exercise other domains through it. Inline form/details sections follow previous vanilla screens; no new frontend dependency. Existing Task 10–13 work, legacy frontend, clinical data and backups preserved. Task 15 remains Not started and its Task 14 prerequisite is complete. Chat recommendation: KEEP THIS CHAT for Task 15 (tasks/15-dashboard-frontend.md), the last frontend screen. Stop after Task 14.
