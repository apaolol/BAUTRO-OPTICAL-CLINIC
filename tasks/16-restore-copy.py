"""Restore the verified baseline into a NEW private review folder only.

Usage: .venv/Scripts/python.exe tasks/16-restore-copy.py review-name
Never overwrites a live database or existing folder. No row values are printed.
"""
import hashlib
import json
from pathlib import Path
import re
import sqlite3
from contextlib import closing
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
assert len(sys.argv) == 2 and re.fullmatch(r'[A-Za-z0-9_-]+', sys.argv[1]), 'Supply a new simple review name'
target = root / '.setup-backups' / ('restore-' + sys.argv[1])
assert not target.exists(), 'Review folder already exists; choose a new name'
baseline = json.loads((root / 'tasks/setup-baseline.json').read_text())
backup = Path(baseline['backup_directory'])
for name, expected in baseline['backup_sha256'].items():
    assert hashlib.sha256((backup / name).read_bytes()).hexdigest() == expected
with zipfile.ZipFile(backup / 'legacy-source.zip') as z:
    assert z.testzip() is None
    for name in z.namelist():
        assert (target / name).resolve().is_relative_to(target.resolve())
    z.extractall(target)
    for name in z.namelist():
        if not name.endswith('/'):
            assert hashlib.sha256((target / name).read_bytes()).hexdigest() == hashlib.sha256(z.read(name)).hexdigest()
with closing(sqlite3.connect(f'{(backup / "bautro.db").as_uri()}?mode=ro', uri=True)) as source:
    with closing(sqlite3.connect(target / 'backend/bautro.db')) as destination:
        source.backup(destination)
        assert destination.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        for table, expected in baseline['database_snapshot'].items():
            assert destination.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] == expected['rows']
            assert [list(r) for r in destination.execute(f'PRAGMA table_info("{table}")')] == expected['columns']
            assert [list(r) for r in destination.execute(f'PRAGMA index_list("{table}")')] == expected['indexes']
print('Verified legacy source and SQLite restored to new private review folder: ' + str(target))
