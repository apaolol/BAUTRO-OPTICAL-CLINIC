"""Task 07 synthetic ASGI checks; no clinic database writes or migrations."""
import asyncio
from contextlib import closing
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
app = helper["app"]
from sqlmodel import SQLModel, create_engine
from app.routers import Inventory as router


async def request(method, target, payload=None):
    # Task 05 helper has no query-string argument; adapt only the ASGI scope.
    path, _, query = target.partition("?")
    async def query_app(scope, receive, send):
        scope["query_string"] = query.encode()
        await app(scope, receive, send)
    original = helper["request"].__globals__["app"]
    helper["request"].__globals__["app"] = query_app
    try:
        return await helper["request"](method, path, payload)
    finally:
        helper["request"].__globals__["app"] = original


async def verify(restart=False):
    if restart:
        status, rows = await request("GET", "/inventory/")
        assert status == 200 and len(rows) == 4 and rows[0]["quantity"] == -1
        assert rows[1]["cost"] is None and rows[1]["selling_price"] is None
        assert rows[2]["brand"] == "Synthetic brand" and rows[2]["quantity"] == 7
        assert await request("PUT", "/inventory/ITM-00001?quantity=4") == (
            200, {"item_code": "ITM-00001", "new_quantity": 3})
        assert await request("POST", "/inventory/", {}) == (200, {"item_code": "ITM-00005"})
        return
    assert await request("GET", "/inventory/") == (200, [])
    payloads = [{}, {"cost": None, "selling_price": None, "quantity": None, "reorder_level": None},
                {"brand": "Synthetic brand", "model": "Synthetic model", "category": "Synthetic category",
                 "supplier": "Synthetic supplier", "cost": 12.5, "selling_price": 25.75,
                 "quantity": 7, "reorder_level": 3},
                {"cost": 0, "selling_price": 0, "quantity": 0, "reorder_level": 0,
                 "brand": "", "model": "", "category": "", "supplier": ""}]
    for number, payload in enumerate(payloads, 1):
        assert await request("POST", "/inventory/", dict(payload, id=999, item_code="ITM-FORGED")) == (
            200, {"item_code": f"ITM-{number:05d}"})
    status, rows = await request("GET", "/inventory/")
    assert status == 200 and len(rows) == 4
    defaults = {"brand": None, "model": None, "category": None, "supplier": None,
                "cost": 0.0, "selling_price": 0.0, "quantity": 0, "reorder_level": 5}
    for number, (row, payload) in enumerate(zip(rows, payloads), 1):
        expected = defaults | payload | {"id": number, "item_code": f"ITM-{number:05d}"}
        # ORM insert defaults apply to explicit null quantities, as in legacy SQLAlchemy.
        if number == 2:
            expected.update(quantity=0, reorder_level=5)
        assert row == expected
    for delta, total in ((3, 3), (2, 5), (0, 5), (-6, -1)):
        assert await request("PUT", f"/inventory/ITM-00001?quantity={delta}", {"brand": "FORGED", "quantity": 999}) == (
            200, {"item_code": "ITM-00001", "new_quantity": total})
    assert await request("PUT", "/inventory/MISSING?quantity=2") == (200, {"error": "Not found"})
    assert await request("PUT", "/inventory/1?quantity=2") == (200, {"error": "Not found"})
    for target in ("/inventory/ITM-00001", "/inventory/ITM-00001?quantity=bad",
                   "/inventory/ITM-00001?quantity=1.5", "/inventory/ITM-00001?quantity="):
        assert (await request("PUT", target, {"quantity": 10}))[0] == 422
    for payload in ({"quantity": "bad"}, {"quantity": 1.5}, {"cost": "bad"}):
        assert (await request("POST", "/inventory/", payload))[0] == 422
    rows_after = (await request("GET", "/inventory/"))[1]
    assert rows_after == [rows[0] | {"quantity": -1}, *rows[1:]]
    for method in ("GET", "DELETE"):
        assert (await request(method, "/inventory/ITM-00001"))[0] == 405
    paths = app.openapi()["paths"]
    assert {p: set(v) for p, v in paths.items() if p.startswith("/inventory")} == {
        "/inventory/": {"get", "post"}, "/inventory/{item_code}": {"put"}}
    operation = paths["/inventory/{item_code}"]["put"]
    assert "requestBody" not in operation
    quantity = next(p for p in operation["parameters"] if p["name"] == "quantity")
    assert quantity["in"] == "query" and quantity["required"] and quantity["schema"]["type"] == "integer"


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
    with tempfile.TemporaryDirectory(prefix="task07-", dir=ROOT / ".setup-backups") as folder:
        db = Path(folder) / "synthetic.db"
        router.engine = create_engine("sqlite:///" + db.as_posix(), connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(router.engine)
        asyncio.run(verify())
        router.engine.dispose()
        subprocess.run([sys.executable, str(Path(__file__).resolve()), "--restart", str(db)], check=True, timeout=25)
        with closing(sqlite3.connect(db)) as connection:
            assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert connection.execute("SELECT COUNT(*) FROM inventory").fetchone()[0] == 5
    assert digest(real_db) == before
    assert not (ROOT / "backend/app/database.db").exists()
    result = {"date": "2026-11-20", "transport": "synthetic in-process FastAPI ASGI; no HTTP server",
              "defaults_null_and_zero_prices_full_fields_and_blank_strings": True,
              "null_quantity_reorder_use_orm_insert_defaults": True,
              "server_code_and_id_create_200_code_only": True,
              "repeated_positive_zero_negative_deltas_and_untouched_other_fields": True,
              "query_required_integer_422_body_cannot_replace_query": True,
              "missing_item_and_integer_id_return_200_error": True,
              "only_three_inventory_operations_query_documented_no_body": True,
              "fresh_process_persistence_restock_and_next_code": True,
              "synthetic_integrity_ok": True, "original_database_sha256_unchanged": before,
              "baseline_backup_hashes_match": True,
              "limitations": ["No browser/network HTTP or concurrency testing.",
                              "Zero/negative deltas and count+1 collision behavior intentionally retained.",
                              "Existing SQL NULL quantities cannot be incremented (legacy TypeError behavior)."]}
    (ROOT / "tasks/07-inventory-verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
