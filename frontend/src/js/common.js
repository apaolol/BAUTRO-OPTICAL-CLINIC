function setStatus(element, message, state = '') {
  element.textContent = message;
  element.dataset.state = state;
}

function formatPeso(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0);
}

function setButtonBusy(button, busy) {
  button.disabled = busy;
  button.setAttribute('aria-busy', String(busy));
}
