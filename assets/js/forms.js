/* ============================================================
   Get Started / contact form handling
   - Accessible inline validation (no dependencies)
   - Honeypot spam guard
   - Async submit to a form endpoint (e.g. Formspree); if the
     endpoint isn't configured, falls back to a mailto: draft so
     the form never silently fails on a static host.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('gs-form');
  if (!form) return;

  var statusEl   = document.getElementById('gs-status');
  var submitBtn  = form.querySelector('[type="submit"]');
  var endpoint   = form.getAttribute('data-endpoint') || '';
  var fallbackTo = form.getAttribute('data-fallback-email') || '';
  var configured = endpoint && endpoint.indexOf('your-form-id') === -1;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---- Field-level validation ---------------------------- */

  function fieldWrap(input) {
    return input.closest('.gs-field') || input.parentElement;
  }

  function errorEl(input) {
    return form.querySelector('[data-error-for="' + input.id + '"]');
  }

  function setError(input, message) {
    var wrap = fieldWrap(input);
    var err  = errorEl(input);
    if (message) {
      wrap.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = message;
    } else {
      wrap.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    }
    return !message;
  }

  function validateField(input) {
    var value = (input.value || '').trim();
    if (input.hasAttribute('required') && !value) {
      return setError(input, 'This field is required.');
    }
    if (input.type === 'email' && value && !EMAIL_RE.test(value)) {
      return setError(input, 'Enter a valid email address.');
    }
    return setError(input, '');
  }

  /* Validate required + email fields on blur once touched */
  Array.prototype.forEach.call(
    form.querySelectorAll('input[required], select[required], input[type="email"]'),
    function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (fieldWrap(input).classList.contains('is-invalid')) validateField(input);
      });
    }
  );

  /* ---- Status helpers ------------------------------------ */

  function showStatus(kind, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'gs-form__status is-visible gs-form__status--' + kind;
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.className = 'gs-form__status';
    statusEl.textContent = '';
  }

  /* ---- Success state (replaces the form) ----------------- */

  function showSuccess() {
    var card = form.parentElement;
    card.innerHTML =
      '<div class="gs-success">' +
        '<svg class="gs-success__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' +
        '<h2 class="gs-success__title">Thank you — we’re on it.</h2>' +
        '<p class="gs-success__body">Your request reached the CodimAI team. We’ll reply within one business day to schedule your audit.</p>' +
      '</div>';
    var box = card.querySelector('.gs-success');
    box.setAttribute('tabindex', '-1');
    box.focus();
  }

  /* ---- mailto fallback (static host, no endpoint) -------- */

  function mailtoFallback(data) {
    var subject = 'Free audit request — ' + (data.interest || 'General');
    var bodyLines = [
      'Name: ' + (data.name || ''),
      'Email: ' + (data.email || ''),
      'Company: ' + (data.company || ''),
      'Team size: ' + (data.team_size || ''),
      'Interest: ' + (data.interest || ''),
      '',
      (data.message || '')
    ];
    var href = 'mailto:' + fallbackTo +
               '?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(bodyLines.join('\n'));
    window.location.href = href;
    showStatus('ok', 'Opening your email app to send the request…');
  }

  /* ---- Submit -------------------------------------------- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearStatus();

    /* Honeypot: if filled, silently "succeed" without sending */
    var hp = form.querySelector('[name="website"]');
    if (hp && hp.value) { showSuccess(); return; }

    /* Validate all guarded fields */
    var fields = form.querySelectorAll('input[required], select[required], input[type="email"]');
    var ok = true;
    var firstInvalid = null;
    Array.prototype.forEach.call(fields, function (input) {
      if (!validateField(input)) {
        ok = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (!ok) {
      showStatus('err', 'Please fix the highlighted fields and try again.');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    delete data.website;

    /* No real endpoint configured → mailto fallback */
    if (!configured) { mailtoFallback(data); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (res.ok) { showSuccess(); return; }
        throw new Error('Bad response');
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request your free audit';
        showStatus('err', 'Something went wrong. Please email ' + fallbackTo + ' and we’ll take it from there.');
      });
  });
}());
