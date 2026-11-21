# Chat recommendations and context handoff

After every completed task, the execution agent reports whether to keep this chat or start fresh. These recommendations are project workflow choices, not a requirement to open a new chat. Default fresh-chat boundaries: after Task 04 (setup to APIs), Task 09 (APIs to frontend), and Task 15 (frontend to acceptance). Continue the same chat within a phase unless a long discussion or changed direction makes a fresh start useful. Task 16 ends the refactor.

Before handing off, update the completed task's status/checklist/Completion Log and record decisions, deviations, blockers, verification, relevant paths and any pending process. Do not claim tests that were not run. Provide the next-task prompt in the reply when recommending a fresh chat. Replace every placeholder with the actual next task, not a task assumed from an old chat. Do not expose patient values or read the private backup contents for context.

## Copyable prompt template

```text
Continue the Bautro Optical Clinic refactor in this project.

Reconstruct the current project context from files before editing:
1. Read tasks/agents.md and tasks/README.md for constraints, architecture, course references, API/model contracts, open questions and task order.
2. Read the Status and Completion Log of every numbered task, including deviations and verification results. Read tasks/01-baseline-evidence.md, tasks/setup-baseline.json and all completed tasks' verification/generation evidence JSON files, including 02-setup-verification.json, 03-generation-evidence.json, 03-model-verification.json and 04-migration-verification.json when present. Treat files and current code as authoritative; do not assume access to the previous chat.
3. Inspect git status and the current backend/frontend structure. Preserve uncommitted user work. Read the current task's relevant code and actual webdev references at C:/Users/USER/Desktop/webdev. Confirm earlier tasks and backup availability without displaying clinical records. Do not rerun completed scaffolding or migrations to reconstruct context.
4. Reconcile any discrepancy between task logs and actual files; record it and resolve safely before continuing. Inspect only additional files needed for the requested task.

Execute Task <NN> only: tasks/<exact-next-task-filename>.md.
Follow FISHTOOL generation rules, SQLModel/course conventions, vanilla JS and standard CSS, and database preservation rules. Verify the task, update its checklist/status/Completion Log and keep the README progress summary accurate. Record unresolved issues explicitly; never mark an unverified step done.

Stop after that task. Report what changed, verification and limitations. Include whether to keep this chat or start fresh; if fresh is recommended, supply another fully filled next-task handoff prompt.

Carryover from the previous chat: <brief verified decisions, blockers or cautions; write None beyond the recorded logs if there are none>.
```

If the user explicitly authorizes a range, substitute that exact range and execute one task at a time. A chat recommendation must not interrupt already-authorized work. Do not automatically execute tasks simply because they are the earliest incomplete ones.
