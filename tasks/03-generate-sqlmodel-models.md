# Task 03: Generate and map SQLModel models
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 02

## Objective
Preserve six existing table definitions with generated SQLModel classes.

## Commands / Reference
- FISHTOOL command (if relevant): From backend/: python fishtool.py makemodel Patient; repeat for Prescription, Inventory, Billing, Appointment, Expense
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/models.py; WEBDEV + ADBMS/WEBDEV1.pptx
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Generate each model/router before editing. Keep generated capitalized files/classes and explicitly set existing plural/singular table names from README.
- [ ] Port every source column, type, nullability, default, index and unique business-code constraint after comparing SQLite schema. Preserve date_of_birth string, money floats and legacy nullable values; add no relationships or new constraints.
- [ ] Add simple non-table SQLModel create schemas matching all four legacy payloads; id/code/server dates are not client input. Ensure models/__init__.py imports all six tables before metadata creation.
- [ ] Disable/unregister Appointment/Expense routers. Remove unused generic integer lookup/PUT/DELETE operations from active clinic routers; inventory custom PUT is implemented in Task 07.
- [ ] Verified: model metadata has six correctly named tables, matching field/index inventory, no database startup is triggered and no extra feature is exposed.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
