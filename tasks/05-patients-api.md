# Task 05: Port patients API
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
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
- [ ] Implement only GET/POST /patients/ and GET /patients/{patient_number} using direct SQLModel sessions/select and string business-code lookup.
- [ ] Keep all demographic/clinical values, required full_name/contact_number, server date_created and P-{count+1:05d}. Put shared formatting in a small app/internal function. Return 200 with only patient_number on create; missing lookup remains 200/null.
- [ ] Verified: isolated create/list/detail/missing scenarios cover all optional/null clinical values, required-field 422, generated code/date and restart persistence.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
