# Task 08: Port billing API
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 07

## Objective
Preserve invoice storage and existing monetary contract.

## Commands / Reference
- FISHTOOL command (if relevant): Customize generated app/routers/Billing.py
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; models.py
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Implement GET/POST /billing/ and string-code GET /billing/{invoice_number} with direct sessions.
- [x] Retain patient_number and five required monetary fields (subtotal, discount, total, amount_paid, balance), optional payment_method/status (default Pending), server date/INV code and 200 {invoice_number}. Missing lookup stays 200/null. Persist submitted totals/status without recalculating or adding patient checks.
- [x] Verified: isolated Paid/Partial/Pending, explicit optional nulls, monetary round trips, missing required amounts 422 and restart persistence match the baseline.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `09-dashboard-api.md` (Task 09); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Customized generated Billing router with InvoiceCreate, direct SQLModel sessions/select/count, shared INV formatting and server date. Added string business-code lookup; create returns 200/invoice_number only, missing lookup returns 200/null. All submitted amounts/status retained without recalculation or patient checks.
- **Commands run / files created or changed:** Read task rules/README, git status, current/legacy billing models/routes/services and actual webdev test.py/models.py. Changed backend/app/routers/Billing.py; added tasks/08-verify-billing.py and tasks/08-billing-verification.json. Ran .venv Python verifier outside sandbox via 50-second bounded subprocess (restart child 25 seconds). Updated task status/checklist/log and README progress/monetary-field count. No generation, migrations or dependency changes.
- **Verification result:** Synthetic in-process FastAPI ASGI checks passed empty/list/create/detail/missing, exact code-only 200 create, ignored client id/code/date, Paid/Partial/Pending, default Pending, explicit null/blank optional values and decimal monetary round trips. Deliberately inconsistent/negative totals and custom status remained submitted, proving no recalculation. Every required field missing/null/wrong type returned 422. Nonexistent/empty patient code accepted with zero patient rows. OpenAPI has only three billing operations; PUT/DELETE return 405, integer ID string does not resolve a record. Fresh Python process checked all persisted fields and created INV-00007. SQLite integrity and original clinic database/baseline backup hashes passed. No default DB created. git diff --check passed.
- **Deviations / notes:** Documentation correction only: legacy/generated schemas both have FIVE monetary inputs (subtotal, discount, total, amount_paid, balance), not six as earlier task/README prose stated; patient_number is the sixth required input. Corrected current task/README, retained historical baseline evidence with this clarification. No API/schema change. Outside-sandbox bounded checks used established Windows asyncio workaround. No network HTTP/browser/concurrency test; float money and count+1 collision limitations retained. Other handlers/models unchanged. Task 09 remains Not started. Chat recommendation: KEEP THIS CHAT for Task 09 (tasks/09-dashboard-api.md), the last API task; consider a fresh chat after Task 09 for frontend work. Stop after Task 08.
