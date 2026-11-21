# Bautro Optical Clinic vanilla frontend

Five static pages use classic JavaScript, native fetch and standard CSS. No npm, React, TypeScript or bundler runtime is used.

From frontend/, run `../.venv/Scripts/python.exe -m http.server 5500 --bind 127.0.0.1` and open [Dashboard](http://127.0.0.1:5500/). Start the generated API separately from backend/ with `../.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.

Pages: index.html (dashboard); pages/patients.html, prescriptions.html, inventory.html and billing.html. Shared native-fetch/DOM helpers and screen scripts live in src/js/, standard styles in src/css/, and the preserved clinic logo in assets/.

Task 16 accepted the local cutover. Legacy sources/manifests/dependencies were moved to the private .setup-backups/task16-retired/ folder after parity; original and pre-cutover archives remain verified. No deployment was performed. See [run and recovery instructions](../RUNBOOK.md) for dependencies, exact commands, evidence and compatibility limitations.
