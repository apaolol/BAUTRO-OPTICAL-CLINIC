"""Acceptance rehearsals. Never migrates or writes the clinic database.

Run with project .venv Python; private restored copies remain under .setup-backups.
"""
import asyncio
from contextlib import closing
import hashlib
import json
from pathlib import Path
import runpy
import sqlite3
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.setup-backups/task16-acceptance'
BASE = json.loads((ROOT / 'tasks/setup-baseline.json').read_text())
BACKUP = Path(BASE['backup_directory'])
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def snapshot(path):
    with closing(sqlite3.connect(f'{path.as_uri()}?mode=ro', uri=True)) as c:
        assert c.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        return {t: {'rows': c.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0],
                    'columns': [list(r) for r in c.execute(f'PRAGMA table_info("{t}")')],
                    'indexes': [list(r) for r in c.execute(f'PRAGMA index_list("{t}")')]}
                for (t,) in c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")}

def restore(source, target):
    assert target.resolve().is_relative_to(WORK.resolve()) and not target.exists()
    with closing(sqlite3.connect(f'{source.as_uri()}?mode=ro', uri=True)) as src:
        with closing(sqlite3.connect(target)) as dst:
            src.backup(dst)
    assert snapshot(source) == snapshot(target)

def child(*args, cwd=ROOT):
    subprocess.run([sys.executable, str(Path(__file__).resolve()), *map(str, args)],
                   cwd=cwd, check=True, timeout=45)

def worker(mode, target):
    sys.path.insert(0, str(ROOT / 'backend'))
    if mode == 'legacy':
        sys.path.insert(0, str(target / 'backend'))
        import main
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        import database
        engine = create_engine('sqlite:///' + (target / 'backend/bautro.db').as_posix())
        factory = sessionmaker(bind=engine)
        def get_db():
            with factory() as session:
                yield session
        main.app.dependency_overrides[database.get_db] = get_db
        helper = runpy.run_path(str(ROOT / 'tasks/05-verify-patients.py'))
        helper['request'].__globals__['app'] = main.app
        async def checks():
            for url in ['/', '/patients/', '/prescriptions/', '/inventory/', '/billing/', '/dashboard/']:
                assert (await helper['request']('GET', url))[0] == 200
        asyncio.run(checks())
        engine.dispose()
        return
    from sqlmodel import SQLModel, create_engine
    import app.database as database
    engine = create_engine('sqlite:///' + target.as_posix(), connect_args={'check_same_thread': False})
    database.engine = engine
    if mode == 'migration':
        from alembic.config import Config
        from alembic import command
        database.sqlite_url = 'sqlite:///' + target.as_posix()
        cfg = Config(str(ROOT / 'backend/alembic.ini'))
        command.upgrade(cfg, 'head')
        command.check(cfg)
        with closing(sqlite3.connect(target)) as c:
            assert c.execute('SELECT version_num FROM alembic_version').fetchone()[0] == BASE['alembic_revision']
    elif mode in ('contracts', 'restart'):
        from app.routers import Patient, Prescription, Inventory, Billing, dashboard
        for router in [Patient, Prescription, Inventory, Billing, dashboard]:
            router.engine = engine
        SQLModel.metadata.create_all(engine)
        for number, name in [(5, 'patients'), (6, 'prescriptions'), (7, 'inventory'), (8, 'billing')]:
            harness = runpy.run_path(str(ROOT / f'tasks/{number:02d}-verify-{name}.py'))
            asyncio.run(harness['verify'](restart=mode == 'restart'))
        if mode == 'contracts':
            request = runpy.run_path(str(ROOT / 'tasks/05-verify-patients.py'))['request']
            status, metrics = asyncio.run(request('GET', '/dashboard/'))
            assert status == 200
            with closing(sqlite3.connect(target)) as c:
                assert metrics['total_patients'] == c.execute('SELECT COUNT(*) FROM patients').fetchone()[0]
                assert metrics['total_revenue'] == c.execute('SELECT SUM(amount_paid) FROM billing').fetchone()[0]
        from app.main import app
        async def startup():
            async with app.router.lifespan_context(app):
                pass
        asyncio.run(startup())
    engine.dispose()

def main():
    if len(sys.argv) == 3:
        worker(sys.argv[1], Path(sys.argv[2]).resolve())
        return
    WORK.mkdir(parents=True, exist_ok=True)
    assert digest(ROOT / 'backend/bautro.db') == BASE['database_sha256_before']
    for name, expected in BASE['backup_sha256'].items():
        assert digest(BACKUP / name) == expected
    # Read every inventory entry without disclosing clinical values.
    assert snapshot(ROOT / 'backend/bautro.db') == BASE['database_snapshot']
    legacy = WORK / 'legacy'
    with zipfile.ZipFile(BACKUP / 'legacy-source.zip') as archive:
        assert archive.testzip() is None
        if not legacy.exists():
            archive.extractall(legacy)
        for name in archive.namelist():
            if not name.endswith('/'):
                assert digest(legacy / name) == hashlib.sha256(archive.read(name)).hexdigest()
    restored = legacy / 'backend/bautro.db'
    if not restored.exists():
        restore(BACKUP / 'bautro.db', restored)
    before = snapshot(restored)
    child('legacy', legacy, cwd=legacy / 'backend')
    assert snapshot(restored) == before
    fresh, populated, synthetic = [WORK / n for n in ['fresh.db', 'populated.db', 'synthetic.db']]
    if not populated.exists():
        restore(BACKUP / 'bautro.db', populated)
    child('migration', fresh)
    child('migration', populated)
    assert snapshot(populated) == BASE['database_snapshot']
    assert {k: (v['columns'], v['indexes']) for k,v in snapshot(fresh).items()} == {
        k: (v['columns'], v['indexes']) for k,v in BASE['database_snapshot'].items()}
    assert not synthetic.exists(), 'Use a new rehearsal directory rather than deleting evidence'
    child('contracts', synthetic)
    child('restart', synthetic)
    dashboard = WORK / 'dashboard.db'
    assert not dashboard.exists()
    # Independent aggregate/route/CORS verifier, without overwriting historical evidence.
    h = runpy.run_path(str(ROOT / 'tasks/09-verify-dashboard.py'))
    from sqlmodel import SQLModel, create_engine
    e = create_engine('sqlite:///' + dashboard.as_posix())
    h['dashboard'].engine = e
    SQLModel.metadata.create_all(e)
    asyncio.run(h['verify'](dashboard))
    e.dispose()
    assert digest(ROOT / 'backend/bautro.db') == BASE['database_sha256_before']
    result = {'date': '2026-11-21', 'task': 16,
              'all_domain_contracts_full_fields_status_shapes_validation': True,
              'all_14_resolved_operations_and_cors': True,
              'fresh_process_restart_all_four_domains': True,
              'cross_domain_revenue_counts': True,
              'fresh_and_populated_copy_upgrade_alembic_check': True,
              'schema_indexes_counts_integrity_match': True,
              'archive_crc_and_all_extracted_file_hashes': True,
              'sqlite_online_restore_and_legacy_asgi_startup_reads': True,
              'legacy_restored_copy_unchanged': True,
              'original_database_sha256': digest(ROOT / 'backend/bautro.db'),
              'baseline_backups_verified': True,
              'rehearsal_directory': str(WORK)}
    (ROOT / 'tasks/16-acceptance-verification.json').write_text(json.dumps(result, indent=2) + '\n')
    print('Task 16 database/API/restore acceptance passed; no clinical values logged.')

if __name__ == '__main__':
    main()
