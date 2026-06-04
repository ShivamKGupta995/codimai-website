(function () {
  'use strict';

  var thread = document.getElementById('wa-thread');
  if (!thread) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Scripted conversation ────────────────────────────────
  // Demonstrates: inbound question → reply → quick replies →
  // catalog card → in-chat form → confirmation. Loops.
  var SCRIPT = [
    { type: 'in',   text: 'Hi! Do you deliver to the old town today?', time: '09:41' },
    { type: 'out',  text: 'Yes — we deliver there until 9pm. Want to place an order?', time: '09:41' },
    { type: 'quick', options: ['Browse menu', 'Track an order', 'Talk to a human'] },
    { type: 'in',   text: 'Browse menu', time: '09:42' },
    { type: 'catalog', name: 'Margherita — Large', price: '$14.00', img: 'product' },
    { type: 'out',  text: 'A favourite. Add it to your order?', time: '09:42' },
    { type: 'in',   text: 'Order now', time: '09:43' },
    { type: 'form', title: 'Quick checkout', rows: ['Name', 'Delivery address', 'Pay on delivery'] },
    { type: 'out',  text: 'All set — your order is confirmed. Arriving in ~30 min.', time: '09:44' }
  ];

  var TYPING_MS = 850;   // typing indicator shown before each agent bubble
  var STEP_MS   = 900;   // gap between user-side steps
  var LOOP_MS   = 2600;  // pause before restarting

  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function scrollDown() { thread.scrollTop = thread.scrollHeight; }

  function addBubble(step) {
    var b = el('div', 'wa-msg wa-msg--' + (step.type === 'in' ? 'in' : 'out'));
    b.appendChild(el('span', null, esc(step.text)));
    if (step.time) b.appendChild(el('span', 'wa-msg__time', esc(step.time)));
    thread.appendChild(b);
    scrollDown();
  }

  function addQuick(step) {
    var wrap = el('div', 'wa-quick');
    step.options.forEach(function (opt) {
      wrap.appendChild(el('button', 'wa-quick__btn', esc(opt)));
    });
    // Buttons are illustrative; disable interaction for a clean loop.
    wrap.querySelectorAll('button').forEach(function (btn) {
      btn.tabIndex = -1; btn.setAttribute('aria-hidden', 'true');
    });
    thread.appendChild(wrap);
    scrollDown();
  }

  function addCatalog(step) {
    var card = el('div', 'wa-msg wa-msg--out wa-catalog');
    card.appendChild(el('div', 'wa-catalog__img', '&nbsp;'));
    card.appendChild(el('div', 'wa-catalog__name', esc(step.name)));
    card.appendChild(el('div', 'wa-catalog__price', esc(step.price)));
    thread.appendChild(card);
    scrollDown();
  }

  function addForm(step) {
    var card = el('div', 'wa-msg wa-msg--out wa-formcard');
    card.appendChild(el('div', 'wa-formcard__title', esc(step.title)));
    step.rows.forEach(function (label) {
      var row = el('div', 'wa-formcard__row');
      row.appendChild(el('span', null, esc(label)));
      card.appendChild(row);
    });
    thread.appendChild(card);
    scrollDown();
  }

  function showTyping() {
    var t = el('div', 'wa-msg wa-msg--in wa-typing');
    t.innerHTML = '<span></span><span></span><span></span>';
    t.setAttribute('aria-hidden', 'true');
    thread.appendChild(t);
    scrollDown();
    return t;
  }

  function renderStep(step) {
    if (step.type === 'in')      addBubble(step);
    else if (step.type === 'out') addBubble(step);
    else if (step.type === 'quick') addQuick(step);
    else if (step.type === 'catalog') addCatalog(step);
    else if (step.type === 'form') addForm(step);
  }

  // ── Static render (reduced motion): show full conversation ─
  function renderAll() {
    thread.textContent = '';
    SCRIPT.forEach(renderStep);
  }

  // ── Animated playback ─────────────────────────────────────
  var i = 0;
  function play() {
    if (i >= SCRIPT.length) {
      later(function () { thread.textContent = ''; i = 0; play(); }, LOOP_MS);
      return;
    }
    var step = SCRIPT[i];
    var agentBubble = (step.type === 'out' || step.type === 'catalog' || step.type === 'form');

    if (agentBubble) {
      var typing = showTyping();
      later(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        renderStep(step);
        i++;
        later(play, STEP_MS);
      }, TYPING_MS);
    } else {
      renderStep(step);
      i++;
      later(play, STEP_MS);
    }
  }

  function start() {
    clearTimers();
    thread.textContent = '';
    i = 0;
    play();
  }

  function stop() { clearTimers(); }

  // ── Reduced motion: render once, no loop ─────────────────
  if (reduceMotion) {
    renderAll();
    return;
  }

  // ── Start when in view; pause when hidden / off-screen ───
  var inView = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !inView) { inView = true; start(); }
      else if (!e.isIntersecting && inView) { inView = false; stop(); }
    });
  }, { threshold: 0.4 });

  io.observe(thread);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); }
    else if (inView) { start(); }
  });

}());
