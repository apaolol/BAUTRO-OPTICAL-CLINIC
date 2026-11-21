from logging.config import fileConfig

from alembic import context
from sqlmodel import SQLModel

from app.database import engine, sqlite_url
from app import models  # Register all six table models for autogeneration.

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Both migration modes use the same module-relative database as the app.
config.set_main_option("sqlalchemy.url", sqlite_url.replace("%", "%%"))
target_metadata = SQLModel.metadata


def run_migrations_offline():
    context.configure(
        url=sqlite_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
