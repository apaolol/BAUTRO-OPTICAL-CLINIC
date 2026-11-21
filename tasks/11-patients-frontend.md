# Task 11: Build patients frontend
**Status:** [ ] Not started / [ ] In progress / [x] Done
**Current state:** Done
**Depends on:** 10

## Objective
Preserve patient list, create, search and clinical details with DOM functions.

## Commands / Reference
- FISHTOOL command (if relevant): Static server plus backend python fishtool.py serve
- webdev style reference (relative to C:/Users/USER/Desktop/webdev/): BAUTRO_EXAM/src/js/editProfile.js; part2/BAUTRO_PART2/register.html
- Contract/model reference: tasks/README.md and existing source.
- New dependencies: only the reviewed Task 02 set; any addition needs a reason/version in this log before installation.
- Commands are for the later execution pass only.

## Checklist
- [x] Create patients page/JS using GET/POST /patients/; include every existing form/clinical field, trimmed required name/contact, numeric age and optional blank-to-null conversion.
- [x] Filter by name/code/contact, show counts and all clinical details, display generated patient number and reload after save. Provide simple show/hide forms/details and cancel/close behavior.
- [x] Verified: full/minimal create, each search key, detail values, narrow-screen table, cancel and failed-save recovery work without duplicate submission.

## Chat handoff
- Default recommendation: Keep this chat by default: the next task continues the same phase. Recommend a fresh chat if the discussion has become long or changed direction, after recording all carryover in the log.
- Next planned task: `12-prescriptions-frontend.md` (Task 12); confirm its prerequisites and current status before recommending it.
- After completion, include the recommendation and a brief reason in the reply; record important carryover and the recommendation under Completion Log / Deviations / notes.
- If recommending a fresh chat, provide the exact next-task prompt from [chat-handoff.md](chat-handoff.md), with placeholders filled. Do not start or create a chat automatically.

## Completion Log (execution agent fills this in when done)
- **Date:** 2026-11-21 (Asia/Singapore)
- **Summary of what was done:** Implemented vanilla patient list/create/search/details using shared native fetch helpers. Preserved all 21 input fields, required trimmed name/contact, optional blank-to-null conversion, numeric age including zero and existing 0–150 bounds. Added generated-code success feedback/list refresh, name/code/contact filters and counts, explicit loading/empty/no-match/error states, full textContent details including multiline notes, form cancel/reset and details close/focus return. Disabled fields/save/cancel during saving and guarded duplicate submissions.
- **Commands run / files created or changed:** Read task rules/README, Task 10 handoff, current/legacy patient page, schema/router and actual BAUTRO_EXAM editProfile.js course example (part2 native-fetch example reviewed in Task 10). Preserved all pre-existing Task 10 changes. Changed frontend/pages/patients.html and src/js/patients.js; added src/css/patients.css. Added tasks/11-preview-server.py for actual API patient-router verification against .setup-backups/task11-synthetic/patients.db only, lifespan off; no production code/config modifications. Ran local static server and isolated API outside sandbox, browser full/minimal create, details/search/cancel/failure/restart/retry/refresh and responsive checks. Added and ran 11-verify-patients-frontend.js; reran 10-verify-shell.js. Read-only SQLite assertions checked every synthetic full/minimal persisted field and exactly three records after saves/retry; checked integrity and baseline database/backup/legacy frontend hashes. Added 11-patients-frontend-verification.json and updated README progress. No generation, migrations or installs; both owned servers stopped.
- **Verification result:** Full synthetic create preserved all field values including multiline and HTML-like literal notes; UI displayed generated P code and refreshed list. Minimal create stored every optional field as null. Searches by mixed-case name/code and contact each returned correct counts; clear/no-match worked. Blank trimmed required fields rejected. Cancel reset form; close details returned focus. Backend stop caused visible save/list errors, retained entries and enabled retry controls; restarting same synthetic database recovered list and allowed one successful retry. Browser reload persisted three expected records. DOM unit checks covered every input conversion, age zero/fraction rejection, pending duplicate guard (one POST), field/button disabling/finally recovery, failure retention and nullable legacy list values. Added a load-failure guard so search cannot erase a failed-refresh error by rendering stale rows. Narrow layout measured viewport/page width 360/360, table container 290 with contained 850px table; desktop measured page/viewport 1265/1265 and table 935px. Screenshots verified both layouts; narrow View/details worked. Database/baseline backup/retained legacy source hashes unchanged; synthetic integrity and git diff --check passed.
- **Deviations / notes:** Used inline show/hide form/detail sections rather than framework modals, as allowed by task; no new dependencies. Test harness redirects only Patient.engine and must only be used for patient/root verification, not other domain API requests. It retains synthetic evidence locally and does not seed/delete the real DB. The original API remains count+1 and lacks idempotency; pending duplicate clicks are blocked, and ambiguous timeout/disconnect feedback advises refreshing before retry. No clinical records printed or modified. Browser viewport capability worked in this task and was reset; patient desktop/narrow QA is complete (Task 10's historical timeout remains in its log). Fixed footer encoding in the touched patient page. No prescription/inventory/billing/dashboard feature work or final acceptance. Task 12 remains Not started and its Task 11 prerequisite is complete. Chat recommendation: KEEP THIS CHAT for Task 12 (tasks/12-prescriptions-frontend.md), continuing the same frontend phase. Stop after Task 11.
