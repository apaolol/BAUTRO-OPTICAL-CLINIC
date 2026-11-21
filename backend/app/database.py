from pathlib import Path

from sqlmodel import SQLModel, create_engine
from app import models  # Import every table before create_all uses the metadata.

database_path = Path(__file__).resolve().parent.parent / "bautro.db"
sqlite_url = f"sqlite:///{database_path.as_posix()}"

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
