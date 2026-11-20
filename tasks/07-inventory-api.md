# Task 07: Port inventory and restock API
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
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
- [ ] Implement GET/POST /inventory/ and PUT /inventory/{item_code}. Preserve optional values/defaults, ITM code and 200 {item_code} creation response.
- [ ] Restock takes required integer quantity query parameter, increments stored quantity rather than replacing the row and returns {item_code,new_quantity}. Missing item remains 200 {error: Not found}; no JSON replacement body.
- [ ] Verified: defaults, explicit zero/null prices, repeated increments, missing item, missing/noninteger query 422 and restart persistence match legacy. Record negative/zero delta limitation without silently changing API.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
