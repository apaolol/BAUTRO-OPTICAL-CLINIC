# Task 08: Port billing API
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
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
- [ ] Implement GET/POST /billing/ and string-code GET /billing/{invoice_number} with direct sessions.
- [ ] Retain patient_number and six required monetary fields, optional payment_method/status (default Pending), server date/INV code and 200 {invoice_number}. Missing lookup stays 200/null. Persist submitted totals/status without recalculating or adding patient checks.
- [ ] Verified: isolated Paid/Partial/Pending, explicit optional nulls, monetary round trips, missing required amounts 422 and restart persistence match the baseline.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
