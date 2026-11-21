// Synthetic fetch responses only; no clinic records or writes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const status = { textContent: '', dataset: {} };
const button = { disabled: false, setAttribute() {}, addEventListener() {} };
const context = vm.createContext({
  AbortController, setTimeout, clearTimeout, Intl, TypeError,
  document: { getElementById: id => id === 'connectionStatus' ? status : button },
  fetch: async () => ({ ok: true, status: 200, text: async () => '{"message":"Bautro Optical Clinic API"}' })
});
for (const name of ['api', 'common', 'shell']) {
  vm.runInContext(fs.readFileSync(`frontend/src/js/${name}.js`, 'utf8'), context);
}
async function run() {
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(status.dataset.state, 'success');
  assert.equal(button.disabled, false);
  for (const [response, message] of [
    [{ ok: false, status: 422, text: async () => JSON.stringify({ detail: [{ loc: ['body', 'full_name'], msg: 'Field required' }] }) }, /HTTP 422: body.full_name: Field required/],
    [{ ok: false, status: 500, text: async () => '' }, /HTTP 500/],
    [{ ok: true, status: 200, text: async () => 'invalid' }, /invalid JSON/],
    [{ ok: true, status: 200, text: async () => '{"error":"Not found"}' }, /Not found/]
  ]) {
    context.fetch = async () => response;
    await assert.rejects(vm.runInContext("apiRequest('/')", context), message);
  }
  context.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await vm.runInContext('checkApiConnection()', context);
  assert.equal(status.dataset.state, 'error');
  assert.match(status.textContent, /Cannot reach/);
  assert.equal(button.disabled, false);
  let finish;
  context.fetch = () => new Promise(resolve => { finish = resolve; });
  const pending = vm.runInContext('checkApiConnection()', context);
  assert.equal(button.disabled, true);
  assert.equal(status.dataset.state, 'loading');
  finish({ ok: true, status: 200, text: async () => '{"message":"Bautro Optical Clinic API"}' });
  await pending;
  assert.equal(button.disabled, false);
  assert.equal(status.dataset.state, 'success');
  context.fetch = async (url, options) => {
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.credentials, 'omit');
    assert.deepEqual(JSON.parse(options.body), { synthetic: true });
    return { ok: true, status: 200, text: async () => 'null' };
  };
  assert.equal(await vm.runInContext("apiSend('/synthetic', 'POST', {synthetic: true})", context), null);
  console.log('PASS: JSON, validation/HTTP/legacy errors, network recovery, loading/disable/finally, JSON send and null responses.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
