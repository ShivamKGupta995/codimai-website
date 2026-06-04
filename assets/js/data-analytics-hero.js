(function () {
  'use strict';

  var canvas = document.getElementById('data-analytics-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ─────────────────────────────────────────
  var BG     = '#F7F5F0';
  var SURFACE = '#FFFFFF';
  var INK    = '#1A1A18';
  var MUTED  = '#86847C';
  var BORDER = 'rgba(26,26,24,0.13)';

  // ── Data pipeline nodes ───────────────────────────────────
  // Three zones: DATA SOURCES → ANALYTICS LAYER → INSIGHTS
  // fx/fy are fractional (0–1); resolved to pixels at draw time.
  var NODES = [
    // Data Sources (left)
    { id: 0,  label: 'CRM',       mono: 'source', fx: 0.12, fy: 0.22 },
    { id: 1,  label: 'ERP',       mono: 'source', fx: 0.12, fy: 0.40 },
    { id: 2,  label: 'Ops',       mono: 'source', fx: 0.12, fy: 0.60 },
    { id: 3,  label: 'Events',    mono: 'source', fx: 0.12, fy: 0.78 },
    // Analytics Layer (centre)
    { id: 4,  label: 'Ingest',    mono: 'layer',  fx: 0.40, fy: 0.30 },
    { id: 5,  label: 'Model',     mono: 'layer',  fx: 0.40, fy: 0.70 },
    { id: 6,  label: 'KPIs',      mono: 'layer',  fx: 0.60, fy: 0.30 },
    { id: 7,  label: 'Patterns',  mono: 'layer',  fx: 0.60, fy: 0.70 },
    // Insights (right)
    { id: 8,  label: 'Revenue',   mono: 'insight', fx: 0.88, fy: 0.22 },
    { id: 9,  label: 'Behaviour', mono: 'insight', fx: 0.88, fy: 0.40 },
    { id: 10, label: 'Executive', mono: 'insight', fx: 0.88, fy: 0.60 },
    { id: 11, label: 'Alerts',    mono: 'insight', fx: 0.88, fy: 0.78 },
  ];

  // ── Directed edges (left to right data flow) ──────────────
  var EDGES = [
    // Sources → Ingest
    { a: 0, b: 4, c: -0.08 },
    { a: 1, b: 4, c:  0.05 },
    { a: 2, b: 5, c: -0.05 },
    { a: 3, b: 5, c:  0.08 },
    // Ingest / Model → KPIs + Patterns
    { a: 4, b: 6, c:  0.00 },
    { a: 4, b: 7, c:  0.10 },
    { a: 5, b: 6, c: -0.10 },
    { a: 5, b: 7, c:  0.00 },
    // KPIs → Insights
    { a: 6, b: 8,  c: -0.08 },
    { a: 6, b: 9,  c:  0.00 },
    // Patterns → Insights
    { a: 7, b: 10, c:  0.00 },
    { a: 7, b: 11, c:  0.08 },
    // Cross-fan
    { a: 6, b: 10, c:  0.06 },
    { a: 7, b: 9,  c: -0.06 },
  ];

  // ── Zone backdrops ────────────────────────────────────────
  var ZONES = [
    { label: 'DATA SOURCES',    fx: 0.12, fw: 0.16, color: 'rgba(26,26,24,0.025)' },
    { label: 'ANALYTICS LAYER', fx: 0.50, fw: 0.26, color: 'rgba(26,26,24,0.020)' },
    { label: 'INSIGHTS',        fx: 0.88, fw: 0.16, color: 'rgba(26,26,24,0.025)' },
  ];

  var activation = NODES.map(function () { return 0; });
  var pulses = [];

  // ── Sizing — ALL W-relative, no hard-clamped px ──────────
  function nodeR() {
    return Math.max(12, W * 0.038);
  }

  function px(node) { return { x: node.fx * W, y: node.fy * H }; }

  function cp(p1, p2, curve) {
    var mx = (p1.x + p2.x) * 0.5, my = (p1.y + p2.y) * 0.5;
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return { x: mx - curve * dy, y: my + curve * dx };
  }

  function bezAt(p1, cpt, p2, t) {
    var mt = 1 - t;
    return {
      x: mt * mt * p1.x + 2 * mt * t * cpt.x + t * t * p2.x,
      y: mt * mt * p1.y + 2 * mt * t * cpt.y + t * t * p2.y,
    };
  }

  // ── arcTo-based rounded rect (no ctx.roundRect) ──────────
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function spawnPulse(edgeIdx) {
    if (pulses.length > 28) return;
    var dotR = Math.max(1.5, W * 0.006) + Math.random() * Math.max(0.5, W * 0.002);
    pulses.push({
      edge:  edgeIdx,
      t:     0,
      speed: 0.006 + Math.random() * 0.005,
      r:     dotR,
    });
  }

  EDGES.forEach(function (_, i) {
    setTimeout(function () { spawnPulse(i); }, i * 220 + Math.random() * 200);
  });

  function drawZone(zone) {
    var cx  = zone.fx * W;
    var w   = zone.fw * W;
    var pad = Math.max(10, W * 0.016);

    rrect(cx - w * 0.5 - pad, pad * 1.4, w + pad * 2, H - pad * 2.8, 10);
    ctx.fillStyle = zone.color;
    ctx.fill();

    var fs = Math.max(7, W * 0.011);
    ctx.fillStyle = 'rgba(134,132,124,0.55)';
    ctx.font = fs + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// ' + zone.label, cx, pad * 1.4 + fs + 4);
  }

  function drawEdge(edge) {
    var p1  = px(NODES[edge.a]);
    var p2  = px(NODES[edge.b]);
    var cpt = cp(p1, p2, edge.c);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpt.x, cpt.y, p2.x, p2.y);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(0.8, W * 0.0014);
    ctx.stroke();

    var tip  = bezAt(p1, cpt, p2, 0.86);
    var base = bezAt(p1, cpt, p2, 0.80);
    var dx = tip.x - base.x, dy = tip.y - base.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    var nx = -uy, ny = ux;
    var as = Math.max(2.5, W * 0.005);

    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x - ux * as * 1.8 + nx * as, tip.y - uy * as * 1.8 + ny * as);
    ctx.lineTo(tip.x - ux * as * 1.8 - nx * as, tip.y - uy * as * 1.8 - ny * as);
    ctx.closePath();
    ctx.fillStyle = 'rgba(26,26,24,0.26)';
    ctx.fill();
  }

  function drawNode(n) {
    var p   = px(n);
    var r   = nodeR();
    var act = activation[n.id];

    if (act > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + r * 0.65 * act, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(26,26,24,' + (0.11 * act) + ')';
      ctx.lineWidth = Math.max(0.8, W * 0.0012);
      ctx.stroke();
      activation[n.id] = Math.max(0, act - 0.038);
    }

    // Soft halo
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + Math.max(3, W * 0.007), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239,237,230,0.62)';
    ctx.fill();

    // Node disc
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = 'rgba(26,26,24,0.20)';
    ctx.lineWidth = Math.max(0.8, W * 0.0012);
    ctx.stroke();

    // Primary label
    var fs = Math.max(8, r * 0.44);
    ctx.fillStyle = INK;
    ctx.font = '500 ' + fs + 'px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, p.x, p.y - fs * 0.44);

    // Mono sub-label
    var ms = Math.max(6, r * 0.30);
    ctx.fillStyle = MUTED;
    ctx.font = ms + 'px "JetBrains Mono", monospace';
    ctx.fillText(n.mono, p.x, p.y + fs * 0.68);
  }

  function drawPulse(pulse) {
    var edge = EDGES[pulse.edge];
    var p1   = px(NODES[edge.a]);
    var p2   = px(NODES[edge.b]);
    var cpt  = cp(p1, p2, edge.c);
    var pt   = bezAt(p1, cpt, p2, pulse.t);

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pulse.r, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    for (var g = 1; g <= 3; g++) {
      var gt = Math.max(0, pulse.t - g * 0.022);
      var gp = bezAt(p1, cpt, p2, gt);
      ctx.beginPath();
      ctx.arc(gp.x, gp.y, pulse.r * (1 - g * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26,26,24,' + (0.20 - g * 0.055) + ')';
      ctx.fill();
    }
  }

  // ── Main render loop ─────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    ZONES.forEach(drawZone);
    EDGES.forEach(drawEdge);

    for (var i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i];
      p.t += p.speed;

      if (p.t >= 1) {
        activation[EDGES[p.edge].b] = 1.0;
        var done = p.edge;
        pulses.splice(i, 1);
        (function (idx) {
          setTimeout(function () { spawnPulse(idx); }, 600 + Math.random() * 1600);
        }(done));
        continue;
      }

      drawPulse(p);
    }

    NODES.forEach(drawNode);
    raf = requestAnimationFrame(frame);
  }

  // ── Canvas popup (click to expand / Esc to close) ────────
  var container = canvas.parentElement;

  var closeBtn = document.createElement('button');
  closeBtn.className = 'hero--anim__close';
  closeBtn.setAttribute('aria-label', 'Close expanded view');
  closeBtn.innerHTML = '&times;';
  container.appendChild(closeBtn);

  var backdrop = document.createElement('div');
  backdrop.className = 'hero-anim-backdrop';
  document.body.appendChild(backdrop);

  function openPopup() {
    container.classList.add('hero--anim--expanded');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(resize, 10);
  }

  function closePopup() {
    container.classList.remove('hero--anim--expanded');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(resize, 10);
  }

  container.addEventListener('click', function (e) {
    if (e.target === closeBtn) return;
    if (!container.classList.contains('hero--anim--expanded')) openPopup();
  });
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closePopup();
  });
  backdrop.addEventListener('click', closePopup);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });

  // ── Boot ─────────────────────────────────────────────────
  resize();

  var rtimer;
  window.addEventListener('resize', function () {
    clearTimeout(rtimer);
    rtimer = setTimeout(resize, 100);
  });

  frame();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { frame(); }
  });

}());
