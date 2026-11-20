# Task 14: Build billing frontend
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
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
- [ ] Create billing page/JS using GET/POST /billing/, patient/subtotal/discount/paid/payment inputs, details, peso formatting, statuses, code feedback and list refresh; search invoice/patient number.
- [ ] Use total=max(0,subtotal-discount), balance=max(0,total-paid), Paid when balance<=0 else Partial if paid>0 else Pending. Send all six monetary values, payment_method and status.
- [ ] Verified: zero/partial/full/overpayment and excess discount match existing formulas; blank patient, search/details, saved values and failed-submit recovery work.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
