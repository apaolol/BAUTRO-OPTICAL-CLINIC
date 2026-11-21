"""Acceptance-only HTTP server: every engine, including lifespan, uses synthetic SQLite."""
from pathlib import Path
import sqlite3
from contextlib import closing
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'backend'))
from sqlmodel import create_engine
import app.database as database
import app.main as main
from app.routers import Patient, Prescription, Inventory, Billing, dashboard
import uvicorn

target = root / '.setup-backups/task16-acceptance/browser.db'
if not target.exists():
    source = root / '.setup-backups/task15-synthetic/clinic.db'
    with closing(sqlite3.connect(f'{source.as_uri()}?mode=ro', uri=True)) as src:
        with closing(sqlite3.connect(target)) as dst:
            src.backup(dst)
engine = create_engine('sqlite:///' + target.as_posix(), connect_args={'check_same_thread': False})
database.engine = main.engine = engine
for router in [Patient, Prescription, Inventory, Billing, dashboard]:
    router.engine = engine
uvicorn.run(main.app, host='127.0.0.1', port=8000, access_log=False)
