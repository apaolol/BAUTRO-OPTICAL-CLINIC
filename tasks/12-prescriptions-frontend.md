# Task 12: Build prescriptions frontend
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 11

## Objective
Preserve prescription forms, details, search and printing.

## Commands / Reference
- FISHTOOL command (if relevant): Static server/backend; browser print preview
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): BAUTRO_EXAM/src/js/editProfile.js; part2/BAUTRO_PART2/register.html
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Create prescriptions page/JS using GET/POST /prescriptions/, required patient_number and all bilateral/lens/frame/notes fields. Keep optical values strings and optional blanks null.
- [ ] Search by RX/patient number, show details and returned code, refresh after creation; implement selected prescription window.print with standard @media print excluding navigation/forms/other records.
- [ ] Verified: full/minimal create, searches, error recovery and selected-record print preview preserve both eyes and lens brand/coating without a PDF dependency.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `13-inventory-frontend.md` (Task 13); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
