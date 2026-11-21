"""Task 05 contract checks: synthetic SQLite only, no server or migrations.

Run from project root with .venv/Scripts/python.exe tasks/05-verify-patients.py.
"""
import asyncio
from contextlib import closing
import datetime
import hashlib
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from sqlmodel import SQLModel, create_engine
from app.main import app
from app.routers import Patient as router
from app.models.Patient import PatientCreate


async def request(method, path, payload=None):
    messages = []
    body = b"" if payload is None else json.dumps(payload).encode()

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    await app({"type": "http", "asgi": {"version": "3.0"},
               "http_version": "1.1", "method": method, "scheme": "http",
               "path": path, "raw_path": path.encode(), "query_string": b"",
               "root_path": "", "headers": [(b"content-type", b"application/json")],
               "client": ("127.0.0.1", 1), "server": ("test", 80)}, receive, send)
    status = next(m["status"] for m in messages if m["type"] == "http.response.start")
    content = b"".join(m.get("body", b"") for m in messages if m["type"] == "http.response.body")
    return status, json.loads(content) if content else None


async def verify(restart=False):
    if restart:
        status, rows = await request("GET", "/patients/")
        assert status == 200 and len(rows) == 3
        assert (await request("GET", "/patients/P-00001"))[1] == rows[0]
        assert (await request("POST", "/patients/", {
            "full_name": "Synthetic restart", "contact_number": "000"})) == (200, {"patient_number": "P-00004"})
        return

    assert await request("GET", "/patients/") == (200, [])
    assert await request("GET", "/patients/P-MISSING") == (200, None)
    optional = set(PatientCreate.model_fields) - {"full_name", "contact_number"}
    full = {field: (34 if field == "age" else "Synthetic " + field) for field in optional}
    full.update(full_name="Synthetic Patient", contact_number="000")
    nulls = {field: None for field in optional}
    nulls.update(full_name="Synthetic Null", contact_number="000")
    minimal = {"full_name": "Synthetic Minimal", "contact_number": "000"}
    for number, payload in enumerate((full, nulls, minimal), 1):
        # Server fields must not be accepted as create input.
        sent = dict(payload, id=999, patient_number="P-FORGED", date_created="1900-01-01")
        code = f"P-{number:05d}"
        assert await request("POST", "/patients/", sent) == (200, {"patient_number": code})
        status, row = await request("GET", "/patients/" + code)
        assert status == 200 and row["id"] == number and row["patient_number"] == code
        assert row["date_created"] == datetime.date.today().isoformat()
        assert all(row[field] == payload.get(field) for field in PatientCreate.model_fields)
        assert set(row) == set(PatientCreate.model_fields) | {"id", "patient_number", "date_created"}
    for payload in ({}, {"full_name": "Synthetic"}, {"contact_number": "000"},
                    {"full_name": None, "contact_number": "000"},
                    {"full_name": "Synthetic", "contact_number": None},
                    dict(minimal, age="invalid")):
        assert (await request("POST", "/patients/", payload))[0] == 422
    assert len((await request("GET", "/patients/"))[1]) == 3
    assert await request("GET", "/patients/1") == (200, None)
    assert (await request("PUT", "/patients/P-00001", minimal))[0] == 405
    assert (await request("DELETE", "/patients/P-00001"))[0] == 405
    paths = app.openapi()["paths"]
    assert {p: set(v) for p, v in paths.items() if p.startswith("/patients")} == {
        "/patients/": {"get", "post"}, "/patients/{patient_number}": {"get"}}
    assert "200" in paths["/patients/"]["post"]["responses"]
    assert "201" not in paths["/patients/"]["post"]["responses"]


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--restart":
        router.engine = create_engine("sqlite:///" + Path(sys.argv[2]).as_posix())
        asyncio.run(verify(restart=True))
        router.engine.dispose()
        return
    baseline = json.loads((ROOT / "tasks/setup-baseline.json").read_text())
    real_db = ROOT / "backend/bautro.db"
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    before = digest(real_db)
    assert before == baseline["database_sha256_before"]
    backup = ROOT / ".setup-backups/tasks-01-02-20261120"
    for name, expected in baseline["backup_sha256"].items():
        assert digest(backup / name) == expected
    # TemporaryDirectory is confined to the authorized project and contains synthetic records only.
    with tempfile.TemporaryDirectory(prefix="task05-", dir=ROOT / ".setup-backups") as folder:
        db = Path(folder) / "synthetic.db"
        router.engine = create_engine("sqlite:///" + db.as_posix(), connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(router.engine)
        asyncio.run(verify())
        router.engine.dispose()
        subprocess.run([sys.executable, str(Path(__file__).resolve()), "--restart", str(db)], check=True, timeout=25)
        with closing(sqlite3.connect(db)) as connection:
            assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert connection.execute("SELECT COUNT(*) FROM patients").fetchone()[0] == 4
    assert digest(real_db) == before
    assert not (ROOT / "backend/app/database.db").exists()
    result = {
        "date": "2026-11-20", "transport": "in-process ASGI requests through FastAPI; no HTTP server",
        "empty_list_create_list_detail_missing": True,
        "all_20_optional_fields_values_explicit_null_and_omission": True,
        "required_fields_nulls_and_invalid_age_422": True,
        "server_code_date_and_id_override_prevention": True,
        "create_200_code_only_and_missing_200_null": True,
        "openapi_only_three_patient_operations": True,
        "put_delete_405": True, "fresh_process_restart_read_and_next_code": True,
        "synthetic_sqlite_integrity_ok": True, "original_database_sha256_unchanged": before,
        "baseline_backup_hashes_match": True, "no_migrations_generation_or_new_dependencies": True,
        "limitations": ["No browser, network HTTP or concurrent-create test.",
                        "Legacy count+1 collision behavior retained; no schema changes.",
                        "Other API handlers remain pending Tasks 06-09."]}
    (ROOT / "tasks/05-patients-verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
