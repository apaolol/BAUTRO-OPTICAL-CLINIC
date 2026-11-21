"""Actual API with Billing router redirected to a dedicated synthetic database."""
import sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'backend'))
from sqlmodel import SQLModel, create_engine
from app import models
from app.routers import Billing
from app.main import app
import uvicorn
directory = root / '.setup-backups' / 'task14-synthetic'
directory.mkdir(exist_ok=True)
engine = create_engine(f'sqlite:///{(directory / "billing.db").as_posix()}', connect_args={'check_same_thread': False})
SQLModel.metadata.create_all(engine)
Billing.engine = engine
# Only billing/root requests; lifespan off prevents original database schema access.
uvicorn.run(app, host='127.0.0.1', port=8000, lifespan='off', access_log=False)
