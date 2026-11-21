"""Archive current source and produce an explicit retirement manifest; does not retire files."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'tasks/setup-baseline.json').read_text())
targets = ['backend/main.py', 'backend/database.py', 'backend/models', 'backend/routes',
           'backend/services', 'backend/utils', 'backend/refactor_backend.py', 'backend/alembic',
           'backend/__pycache__', 'frontend/legacy_index.html', 'frontend/old_index.html',
           'frontend/package.json', 'frontend/package-lock.json', 'frontend/vite.config.ts',
           'frontend/tsconfig.json', 'frontend/tsconfig.app.json', 'frontend/tsconfig.node.json',
           'frontend/.oxlintrc.json', 'frontend/brand', 'frontend/public', 'frontend/src/assets',
           'frontend/src/components', 'frontend/src/hooks', 'frontend/src/pages',
           'frontend/src/App.tsx', 'frontend/src/App.css', 'frontend/src/main.tsx',
           'frontend/src/index.css', 'frontend/src/api.ts', 'frontend/node_modules']
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
hashes = {}
for target in targets:
    p = root / target
    assert p.exists(), target
    if target.endswith('node_modules') or '__pycache__' in target:
        continue
    for f in ([p] if p.is_file() else p.rglob('*')):
        if not f.is_file() or '__pycache__' in f.parts:
            continue
        relative = f.relative_to(root).as_posix()
        original = 'frontend/index.html' if relative == 'frontend/legacy_index.html' else relative
        assert sha(f) == baseline['source_sha256'][original], 'Unreviewed legacy edit: ' + relative
        hashes[relative] = sha(f)
folder = root / '.setup-backups/task16-acceptance'
archive = folder / 'pre-cutover-source.zip'
assert not archive.exists()
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for directory in ['backend', 'frontend']:
        for f in (root / directory).rglob('*'):
            if not f.is_file() or any(x in f.parts for x in ['node_modules', '.venv', '__pycache__']) or f.suffix == '.db':
                continue
            z.write(f, f.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name in z.namelist():
        assert hashlib.sha256(z.read(name)).hexdigest() == sha(root / name)
result = {'date': '2026-11-21', 'paths': targets, 'retired_source_sha256': hashes,
          'pre_cutover_archive': str(archive), 'pre_cutover_archive_sha256': sha(archive),
          'retirement_destination': str(root / '.setup-backups/task16-retired'),
          'note': 'Move paths after acceptance. Keep baseline backup, generated app, DB, FISHTOOL and migrations.'}
(root / 'tasks/16-retirement-manifest.json').write_text(json.dumps(result, indent=2) + '\n')
print('Retirement paths match baseline; current source archived and verified.')
