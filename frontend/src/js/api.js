const apiBaseUrl = 'http://127.0.0.1:8000';

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(apiBaseUrl + path, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
      credentials: 'omit',
      signal: controller.signal
    });
    const body = await response.text();
    let data = null;
    if (body) {
      try { data = JSON.parse(body); }
      catch { throw new Error(`API returned invalid JSON (HTTP ${response.status}). Please retry.`); }
    }
    if (!response.ok) {
      let detail = data?.detail;
      if (Array.isArray(detail)) {
        detail = detail.map(item => `${(item.loc || []).join('.')}: ${item.msg}`).join('; ');
      }
      throw new Error(`HTTP ${response.status}: ${typeof detail === 'string' ? detail : 'Request failed. Please retry.'}`);
    }
    if (data && typeof data.error === 'string') throw new Error(data.error);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('API request timed out. Check the backend and retry.');
    if (error instanceof TypeError) throw new Error('Cannot reach the clinic API. Start the backend at http://127.0.0.1:8000 and retry.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function apiSend(path, method, data) {
  return apiRequest(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
