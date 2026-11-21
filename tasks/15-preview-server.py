"""All active routers on one isolated synthetic DB for dashboard reconciliation."""
import sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'backend'))
from sqlmodel import SQLModel, create_engine
from app import models
from app.routers import Patient, Prescription, Inventory, Billing, dashboard
from app.main import app
import uvicorn

directory = root / '.setup-backups' / 'task15-synthetic'
directory.mkdir(exist_ok=True)
engine = create_engine(f'sqlite:///{(directory / "clinic.db").as_posix()}', connect_args={'check_same_thread': False})
SQLModel.metadata.create_all(engine)
for router in [Patient, Prescription, Inventory, Billing, dashboard]:
    router.engine = engine
uvicorn.run(app, host='127.0.0.1', port=8000, lifespan='off', access_log=False)
