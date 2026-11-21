"""Repeat acceptance without overwriting earlier evidence or touching clinic records."""
import asyncio
from contextlib import closing
import datetime
import hashlib
import json
from pathlib import Path
import runpy
import socket
import sqlite3
import subprocess
import sys
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.setup-backups' / ('task16-reverify-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
WORK.mkdir()
BASE = json.loads((ROOT / 'tasks/setup-baseline.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
before = {str(p.relative_to(ROOT)): sha(p) for directory in ['backend/app','backend/migrations','frontend']
          for p in (ROOT / directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts}
results = {}

def run(args, cwd=ROOT):
    result = subprocess.run(args, cwd=cwd, timeout=55, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-4000:] or result.stdout[-4000:])
    return result.stdout.strip()

def worker(mode, target):
    return run([sys.executable, str(ROOT / 'tasks/16-verify-acceptance.py'), mode, str(target)])

assert sha(ROOT / 'backend/bautro.db') == BASE['database_sha256_before']
try:
    for port in [8000,5500]:
        with socket.socket() as probe:
            assert probe.connect_ex(('127.0.0.1',port)) != 0, f'Port {port} already occupied; leave existing service alone'
    results['domain_contracts'] = worker('contracts', WORK / 'contracts.db') or 'passed'
    results['fresh_process_restart'] = worker('restart', WORK / 'contracts.db') or 'passed'
    results['fresh_migrations'] = worker('migration', WORK / 'fresh.db')
    restored_name = WORK.name
    results['restore_command'] = run([sys.executable, 'tasks/16-restore-copy.py', restored_name])
    restored = ROOT / '.setup-backups' / ('restore-' + restored_name)
    source = restored / 'backend/bautro.db'
    snapshot = runpy.run_path(str(ROOT / 'tasks/16-verify-acceptance.py'))['snapshot']
    assert snapshot(source) == BASE['database_snapshot']
    legacy_before = sha(source)
    results['legacy_restored_startup_reads'] = worker('legacy', restored) or 'passed'
    assert sha(source) == legacy_before
    with closing(sqlite3.connect(source)) as src:
        with closing(sqlite3.connect(WORK / 'populated.db')) as dst:
            src.backup(dst)
    results['populated_migrations'] = worker('migration', WORK / 'populated.db')
    assert snapshot(WORK / 'populated.db') == BASE['database_snapshot']
    fresh = snapshot(WORK / 'fresh.db')
    assert {t:(v['columns'],v['indexes']) for t,v in fresh.items()} == {t:(v['columns'],v['indexes']) for t,v in BASE['database_snapshot'].items()}
    h = runpy.run_path(str(ROOT / 'tasks/09-verify-dashboard.py'))
    from sqlmodel import SQLModel, create_engine
    engine = create_engine('sqlite:///' + (WORK / 'dashboard.db').as_posix())
    h['dashboard'].engine = engine
    SQLModel.metadata.create_all(engine)
    asyncio.run(h['verify'](WORK / 'dashboard.db'))
    engine.dispose()
    results['aggregates_exact_routes_cors'] = 'passed'
    results['javascript_checks'] = {p.name: run(['node', str(p)]) for p in sorted((ROOT / 'tasks').glob('*verify*.js'))}
    for p in (ROOT / 'frontend/src/js').glob('*.js'):
        run(['node','--check',str(p)])
    results['pip_check'] = run([sys.executable,'-m','pip','check'])
    results['diff_check'] = run(['git','diff','--check']) or 'passed'
    servers = []
    try:
        for args, cwd, name in [([sys.executable,'tasks/16-preview-server.py'],ROOT,'api'),
                                ([sys.executable,'-m','http.server','5500','--bind','127.0.0.1'],ROOT/'frontend','static')]:
            log = open(WORK / (name+'.log'),'w')
            process = subprocess.Popen(args,cwd=cwd,stdout=log,stderr=log)
            servers.append((process,log))
        import time
        for _ in range(40):
            try:
                with urllib.request.urlopen('http://127.0.0.1:8000/',timeout=1) as response:
                    assert response.status == 200
                with urllib.request.urlopen('http://127.0.0.1:5500/',timeout=1) as response:
                    assert response.status == 200
                break
            except OSError:
                time.sleep(.2)
        else:
            raise RuntimeError('Local verification servers did not start')
        # Execute only assertions; do not re-emit historical browser assertions as fresh evidence.
        code = (ROOT / 'tasks/16-final-check.py').read_text().split('result_path =')[0]
        exec(compile(code,str(ROOT / 'tasks/16-final-check.py'),'exec'), {'__file__':str(ROOT / 'tasks/16-final-check.py')})
        results['http_assets_origins_backups_retirement_synthetic_persistence'] = 'passed'
    finally:
        for process,log in servers:
            process.terminate()
            process.wait(timeout=10)
            log.close()
    for port in [8000,5500]:
        with socket.socket() as probe:
            assert probe.connect_ex(('127.0.0.1',port)) != 0
    results['owned_servers_stopped'] = True
    assert sha(ROOT / 'backend/bautro.db') == BASE['database_sha256_before']
    assert all(sha(ROOT / name) == expected for name,expected in before.items())
    results['active_source_and_clinic_database_unchanged'] = True
    results['status'] = 'passed'
except Exception as error:
    results['status'] = 'failed'
    results['error'] = str(error)
    raise
finally:
    results['rehearsal_directory'] = str(WORK)
    results['date'] = '2026-11-21'
    results['boundaries'] = ['No clinic writes, migrations, restoration or record disclosure.',
        'No new browser or native print checks in this automated rerun; prior user-confirmed preview retained.',
        'No deployment, concurrency/load test or formal assistive-technology audit.']
    (ROOT / 'tasks/16-reverification.json').write_text(json.dumps(results,indent=2)+'\n')
print('Reverification passed. Active source and clinic DB unchanged; owned servers stopped.')
