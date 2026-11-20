# Task 06: Port prescriptions API
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 05

## Objective
Preserve bilateral eye and lens/frame data through generated SQLModel routes.

## Commands / Reference
- FISHTOOL command (if relevant): Customize generated app/routers/Prescription.py
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): part2/BAUTRO_PART2/test.py; WEBDEV + ADBMS/WEBDEV1.pptx
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Implement GET/POST /prescriptions/ and string-code GET /prescriptions/{prescription_number} with direct sessions.
- [ ] Keep all OD/OS values, lens_type/brand/coating, frame_brand/model and notes; require patient_number, use server date/RX code and 200 code-only creation response. Preserve missing 200/null and absence of patient-existence checks.
- [ ] Verified: isolated round trips preserve signed/string optical values, all lens fields and optional blanks; test required-field 422, missing lookup and restart persistence.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
