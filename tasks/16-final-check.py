"""Post-cutover read-only HTTP, synthetic persistence and preservation checks."""
from contextlib import closing
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import runpy
import sqlite3
import urllib.request
import zipfile
from urllib.parse import urljoin, urlsplit

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'tasks/setup-baseline.json').read_text())
manifest = json.loads((root / 'tasks/16-retirement-manifest.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(root / 'backend/bautro.db') == baseline['database_sha256_before']
for name, expected in baseline['backup_sha256'].items():
    assert sha(Path(baseline['backup_directory']) / name) == expected
for relative, expected in manifest['retired_source_sha256'].items():
    assert sha(Path(manifest['retirement_destination']) / relative) == expected
for relative in manifest['paths']:
    assert not (root / relative).exists(), relative
assert sha(Path(manifest['pre_cutover_archive'])) == manifest['pre_cutover_archive_sha256']
with zipfile.ZipFile(manifest['pre_cutover_archive']) as z:
    for name in z.namelist():
        current = root / name
        if current.exists() and name not in ['frontend/README.md','frontend/pages/patients.html']:
            assert sha(current) == hashlib.sha256(z.read(name)).hexdigest(), name
assert sha(root / 'backend/fishtool.py') == json.loads((root / 'tasks/02-setup-verification.json').read_text())['tool_sha256']
assert not (root / 'backend/app/database.db').exists()
snapshot = runpy.run_path(str(root / 'tasks/16-verify-acceptance.py'))['snapshot']
assert snapshot(root / 'backend/bautro.db') == baseline['database_snapshot']

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        self.links += [v for k,v in attrs if k in ('src','href') and v and not v.startswith('#')]

visited = set()
for page in ['', 'pages/patients.html', 'pages/prescriptions.html', 'pages/inventory.html', 'pages/billing.html']:
    url = 'http://127.0.0.1:5500/' + page
    with urllib.request.urlopen(url, timeout=10) as response:
        assert response.status == 200
        html = response.read().decode('utf-8')
    assert 'type="module"' not in html and '.tsx' not in html and '/@vite' not in html
    links = Links()
    links.feed(html)
    for relative in links.links:
        link = urljoin(url, relative)
        assert urlsplit(link).netloc == '127.0.0.1:5500'
        if link not in visited:
            with urllib.request.urlopen(link, timeout=10) as response:
                assert response.status == 200
            visited.add(link)
with urllib.request.urlopen('http://127.0.0.1:8000/openapi.json', timeout=10) as response:
    schema = json.load(response)
assert sum(len(v) for v in schema['paths'].values()) == 14
for origin in ['http://127.0.0.1:5500','http://localhost:5500']:
    for method in ['GET','OPTIONS']:
        headers = {'Origin': origin}
        if method == 'OPTIONS':
            headers.update({'Access-Control-Request-Method': 'PUT','Access-Control-Request-Headers':'content-type'})
        request = urllib.request.Request('http://127.0.0.1:8000/', method=method, headers=headers)
        with urllib.request.urlopen(request, timeout=10) as response:
            assert response.status == 200 and response.headers['Access-Control-Allow-Origin'] == origin
            assert response.headers['Access-Control-Allow-Credentials'] is None
with closing(sqlite3.connect(root / '.setup-backups/task16-acceptance/browser.db')) as c:
    assert c.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert [c.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in ['patients','prescriptions','inventory','billing']] == [3,2,4,3]
    assert c.execute("SELECT full_name,clinical_notes FROM patients WHERE patient_number='P-00003'").fetchone() == ('Synthetic Acceptance','Synthetic acceptance notes')
    assert c.execute("SELECT patient_number,od_axis,os_sphere,lens_brand,lens_coating FROM prescriptions WHERE prescription_number='RX-00002'").fetchone() == ('P-00003','005','-1.25','Synthetic Lens','Synthetic Coating')
    assert c.execute("SELECT quantity,reorder_level FROM inventory WHERE item_code='ITM-00004'").fetchone() == (6,5)
    assert c.execute("SELECT subtotal,discount,total,amount_paid,balance,status,payment_method FROM billing WHERE invoice_number='INV-00003'").fetchone() == (100,10,90,40,50,'Partial','Cash')
    assert c.execute('SELECT SUM(amount_paid) FROM billing').fetchone()[0] == 90
result_path = root / 'tasks/16-acceptance-verification.json'
result = json.loads(result_path.read_text())
result.update({'post_cutover_domain_contracts_and_fresh_process_restart': True,
    'http_all_five_direct_urls_and_referenced_assets': True, 'http_referenced_urls_checked': len(visited),
    'http_both_static_origins_get_preflight': True,
    'browser_integrated_create_search_details_all_four_domains': True,
    'browser_restock_threshold_five_to_six': True,
    'browser_invoice_five_amounts_100_10_90_40_50_partial': True,
    'browser_restart_retry_persisted_dashboard': {'patients':3,'prescriptions':2,'inventory':4,'today_paid':80,'total_paid':90,'low_stock':1},
    'browser_keyboard_form_open_cancel_focus_and_all_inputs_labeled': True,
    'browser_desktop_all_five_screens': True,
    'browser_task16_narrow_patient_prescription_inventory': True,
    'billing_dashboard_narrow_acceptance': 'Task 14/15 verified evidence retained; later Task 16 viewport reapplication did not change measured 1280 width; no new narrow claim for those final views',
    'native_print_acceptance': 'Task 12 explicit user-confirmed selected-only native preview; Task 12 JS selected-print regression rerun passed; no new native preview claimed',
    'all_six_js_verifiers_passed': True,
    'legacy_frontend_restored_vite_8_3_1_startup_shell': True,
    'legacy_frontend_note': 'Used retained installed dependencies via temporary junction, no install; backend stopped for React shell check; legacy load-error state expected; junction removed',
    'documented_restore_command_rehearsed': True,
    'thirty_legacy_paths_retired_reversibly': True,
    'retired_source_and_current_source_archive_hashes_verified': True,
    'retained_generated_and_uncommitted_vanilla_source_hashes_match_pre_cutover': True,
    'fishtool_hash_unchanged': True,
    'clinical_database_schema_indexes_counts_and_hash_unchanged': True,
    'dependencies_pip_check': 'passed; no new dependencies',
    'limitations': ['Local development cutover only; no deployment or live database restore.',
      'Count+1 codes, float money, non-idempotent writes, no patient check/server invoice recomputation, compatible missing responses and SQL NULL stock limitation retained.',
      'No concurrency/load or formal assistive-technology audit.',
      'Initial sandbox legacy ASGI child timed out at 45 seconds; bounded outside-sandbox rehearsal passed.',
      'Archive inventory corrects historical exclusion note: 538 files including 483 nested backend/.venv pip files; no frontend/node_modules.',
      'Task 16 supplements prior detailed screen evidence; does not claim a newly repeated native print preview.']})
result_path.write_text(json.dumps(result, indent=2) + '\n')
print('Final HTTP, synthetic records, retirement and original-data preservation checks passed.')
