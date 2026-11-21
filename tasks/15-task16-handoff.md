# Task 16 fresh-chat prompt

```text
Continue the Bautro Optical Clinic refactor in this project.

Reconstruct the current project context from files before editing:
1. Read tasks/agents.md and tasks/README.md for constraints, architecture, course references, API/model contracts, open questions and task order.
2. Read the Status and Completion Log of every numbered task, including deviations and verification results. Read tasks/01-baseline-evidence.md, tasks/setup-baseline.json and all completed tasks' verification/generation evidence JSON files, including 02-setup-verification.json, 03-generation-evidence.json, 03-model-verification.json and 04-migration-verification.json when present. Treat files and current code as authoritative; do not assume access to the previous chat.
3. Inspect git status and the current backend/frontend structure. Preserve uncommitted user work. Read the current task's relevant code and actual webdev references at C:/Users/USER/Desktop/webdev. Confirm earlier tasks and backup availability without displaying clinical records. Do not rerun completed scaffolding or migrations to reconstruct context.
4. Reconcile any discrepancy between task logs and actual files; record it and resolve safely before continuing. Inspect only additional files needed for the requested task.

Execute Task 16 only: tasks/16-acceptance-and-cutover.md.
Follow FISHTOOL generation rules, SQLModel/course conventions, vanilla JS and standard CSS, and database preservation rules. Verify the task, update its checklist/status/Completion Log and keep the README progress summary accurate. Record unresolved issues explicitly; never mark an unverified step done.

Stop after that task. Report what changed, verification and limitations. Include whether to keep this chat or start fresh; if fresh is recommended, supply another fully filled next-task handoff prompt.

Carryover from the previous chat: Tasks 01–15 are complete. Preserve all uncommitted changes, clinic records, verified backups and legacy frontend/backend until Task 16 parity is proven. No scaffolding regeneration or context-reconstruction migrations. All 14 resolved API operations passed synthetic checks; FISHTOOL scans inactive files, so resolved OpenAPI is authoritative. Billing has five monetary fields. All five vanilla screens passed their task checks; Task 12 native print preview was explicitly confirmed by the user. Task 15 cross-screen reconciliation used an isolated database with all active router engines redirected; earlier preview harnesses redirect only their own domain. Database and backup hashes remain unchanged. No test servers remain running. Full acceptance/restore rehearsal/cutover is pending; do not claim deployment..
```
