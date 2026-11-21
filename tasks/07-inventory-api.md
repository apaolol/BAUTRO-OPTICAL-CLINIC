# Task 07: Port inventory and restock API
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 06

## Objective
Preserve inventory defaults and incremental query-parameter restock.

## Commands / Reference
- FISHTOOL command (if relevant): Customize generated app/routers/Inventory.py
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; WEBDEV + ADBMS/WEBDEV1.pptx update
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Implement GET/POST /inventory/ and PUT /inventory/{item_code}. Preserve optional values/defaults, ITM code and 200 {item_code} creation response.
- [x] Restock takes required integer quantity query parameter, increments stored quantity rather than replacing the row and returns {item_code,new_quantity}. Missing item remains 200 {error: Not found}; no JSON replacement body.
- [x] Verified: defaults, explicit zero/null prices, repeated increments, missing item, missing/noninteger query 422 and restart persistence match legacy. Record negative/zero delta limitation without silently changing API.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `08-billing-api.md` (Task 08); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-20 (Asia/Singapore)
- **Summary of what was done:** Customized generated Inventory router with InventoryCreate, direct SQLModel sessions/select/count and shared ITM formatter. Added string-code PUT with required integer quantity query delta, increment/commit/refresh and compatible missing-item error response. Create returns 200/item_code only; fields/defaults retained.
- **Commands run / files created or changed:** Read task rules/README, Task 06 log, git status, current/legacy inventory models/routes/services and actual webdev test.py. Changed backend/app/routers/Inventory.py; added tasks/07-verify-inventory.py and tasks/07-inventory-verification.json. Ran synthetic ASGI verifier via .venv Python outside sandbox with 50-second parent and 25-second restart-child timeouts. Ran separate legacy SQLAlchemy in-memory null/default check. Updated this checklist/log and README. No generation, migrations or dependencies changed.
- **Verification result:** Empty/list/create, complete fields, defaults, zero/null prices, blank strings and ignored client id/code passed. Repeated positive, zero and negative increments produced expected totals, leaving other fields unchanged; missing code and integer-ID strings returned 200/error. Missing/empty/noninteger/fractional query and invalid create numbers returned 422; body cannot replace query. OpenAPI contains only GET/POST collection and PUT code, required integer query and no request body; GET detail/DELETE return 405. Fresh process reopened synthetic data, restocked again and created ITM-00005. Integrity passed; clinic database and baseline backup hashes unchanged. Separate legacy in-memory insert confirms explicit null quantity/reorder become 0/5 while null prices stay null. git diff --check passed.
- **Deviations / notes:** No contract changes. Preserved zero/negative deltas (can make stock negative), count+1 collision risk and legacy inability to increment an existing SQL NULL quantity; no fallback invented. Explicit null quantity/reorder input is accepted but ORM insert defaults apply, confirmed against legacy. Verification used bounded outside-sandbox execution for established Windows asyncio restrictions; no browser/network HTTP or concurrency tests. Patient/prescription code and model/schema unchanged. Task 08 remains Not started. Chat recommendation: KEEP THIS CHAT for Task 08 (tasks/08-billing-api.md), continuing the API phase. Stop after Task 07.
