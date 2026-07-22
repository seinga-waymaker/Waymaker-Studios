document.addEventListener('DOMContentLoaded', () => {
  const formEl = document.getElementById('rate-guide-form');
  const nameEl = document.getElementById('rg-name');
  const emailEl = document.getElementById('rg-email');
  const errorEl = document.getElementById('rg-error');
  const submitEl = document.getElementById('rg-submit');
  const formStateEl = document.getElementById('gate-form-state');
  const successStateEl = document.getElementById('gate-success-state');

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqrdbgq';

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    emailEl.classList.add('has-error');
  }

  function clearError() {
    errorEl.hidden = true;
    emailEl.classList.remove('has-error');
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    if (!name || !email) return;

    submitEl.disabled = true;
    submitEl.textContent = 'Submitting...';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        formStateEl.style.display = 'none';
        successStateEl.style.display = 'flex';
      } else {
        showError('Something went wrong. Please try again.');
        submitEl.disabled = false;
        submitEl.textContent = 'View Rate Guide';
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
      submitEl.disabled = false;
      submitEl.textContent = 'View Rate Guide';
    }
  });
});
