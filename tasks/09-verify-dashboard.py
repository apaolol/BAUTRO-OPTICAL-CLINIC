"""Task 09 synthetic dashboard, resolved API and CORS checks."""
import asyncio
from contextlib import closing
import datetime
import hashlib
import json
from pathlib import Path
import runpy
import sqlite3
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
helper = runpy.run_path(str(ROOT / "tasks/05-verify-patients.py"))
request, app = helper["request"], helper["app"]
from sqlmodel import SQLModel, create_engine
from app.routers import dashboard


async def cors(origin, preflight=False):
    messages = []
    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}
    async def send(message):
        messages.append(message)
    headers = [(b"origin", origin.encode())]
    if preflight:
        headers += [(b"access-control-request-method", b"PUT"),
                    (b"access-control-request-headers", b"content-type")]
    await app({"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
               "method": "OPTIONS" if preflight else "GET", "scheme": "http",
               "path": "/", "raw_path": b"/", "query_string": b"", "root_path": "",
               "headers": headers, "client": ("127.0.0.1", 1), "server": ("test", 80)}, receive, send)
    start = next(m for m in messages if m["type"] == "http.response.start")
    return start["status"], dict(start["headers"])


async def verify(db):
    empty = {"total_patients": 0, "total_prescriptions": 0, "total_inventory_items": 0,
             "today_revenue": 0.0, "total_revenue": 0.0, "low_stock_count": 0, "low_stock_items": []}
    assert await request("GET", "/dashboard/") == (200, empty)
    assert await request("GET", "/") == (200, {"message": "Bautro Optical Clinic API"})
    today = datetime.date.today()
    with closing(sqlite3.connect(db)) as c:
        c.execute("INSERT INTO patients (patient_number) VALUES ('P-SYNTHETIC')")
        c.executemany("INSERT INTO prescriptions (prescription_number) VALUES (?)", [("RX-A",), ("RX-B",)])
        for code, quantity, level in (("ITM-EQUAL", 5, 5), ("ITM-LOW", -1, 0), ("ITM-HIGH", 100, 5),
                                      ("ITM-NULL-Q", None, 5), ("ITM-NULL-R", 0, None)):
            c.execute("INSERT INTO inventory (item_code,quantity,reorder_level,brand,cost) VALUES (?,?,?,?,?)",
                      (code, quantity, level, "Synthetic brand", 12.5))
        for code, date, amount in (("INV-A", today, 40.25), ("INV-B", today, None),
                                   ("INV-C", today - datetime.timedelta(days=1), 20.5),
                                   ("INV-D", None, 5.0), ("INV-E", today, -2.0)):
            c.execute("INSERT INTO billing (invoice_number,date,amount_paid) VALUES (?,?,?)",
                      (code, date.isoformat() if date is not None else None, amount))
        c.commit()
        expected_today = c.execute("SELECT SUM(amount_paid) FROM billing WHERE date=?", (today.isoformat(),)).fetchone()[0]
        expected_total = c.execute("SELECT SUM(amount_paid) FROM billing").fetchone()[0]
        low_codes = {r[0] for r in c.execute("SELECT item_code FROM inventory WHERE quantity<=reorder_level")}
    status, result = await request("GET", "/dashboard/")
    assert status == 200 and set(result) == set(empty)
    assert [result[k] for k in ("total_patients", "total_prescriptions", "total_inventory_items")] == [1, 2, 5]
    assert result["today_revenue"] == expected_today == 38.25
    assert result["total_revenue"] == expected_total == 63.75
    assert result["low_stock_count"] == 2
    assert {i["item_code"] for i in result["low_stock_items"]} == low_codes
    assert all(set(i) == {"id", "item_code", "brand", "model", "category", "quantity", "reorder_level",
                          "cost", "selling_price", "supplier"} for i in result["low_stock_items"])
    with closing(sqlite3.connect(db)) as c:
        c.execute("UPDATE billing SET amount_paid=NULL")
        c.commit()
    all_null = (await request("GET", "/dashboard/"))[1]
    assert all_null["today_revenue"] == 0.0 and all_null["total_revenue"] == 0.0
    expected_paths = {"/": {"get"}, "/dashboard/": {"get"}}
    for collection, code in (("patients", "patient_number"), ("prescriptions", "prescription_number"),
                              ("billing", "invoice_number")):
        expected_paths[f"/{collection}/"] = {"get", "post"}
        expected_paths[f"/{collection}/{{{code}}}"] = {"get"}
    expected_paths.update({"/inventory/": {"get", "post"}, "/inventory/{item_code}": {"put"}})
    status, schema = await request("GET", "/openapi.json")
    assert status == 200 and {p: set(v) for p, v in schema["paths"].items()} == expected_paths
    assert sum(map(len, expected_paths.values())) == 14
    assert schema["info"] == {"title": "Bautro Optical Clinic", "version": "1.0.0"}
    for operations in schema["paths"].values():
        for operation in operations.values():
            assert "200" in operation["responses"] and "201" not in operation["responses"]
    for origin in ("http://127.0.0.1:5500", "http://localhost:5500"):
        for preflight in (False, True):
            status, headers = await cors(origin, preflight)
            assert status == 200 and headers[b"access-control-allow-origin"] == origin.encode()
            assert b"access-control-allow-credentials" not in headers
    for preflight in (False, True):
        status, headers = await cors("https://untrusted.example", preflight)
        assert status == (400 if preflight else 200)
        assert b"access-control-allow-origin" not in headers


def main():
    baseline = json.loads((ROOT / "tasks/setup-baseline.json").read_text())
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    real_db = ROOT / "backend/bautro.db"
    before = digest(real_db)
    assert before == baseline["database_sha256_before"]
    for name, expected in baseline["backup_sha256"].items():
        assert digest(ROOT / ".setup-backups/tasks-01-02-20261120" / name) == expected
    with tempfile.TemporaryDirectory(prefix="task09-", dir=ROOT / ".setup-backups") as folder:
        db = Path(folder) / "synthetic.db"
        dashboard.engine = create_engine("sqlite:///" + db.as_posix(), connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(dashboard.engine)
        asyncio.run(verify(db))
        dashboard.engine.dispose()
        with closing(sqlite3.connect(db)) as c:
            assert c.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    assert digest(real_db) == before
    assert not (ROOT / "backend/app/database.db").exists()
    result = {"date": "2026-11-20", "transport": "synthetic in-process ASGI, no network server",
              "empty_and_all_null_revenue_zero": True, "seeded_counts_today_prior_null_date_negative_revenue": True,
              "sql_sum_and_stock_comparison_parity": True, "threshold_equality_null_exclusion_full_stock_records": True,
              "all_14_resolved_operations_200_root_title_version": True,
              "both_static_origins_simple_preflight_no_credentials_and_disallowed_origin": True,
              "synthetic_integrity_ok": True, "original_database_sha256_unchanged": before,
              "baseline_backup_hashes_match": True,
              "limitations": ["No network HTTP/browser or concurrency testing; frontend remains Tasks 10-15.",
                              "Simple aggregate queries load rows into memory as specified by Task 09."]}
    (ROOT / "tasks/09-dashboard-verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
