(function () {
  'use strict';

  var canvas = document.getElementById('agentic-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ────────────────────────────────────────
  var BG      = '#F7F5F0';
  var SURFACE = '#FFFFFF';
  var SOFT    = '#EFEDE6';
  var INK     = '#1A1A18';
  var MUTED   = '#86847C';
  var BORDER  = 'rgba(26,26,24,0.13)';

  // ── Agent architecture nodes ─────────────────────────────
  // Mirrors the multi-modal agent diagram:
  //  Input → Perception [Vision / Language / Audio / Sensors]
  //        → Cognition  [Planner / Memory / Knowledge]
  //        → Decision   [Executor / Verifier]
  //        → Output
  //
  // fx/fy are fractional (0-1); resolved to pixels at draw time.
  var NODES = [
    // Input
    { id: 0,  label: 'Intent',    mono: 'input',    fx: 0.05, fy: 0.50, tier: 'io'  },
    // Perception
    { id: 1,  label: 'Vision',    mono: 'camera',   fx: 0.25, fy: 0.18, tier: 'perc' },
    { id: 2,  label: 'Language',  mono: 'text',     fx: 0.25, fy: 0.40, tier: 'perc' },
    { id: 3,  label: 'Audio',     mono: 'speech',   fx: 0.25, fy: 0.62, tier: 'perc' },
    { id: 4,  label: 'Sensors',   mono: 'data',     fx: 0.25, fy: 0.84, tier: 'perc' },
    // Cognition
    { id: 5,  label: 'Planner',   mono: 'strategy', fx: 0.52, fy: 0.24, tier: 'cog'  },
    { id: 6,  label: 'Memory',    mono: 'context',  fx: 0.52, fy: 0.50, tier: 'cog'  },
    { id: 7,  label: 'Knowledge', mono: 'base',     fx: 0.52, fy: 0.76, tier: 'cog'  },
    // Decision
    { id: 8,  label: 'Executor',  mono: 'act',      fx: 0.76, fy: 0.34, tier: 'dec'  },
    { id: 9,  label: 'Verifier',  mono: 'verify',   fx: 0.76, fy: 0.66, tier: 'dec'  },
    // Output
    { id: 10, label: 'Output',    mono: 'result',   fx: 0.95, fy: 0.50, tier: 'io'  },
  ];

  // ── Directed edges [from-id, to-id, curve-strength] ──────
  var EDGES = [
    // Input → perception
    { a: 0, b: 1, c: -0.22 },
    { a: 0, b: 2, c: -0.08 },
    { a: 0, b: 3, c:  0.08 },
    { a: 0, b: 4, c:  0.22 },
    // Perception → cognition
    { a: 1, b: 5, c: -0.08 },
    { a: 2, b: 5, c: -0.10 },
    { a: 2, b: 6, c:  0.00 },
    { a: 3, b: 6, c:  0.00 },
    { a: 4, b: 7, c:  0.08 },
    { a: 3, b: 7, c:  0.10 },
    // Cognition internal
    { a: 5, b: 6, c:  0.22 },
    { a: 7, b: 6, c: -0.22 },
    // Cognition → decision
    { a: 5, b: 8, c: -0.10 },
    { a: 6, b: 8, c: -0.05 },
    { a: 6, b: 9, c:  0.05 },
    { a: 7, b: 9, c:  0.10 },
    // Decision → output
    { a: 8, b: 10, c: -0.14 },
    { a: 9, b: 10, c:  0.14 },
    // Feedback: verifier → planner (closes the loop)
    { a: 9, b: 5, c: -0.42 },
  ];

  // ── Section zone definitions (drawn as backdrop strips) ───
  var ZONES = [
    { label: 'PERCEPTION', fx: 0.17, fw: 0.16, color: 'rgba(26,26,24,0.030)' },
    { label: 'COGNITION',  fx: 0.43, fw: 0.18, color: 'rgba(26,26,24,0.025)' },
    { label: 'DECISION',   fx: 0.67, fw: 0.16, color: 'rgba(26,26,24,0.020)' },
  ];

  // ── Per-node activation ring state ───────────────────────
  var activation = NODES.map(function () { return 0; });

  // ── Live pulses ──────────────────────────────────────────
  var pulses = [];

  // ── Helpers ──────────────────────────────────────────────
  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function px(node) { return { x: node.fx * W, y: node.fy * H }; }

  function nodeRadius(tier) {
    // Scale freely with canvas width  no hard upper cap so expanded view looks good
    var base = Math.max(14, W * 0.046);
    if (tier === 'io')   return base * 1.10;
    if (tier === 'cog')  return base * 1.00;
    if (tier === 'perc') return base * 0.80;
    if (tier === 'dec')  return base * 0.90;
    return base;
  }

  // Quadratic bezier control point (perpendicular offset)
  function cp(p1, p2, curve) {
    var mx = (p1.x + p2.x) * 0.5, my = (p1.y + p2.y) * 0.5;
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return { x: mx - curve * dy, y: my + curve * dx };
  }

  // Point on quadratic bezier
  function bezAt(p1, cpt, p2, t) {
    var mt = 1 - t;
    return {
      x: mt * mt * p1.x + 2 * mt * t * cpt.x + t * t * p2.x,
      y: mt * mt * p1.y + 2 * mt * t * cpt.y + t * t * p2.y,
    };
  }

  // ── Spawn a pulse on edge i ───────────────────────────────
  function spawnPulse(edgeIdx) {
    if (pulses.length > 32) return;
    // Pulse dot size scales with canvas  bigger in expanded view
    var dotR = Math.max(2, W * 0.004) + Math.random() * Math.max(1, W * 0.002);
    pulses.push({
      edge:  edgeIdx,
      t:     0,
      speed: 0.006 + Math.random() * 0.005,
      r:     dotR,
    });
  }

  // Staggered initial spawn
  EDGES.forEach(function (_, i) {
    setTimeout(function () { spawnPulse(i); }, i * 260 + Math.random() * 180);
  });

  // ── Draw section zone backdrop ────────────────────────────
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

    // Section label  scales with canvas
    var fs = Math.max(8, W * 0.012);
    ctx.fillStyle = 'rgba(134,132,124,0.60)';
    ctx.font = fs + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// ' + zone.label, cx, pad * 1.5 + fs + 3);
  }

  // ── Draw an edge ─────────────────────────────────────────
  function drawEdge(edge) {
    var p1  = px(NODES[edge.a]);
    var p2  = px(NODES[edge.b]);
    var cpt = cp(p1, p2, edge.c);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpt.x, cpt.y, p2.x, p2.y);
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.0018); // scales up in expanded view
    ctx.stroke();

    // Arrowhead (at ~88% along the curve, before entering the node)
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
    ctx.fillStyle = 'rgba(26,26,24,0.18)';
    ctx.fill();
  }

  // ── Draw a node ──────────────────────────────────────────
  function drawNode(n) {
    var p   = px(n);
    var r   = nodeRadius(n.tier);
    var act = activation[n.id];

    // Activation ring (expands & fades when a pulse arrives)
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

    // Node fill
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = 'rgba(26,26,24,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Primary label  scale with node radius (no hard cap so it grows in expanded view)
    var fs = Math.max(9, r * 0.44);
    ctx.fillStyle = INK;
    ctx.font = '500 ' + fs + 'px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, p.x, p.y - fs * 0.46);

    // Mono sub-label
    var ms = Math.max(7, r * 0.30);
    ctx.fillStyle = MUTED;
    ctx.font = ms + 'px "JetBrains Mono", monospace';
    ctx.fillText(n.mono, p.x, p.y + fs * 0.72);
  }

  // ── Draw a travelling pulse ──────────────────────────────
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

    // Short trail (3 ghost dots behind the pulse)
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

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Section zone backdrops
    ZONES.forEach(drawZone);

    // Edges
    EDGES.forEach(drawEdge);

    // Update and draw pulses
    for (var i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i];
      p.t += p.speed;

      if (p.t >= 1) {
        // Ping the destination node
        activation[EDGES[p.edge].b] = 1.0;
        var done = p.edge;
        pulses.splice(i, 1);
        // Respawn same edge after a random interval
        (function (idx) {
          setTimeout(function () { spawnPulse(idx); }, 500 + Math.random() * 1600);
        }(done));
        continue;
      }

      drawPulse(p);
    }

    // Nodes on top
    NODES.forEach(drawNode);

    raf = requestAnimationFrame(frame);
  }

  // ── Canvas popup (click to expand / Esc to close) ────────
  var container = canvas.parentElement;

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.className = 'hero--anim__close';
  closeBtn.setAttribute('aria-label', 'Close expanded view');
  closeBtn.innerHTML = '&times;';
  container.appendChild(closeBtn);

  // Backdrop
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
