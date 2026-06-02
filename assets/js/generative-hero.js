(function () {
  'use strict';

  var canvas = document.getElementById('generative-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ─────────────────────────────────────────
  var BG           = '#F7F5F0';
  var SURFACE      = '#FFFFFF';
  var INK          = '#1A1A18';
  var MUTED        = '#86847C';
  var BORDER       = 'rgba(26,26,24,0.13)';
  var BORDER_ENG   = 'rgba(26,26,24,0.38)'; // engine node — slightly stronger border

  // ── Content-pipeline nodes ────────────────────────────────
  // Input (left) → AI Content Engine (centre) → Output (right)
  // fx/fy are fractional (0–1); resolved to pixels at draw time.
  var NODES = [
    // Inputs
    { id: 0, label: 'Brief',        mono: 'input',   fx: 0.10, fy: 0.26, tier: 'in'  },
    { id: 1, label: 'Product Data', mono: 'data',    fx: 0.10, fy: 0.50, tier: 'in'  },
    { id: 2, label: 'Brand Guide',  mono: 'style',   fx: 0.10, fy: 0.74, tier: 'in'  },
    // Engine (centre — larger)
    { id: 3, label: 'AI Content',   mono: 'engine',  fx: 0.50, fy: 0.50, tier: 'eng' },
    // Outputs
    { id: 4, label: 'Blog Post',    mono: 'content', fx: 0.90, fy: 0.22, tier: 'out' },
    { id: 5, label: 'Email',        mono: 'comms',   fx: 0.90, fy: 0.40, tier: 'out' },
    { id: 6, label: 'Proposal',     mono: 'sales',   fx: 0.90, fy: 0.60, tier: 'out' },
    { id: 7, label: 'Docs',         mono: 'kb',      fx: 0.90, fy: 0.78, tier: 'out' },
  ];

  // ── Directed edges — left-to-right only ──────────────────
  var EDGES = [
    // Inputs → Engine
    { a: 0, b: 3, c: -0.14 },
    { a: 1, b: 3, c:  0.00 },
    { a: 2, b: 3, c:  0.14 },
    // Engine → Outputs
    { a: 3, b: 4, c: -0.14 },
    { a: 3, b: 5, c: -0.05 },
    { a: 3, b: 6, c:  0.05 },
    { a: 3, b: 7, c:  0.14 },
  ];

  // ── Zone backdrops — drawn before edges ──────────────────
  var ZONES = [
    { label: 'INPUT',    fx: 0.10, fw: 0.18, color: 'rgba(26,26,24,0.028)' },
    { label: 'GENERATE', fx: 0.50, fw: 0.22, color: 'rgba(26,26,24,0.022)' },
    { label: 'OUTPUT',   fx: 0.90, fw: 0.18, color: 'rgba(26,26,24,0.028)' },
  ];

  var activation = NODES.map(function () { return 0; });
  var pulses = [];

  // ── Sizing — ALL W-relative, no hard-clamped px ───────────
  function nodeRadius(tier) {
    var base = Math.max(14, W * 0.046);
    if (tier === 'eng') return base * 1.55;
    return base * 0.86; // 'in' and 'out'
  }

  function px(node) { return { x: node.fx * W, y: node.fy * H }; }

  // Quadratic bezier control point (perpendicular offset)
  function cp(p1, p2, curve) {
    var mx = (p1.x + p2.x) * 0.5, my = (p1.y + p2.y) * 0.5;
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return { x: mx - curve * dy, y: my + curve * dx };
  }

  // Point on quadratic bezier at t
  function bezAt(p1, cpt, p2, t) {
    var mt = 1 - t;
    return {
      x: mt * mt * p1.x + 2 * mt * t * cpt.x + t * t * p2.x,
      y: mt * mt * p1.y + 2 * mt * t * cpt.y + t * t * p2.y,
    };
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function spawnPulse(edgeIdx) {
    if (pulses.length > 22) return;
    var dotR = Math.max(2, W * 0.011) + Math.random() * Math.max(1, W * 0.003);
    pulses.push({
      edge:  edgeIdx,
      t:     0,
      speed: 0.007 + Math.random() * 0.006,
      r:     dotR,
    });
  }

  // Stagger initial spawns across all edges
  EDGES.forEach(function (_, i) {
    setTimeout(function () { spawnPulse(i); }, i * 280 + Math.random() * 180);
  });

  // ── rrect — arcTo-based (no ctx.roundRect for compatibility) ─
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  function drawZone(zone) {
    var cx  = zone.fx * W;
    var w   = zone.fw * W;
    var pad = 18;

    rrect(cx - w * 0.5 - pad, pad * 1.5, w + pad * 2, H - pad * 3, 10);
    ctx.fillStyle = zone.color;
    ctx.fill();

    var fs = Math.max(8, W * 0.012);
    ctx.fillStyle = 'rgba(134,132,124,0.60)';
    ctx.font = fs + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// ' + zone.label, cx, pad * 1.5 + fs + 3);
  }

  function drawEdge(edge) {
    var p1  = px(NODES[edge.a]);
    var p2  = px(NODES[edge.b]);
    var cpt = cp(p1, p2, edge.c);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpt.x, cpt.y, p2.x, p2.y);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.0016);
    ctx.stroke();

    // Arrowhead at ~86% along the edge, before entering the target node
    var tip  = bezAt(p1, cpt, p2, 0.86);
    var base = bezAt(p1, cpt, p2, 0.80);
    var dx = tip.x - base.x, dy = tip.y - base.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    var nx = -uy, ny = ux;
    var as = 4;

    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x - ux * 7 + nx * as, tip.y - uy * 7 + ny * as);
    ctx.lineTo(tip.x - ux * 7 - nx * as, tip.y - uy * 7 - ny * as);
    ctx.closePath();
    ctx.fillStyle = 'rgba(26,26,24,0.28)';
    ctx.fill();
  }

  function drawNode(n) {
    var p   = px(n);
    var r   = nodeRadius(n.tier);
    var act = activation[n.id];

    // Activation ring — expands & fades on pulse arrival
    if (act > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 12 * act, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(26,26,24,' + (0.12 * act) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      activation[n.id] = Math.max(0, act - 0.04);
    }

    // Soft outer halo
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239,237,230,0.65)';
    ctx.fill();

    // Node disc
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = n.tier === 'eng' ? BORDER_ENG : 'rgba(26,26,24,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Primary label — scales with node radius, no hard cap
    var fs = Math.max(9, r * 0.42);
    ctx.fillStyle = INK;
    ctx.font = '500 ' + fs + 'px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, p.x, p.y - fs * 0.44);

    // Mono sub-label
    var ms = Math.max(7, r * 0.28);
    ctx.fillStyle = MUTED;
    ctx.font = ms + 'px "JetBrains Mono", monospace';
    ctx.fillText(n.mono, p.x, p.y + fs * 0.70);
  }

  function drawPulse(pulse) {
    var edge = EDGES[pulse.edge];
    var p1   = px(NODES[edge.a]);
    var p2   = px(NODES[edge.b]);
    var cpt  = cp(p1, p2, edge.c);
    var pt   = bezAt(p1, cpt, p2, pulse.t);

    // Leading dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pulse.r, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    // 3-ghost trailing dots
    for (var g = 1; g <= 3; g++) {
      var gt = Math.max(0, pulse.t - g * 0.025);
      var gp = bezAt(p1, cpt, p2, gt);
      ctx.beginPath();
      ctx.arc(gp.x, gp.y, pulse.r * (1 - g * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26,26,24,' + (0.22 - g * 0.06) + ')';
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
          setTimeout(function () { spawnPulse(idx); }, 400 + Math.random() * 1400);
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

  // ── Boot ──────────────────────────────────────────────────
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
