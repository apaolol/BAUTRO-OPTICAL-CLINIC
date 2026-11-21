"""Task 06 synthetic ASGI contract/persistence verification; no real DB writes.

Run with .venv/Scripts/python.exe tasks/06-verify-prescriptions.py.
Reuses Task 05's dependency-free ASGI request helper without running its tests.
"""
import asyncio
from contextlib import closing
import datetime
import hashlib
import json
from pathlib import Path
import runpy
import sqlite3
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
request = runpy.run_path(str(ROOT / "tasks/05-verify-patients.py"))["request"]

from sqlmodel import SQLModel, create_engine
from app.main import app
from app.models.Prescription import PrescriptionCreate
from app.routers import Prescription as router


def payloads():
    full = {"patient_number": "P-NOT-PRESENT",
            "od_sphere": "-1.25", "od_cylinder": "-0.50", "od_axis": "090",
            "od_add": "+2.00", "od_pd": "31.5", "os_sphere": "+0.75",
            "os_cylinder": "-1.00", "os_axis": "180", "os_add": "+2.25",
            "os_pd": "32.0", "lens_type": "Synthetic progressive",
            "lens_brand": "Synthetic brand", "lens_coating": "Synthetic coating",
            "frame_brand": "Synthetic frame", "frame_model": "Synthetic model",
            "notes": "Synthetic notes\nSecond line"}
    optional = set(PrescriptionCreate.model_fields) - {"patient_number"}
    assert set(full) == set(PrescriptionCreate.model_fields) and len(optional) == 16
    return [full, dict.fromkeys(optional) | {"patient_number": "P-NOT-PRESENT"},
            {"patient_number": "P-NOT-PRESENT"},
            dict.fromkeys(optional, "") | {"patient_number": ""}]


async def verify(restart=False):
    if not restart:
        assert await request("GET", "/prescriptions/") == (200, [])
        assert await request("GET", "/prescriptions/RX-MISSING") == (200, None)
        for number, payload in enumerate(payloads(), 1):
            sent = dict(payload, id=999, prescription_number="RX-FORGED", date="1900-01-01")
            assert await request("POST", "/prescriptions/", sent) == (
                200, {"prescription_number": f"RX-{number:05d}"})
        for invalid in ({}, {"notes": "Synthetic"}, {"patient_number": None},
                        {"patient_number": 123}, {"patient_number": "P-NOT-PRESENT", "od_sphere": 1.25}):
            assert (await request("POST", "/prescriptions/", invalid))[0] == 422
    status, rows = await request("GET", "/prescriptions/")
    assert status == 200 and len(rows) == 4
    for number, payload in enumerate(payloads(), 1):
        code = f"RX-{number:05d}"
        status, row = await request("GET", "/prescriptions/" + code)
        assert status == 200 and row in rows
        assert row["id"] == number and row["prescription_number"] == code
        assert row["date"] == datetime.date.today().isoformat()
        assert all(row[field] == payload.get(field) for field in PrescriptionCreate.model_fields)
        assert set(row) == set(PrescriptionCreate.model_fields) | {"id", "prescription_number", "date"}
    assert await request("GET", "/prescriptions/1") == (200, None)
    assert await request("GET", "/prescriptions/RX-MISSING") == (200, None)
    if restart:
        assert await request("POST", "/prescriptions/", {"patient_number": "P-NOT-PRESENT"}) == (
            200, {"prescription_number": "RX-00005"})
        return
    for method in ("PUT", "DELETE"):
        assert (await request(method, "/prescriptions/RX-00001"))[0] == 405
    paths = app.openapi()["paths"]
    assert {p: set(v) for p, v in paths.items() if p.startswith("/prescriptions")} == {
        "/prescriptions/": {"get", "post"}, "/prescriptions/{prescription_number}": {"get"}}
    assert "200" in paths["/prescriptions/"]["post"]["responses"]
    assert "201" not in paths["/prescriptions/"]["post"]["responses"]


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--restart":
        router.engine = create_engine("sqlite:///" + Path(sys.argv[2]).as_posix())
        asyncio.run(verify(restart=True))
        router.engine.dispose()
        return
    baseline = json.loads((ROOT / "tasks/setup-baseline.json").read_text())
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    real_db = ROOT / "backend/bautro.db"
    before = digest(real_db)
    assert before == baseline["database_sha256_before"]
    for name, expected in baseline["backup_sha256"].items():
        assert digest(ROOT / ".setup-backups/tasks-01-02-20261120" / name) == expected
    with tempfile.TemporaryDirectory(prefix="task06-", dir=ROOT / ".setup-backups") as folder:
        db = Path(folder) / "synthetic.db"
        router.engine = create_engine("sqlite:///" + db.as_posix(), connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(router.engine)
        asyncio.run(verify())
        router.engine.dispose()
        subprocess.run([sys.executable, str(Path(__file__).resolve()), "--restart", str(db)], check=True, timeout=25)
        with closing(sqlite3.connect(db)) as connection:
            assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert connection.execute("SELECT COUNT(*) FROM prescriptions").fetchone()[0] == 5
            assert connection.execute("SELECT COUNT(*) FROM patients").fetchone()[0] == 0
    assert digest(real_db) == before
    assert not (ROOT / "backend/app/database.db").exists()
    result = {
        "date": "2026-11-20", "transport": "in-process ASGI through FastAPI; no HTTP server",
        "empty_list_create_list_detail_missing": True,
        "all_16_optional_fields_values_null_omitted_empty_strings": True,
        "signed_optical_strings_leading_zero_axis_and_multiline_notes_preserved": True,
        "required_patient_number_and_invalid_types_422": True,
        "nonexistent_and_empty_patient_codes_accepted_without_patient_records": True,
        "server_code_date_id_and_create_200_code_only": True,
        "missing_lookup_200_null_integer_not_used_as_id": True,
        "openapi_only_three_prescription_operations_put_delete_405": True,
        "fresh_process_all_fields_persist_and_next_code": True,
        "synthetic_integrity_ok": True, "original_database_sha256_unchanged": before,
        "baseline_backup_hashes_match": True,
        "limitations": ["No network HTTP/browser or concurrent-create testing.",
                        "Legacy count+1 collision behavior preserved.",
                        "Inventory/billing/dashboard remain pending Tasks 07-09."]}
    (ROOT / "tasks/06-prescriptions-verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
