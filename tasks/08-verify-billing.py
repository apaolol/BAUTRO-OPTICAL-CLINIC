"""Task 08 synthetic ASGI contract/persistence checks; no clinic DB writes."""
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
helper = runpy.run_path(str(ROOT / "tasks/05-verify-patients.py"))
request, app = helper["request"], helper["app"]
from sqlmodel import SQLModel, create_engine
from app.models.Billing import InvoiceCreate
from app.routers import Billing as router

AMOUNTS = {"subtotal", "discount", "total", "amount_paid", "balance"}


def payloads():
    base = {"patient_number": "P-NOT-PRESENT", "subtotal": 100.75, "discount": 10.25,
            "total": 90.5, "amount_paid": 0.0, "balance": 90.5}
    return [base,
            base | {"amount_paid": 40.25, "balance": 50.25, "status": "Partial", "payment_method": "Cash"},
            base | {"amount_paid": 90.5, "balance": 0.0, "status": "Paid", "payment_method": "Card"},
            base | {"status": None, "payment_method": None},
            base | {"total": -7.25, "amount_paid": 200.5, "balance": 123.75,
                    "status": "Submitted status", "payment_method": ""},
            {"patient_number": "", **dict.fromkeys(AMOUNTS, 0), "status": ""}]


async def verify(restart=False):
    if not restart:
        assert await request("GET", "/billing/") == (200, [])
        assert await request("GET", "/billing/INV-MISSING") == (200, None)
        for number, payload in enumerate(payloads(), 1):
            sent = dict(payload, id=999, invoice_number="INV-FORGED", date="1900-01-01")
            assert await request("POST", "/billing/", sent) == (
                200, {"invoice_number": f"INV-{number:05d}"})
        required = AMOUNTS | {"patient_number"}
        assert set(InvoiceCreate.model_json_schema()["required"]) == required
        for field in required:
            missing = dict(payloads()[0])
            del missing[field]
            for invalid in (missing, payloads()[0] | {field: None}, payloads()[0] | {field: []}):
                assert (await request("POST", "/billing/", invalid))[0] == 422
    status, rows = await request("GET", "/billing/")
    assert status == 200 and len(rows) == 6
    for number, payload in enumerate(payloads(), 1):
        code = f"INV-{number:05d}"
        expected = {"payment_method": None, "status": "Pending"} | payload | {
            "id": number, "invoice_number": code, "date": datetime.date.today().isoformat()}
        assert await request("GET", "/billing/" + code) == (200, expected)
        assert expected in rows
    assert await request("GET", "/billing/INV-MISSING") == (200, None)
    assert await request("GET", "/billing/1") == (200, None)
    if restart:
        assert await request("POST", "/billing/", payloads()[0]) == (200, {"invoice_number": "INV-00007"})
        return
    for method in ("PUT", "DELETE"):
        assert (await request(method, "/billing/INV-00001"))[0] == 405
    paths = app.openapi()["paths"]
    assert {p: set(v) for p, v in paths.items() if p.startswith("/billing")} == {
        "/billing/": {"get", "post"}, "/billing/{invoice_number}": {"get"}}
    assert "200" in paths["/billing/"]["post"]["responses"]
    assert "201" not in paths["/billing/"]["post"]["responses"]


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
    with tempfile.TemporaryDirectory(prefix="task08-", dir=ROOT / ".setup-backups") as folder:
        db = Path(folder) / "synthetic.db"
        router.engine = create_engine("sqlite:///" + db.as_posix(), connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(router.engine)
        asyncio.run(verify())
        router.engine.dispose()
        subprocess.run([sys.executable, str(Path(__file__).resolve()), "--restart", str(db)], check=True, timeout=25)
        with closing(sqlite3.connect(db)) as connection:
            assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert connection.execute("SELECT COUNT(*) FROM billing").fetchone()[0] == 7
            assert connection.execute("SELECT COUNT(*) FROM patients").fetchone()[0] == 0
    assert digest(real_db) == before
    assert not (ROOT / "backend/app/database.db").exists()
    result = {"date": "2026-11-20", "transport": "synthetic in-process FastAPI ASGI; no HTTP server",
              "empty_list_create_detail_missing_and_only_three_operations": True,
              "paid_partial_pending_default_null_and_blank_status_payment": True,
              "five_monetary_fields_roundtrip_no_recalculation_or_status_derivation": True,
              "each_required_field_missing_null_wrong_type_422": True,
              "nonexistent_empty_patient_codes_accepted_without_patient_records": True,
              "server_id_code_date_create_200_code_only_missing_200_null": True,
              "fresh_process_all_fields_persist_and_next_code": True,
              "synthetic_integrity_ok": True, "original_database_sha256_unchanged": before,
              "baseline_backup_hashes_match": True,
              "documentation_correction": "Five monetary fields exist in both legacy and generated schemas, not six.",
              "limitations": ["No network HTTP/browser or concurrent-create testing.",
                              "Float money and count+1 collision behavior retained.",
                              "Root/dashboard API work remains Task 09."]}
    (ROOT / "tasks/08-billing-verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
