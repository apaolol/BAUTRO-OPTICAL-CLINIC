async function checkApiConnection() {
  const button = document.getElementById('checkConnectionButton');
  const status = document.getElementById('connectionStatus');
  if (button.disabled) return;
  setButtonBusy(button, true);
  setStatus(status, 'Checking API connection…', 'loading');
  try {
    const data = await apiRequest('/');
    if (data?.message !== 'Bautro Optical Clinic API') throw new Error('Unexpected API response. Check the backend and retry.');
    setStatus(status, 'Connected to Bautro Optical Clinic API.', 'success');
  } catch (error) {
    setStatus(status, error.message, 'error');
  } finally {
    setButtonBusy(button, false);
  }
}

document.getElementById('checkConnectionButton').addEventListener('click', checkApiConnection);
checkApiConnection();
