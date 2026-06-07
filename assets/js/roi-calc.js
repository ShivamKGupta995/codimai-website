/* ============================================================
   ROI calculator  estimates time and money saved by automating
   a repetitive workflow, then reveals the result once the visitor
   provides contact details (lead gate). The lead is sent, best
   effort, to the shared contact endpoint so it lands with the
   audit requests. Pure progressive enhancement: if JS is off the
   form simply does nothing and the rest of the page still works.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('roiForm');
  if (!form) return;

  var results = document.getElementById('roiResults');
  var errorEl = document.getElementById('roiError');
  var outHours   = document.getElementById('roiHours');
  var outMonthly = document.getElementById('roiMonthly');
  var outYearly  = document.getElementById('roiYearly');

  var ENDPOINT  = '/blogs/backend/api/contact.php';
  var EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Assumptions, kept conservative and stated on the page. */
  var AUTOMATION_RATE = 0.6;   /* share of repetitive hours automated */
  var WEEKS_PER_MONTH = 4.33;
  var HOURS_PER_WEEK  = 40;    /* to derive an hourly cost from salary */

  var money = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  });
  var count = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  function num(id) {
    var v = parseFloat((document.getElementById(id).value || '').trim());
    return isFinite(v) ? v : NaN;
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function sendLead(data) {
    var fd = new FormData();
    fd.append('name', 'ROI calculator lead');
    fd.append('email', data.email);
    fd.append('team_size', String(data.employees));
    fd.append('interest', 'ROI Calculator');
    fd.append('message',
      'ROI estimate request.\n' +
      'Phone: ' + data.phone + '\n' +
      'Employees: ' + data.employees + '\n' +
      'Avg monthly salary: ' + data.salary + '\n' +
      'Repetitive hours/person/week: ' + data.hours + '\n' +
      'Estimated hours saved/month: ' + Math.round(data.hoursSaved) + '\n' +
      'Estimated money saved/year: ' + Math.round(data.yearly));

    /* Best effort: a failed send must not block the visitor's result. */
    fetch(ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd })
      .catch(function () { /* swallow  result already shown */ });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    /* Honeypot: bots fill the hidden website field. */
    var hp = form.querySelector('[name="website"]');
    if (hp && hp.value) { return; }

    var employees = num('roi-employees');
    var salary    = num('roi-salary');
    var hours     = num('roi-hours');
    var email     = (document.getElementById('roi-email').value || '').trim();
    var phone     = (document.getElementById('roi-phone').value || '').trim();

    if (!(employees > 0) || !(salary >= 0) || !(hours > 0)) {
      showError('Please enter your team size, salary, and repetitive hours.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Enter a valid email so we can send your estimate.');
      return;
    }
    if (phone.length < 6) {
      showError('Enter a phone number so we can reach you.');
      return;
    }

    var hoursSaved = employees * hours * WEEKS_PER_MONTH * AUTOMATION_RATE;
    var hourlyCost = salary / (WEEKS_PER_MONTH * HOURS_PER_WEEK);
    var monthly    = hoursSaved * hourlyCost;
    var yearly     = monthly * 12;

    if (outHours)   outHours.textContent   = count.format(Math.round(hoursSaved)) + ' hrs';
    if (outMonthly) outMonthly.textContent = money.format(Math.round(monthly));
    if (outYearly)  outYearly.textContent  = money.format(Math.round(yearly));

    if (results) {
      results.hidden = false;
      results.setAttribute('tabindex', '-1');
      results.focus({ preventScroll: true });
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    sendLead({
      email: email, phone: phone, employees: employees,
      salary: salary, hours: hours, hoursSaved: hoursSaved, yearly: yearly
    });
  });
}());
