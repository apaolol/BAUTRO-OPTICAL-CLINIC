# Task 13: Build inventory frontend
**Status:** [ ] Not started / [ ] In progress / [ ] Done
**Current state:** Not started
**Depends on:** 12

## Objective
Preserve add/filter/low-stock and restock workflows.

## Commands / Reference
- FISHTOOL command (if relevant): Static server/backend
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): BAUTRO_EXAM/src/js/likeComment.js; part2/BAUTRO_PART2/register.html
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [ ] Create inventory page/JS using GET/POST and PUT query restock. Preserve numeric conversions, quantity zero, reorder default five and nullable prices.
- [ ] Search brand/model/code/category, render low-stock badges/counts with equality included; positive integer UI restock sends encoded code plus quantity query without body, refreshes list and treats legacy 200 error object as failure.
- [ ] Verified: add with zero/blank price, each search, two restocks, badges/count refresh, cancel and missing-item/network recovery work.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `14-billing-frontend.md` (Task 14); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:**
- **Summary of what was done:**
- **Commands run / files created or changed:**
- **Verification result:**
- **Deviations / notes:**
