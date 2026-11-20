# Task 09: Generate dashboard API
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 08

## Objective
Generate custom aggregate router and finish backend wiring.

## Commands / Reference
- FISHTOOL command (if relevant): From backend/: python fishtool.py makerouter dashboard; python fishtool.py list
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; WEBDEV + ADBMS/WEBDEV1.pptx select
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Generate blank dashboard router before editing; implement GET /dashboard/ with all seven README response keys. Use basic selects and straightforward Python len/sum/filter loops, no analytics dependency.
- [ ] Count inventory rows, sum amount_paid, filter today by existing server date, include quantity<=reorder_level and full low-stock records, return zero for empty revenue. Match SQL SUM null handling.
- [ ] Set clinic root message/title, explicit frontend CORS origins without credentials; confirm only README endpoints are active, no uppercase/integer/unneeded routes.
- [ ] Verified: empty/seeded datasets cover today/earlier revenue, null amounts and threshold equality. Compare resolved OpenAPI paths/statuses to baseline, not only CLI list.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
