(function () {
  'use strict';

  var canvas = document.getElementById('prediction-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ─────────────────────────────────────────
  var BG      = '#F7F5F0';
  var INK     = '#1A1A18';
  var MUTED   = '#86847C';

  var NOW = 0.54;          // fraction of chart width where history ends
  var HCOUNT = 30;         // history sample count

  // Fixed noise so the history line is stable across frames
  var noise = [];
  (function () {
    for (var i = 0; i < HCOUNT; i++) noise.push((Math.random() - 0.5));
  }());

  // Underlying rising trend, in value-space 0..1 (1 = top of chart)
  function trend(nx) { return 0.40 + 0.26 * nx + 0.05 * Math.sin(nx * 5.6 + 0.6); }
  function histVal(i) {
    var nx = (i / (HCOUNT - 1)) * NOW;
    return trend(nx) + noise[i] * 0.07;
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function frame(now) {
    var t = (now || 0) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // chart frame
    var padL = Math.max(14, W * 0.05);
    var padR = Math.max(14, W * 0.05);
    var padT = Math.max(18, H * 0.12);
    var padB = Math.max(22, H * 0.14);
    var cx = padL, cy = padT;
    var cw = W - padL - padR;
    var ch = H - padT - padB;

    function X(nx) { return cx + nx * cw; }
    function Y(v)  { return cy + (1 - v) * ch; }

    // faint horizontal gridlines
    ctx.strokeStyle = 'rgba(26,26,24,0.06)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 3; g++) {
      var gy = cy + (ch / 3) * g;
      ctx.beginPath();
      ctx.moveTo(cx, gy);
      ctx.lineTo(cx + cw, gy);
      ctx.stroke();
    }

    var nowX = X(NOW);
    var lastV = histVal(HCOUNT - 1);

    // forecast median value (blends history offset into pure trend)
    function medVal(nx) {
      var base = trend(nx);
      var k = 1 - (nx - NOW) / (1 - NOW);     // 1 at now → 0 at right edge
      return base + (lastV - trend(NOW)) * k;
    }
    // half-width of the confidence cone, widening + gently breathing
    function spread(nx) {
      var d = (nx - NOW) / (1 - NOW);          // 0..1
      return (0.05 + 0.20 * d) * (1 + 0.10 * Math.sin(t * 1.1));
    }

    // ── confidence cone (filled band) ───────────────────────
    var STEPS = 40;
    ctx.beginPath();
    for (var s = 0; s <= STEPS; s++) {
      var nx = NOW + (1 - NOW) * (s / STEPS);
      var vy = Math.min(0.98, medVal(nx) + spread(nx));
      if (s === 0) ctx.moveTo(X(nx), Y(vy)); else ctx.lineTo(X(nx), Y(vy));
    }
    for (var s2 = STEPS; s2 >= 0; s2--) {
      var nx2 = NOW + (1 - NOW) * (s2 / STEPS);
      var vy2 = Math.max(0.02, medVal(nx2) - spread(nx2));
      ctx.lineTo(X(nx2), Y(vy2));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(26,26,24,0.06)';
    ctx.fill();

    // cone bounds (dashed)
    ctx.setLineDash([Math.max(3, W * 0.008), Math.max(3, W * 0.006)]);
    ctx.strokeStyle = 'rgba(26,26,24,0.22)';
    ctx.lineWidth = Math.max(1, W * 0.0012);
    [1, -1].forEach(function (sign) {
      ctx.beginPath();
      for (var s = 0; s <= STEPS; s++) {
        var nx = NOW + (1 - NOW) * (s / STEPS);
        var v = medVal(nx) + sign * spread(nx);
        v = Math.max(0.02, Math.min(0.98, v));
        if (s === 0) ctx.moveTo(X(nx), Y(v)); else ctx.lineTo(X(nx), Y(v));
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // ── history line ────────────────────────────────────────
    ctx.beginPath();
    for (var i = 0; i < HCOUNT; i++) {
      var hx = X((i / (HCOUNT - 1)) * NOW);
      var hy = Y(histVal(i));
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.4, W * 0.0024);
    ctx.lineJoin = 'round';
    ctx.stroke();

    // ── forecast median line (solid, lighter) ───────────────
    ctx.beginPath();
    for (var m = 0; m <= STEPS; m++) {
      var mnx = NOW + (1 - NOW) * (m / STEPS);
      var my = Y(medVal(mnx));
      if (m === 0) ctx.moveTo(X(mnx), my); else ctx.lineTo(X(mnx), my);
    }
    ctx.strokeStyle = 'rgba(26,26,24,0.50)';
    ctx.lineWidth = Math.max(1.2, W * 0.002);
    ctx.stroke();

    // ── 'now' divider ───────────────────────────────────────
    ctx.setLineDash([Math.max(2, W * 0.004), Math.max(2, W * 0.004)]);
    ctx.strokeStyle = 'rgba(26,26,24,0.30)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(nowX, cy - Math.max(4, H * 0.03));
    ctx.lineTo(nowX, cy + ch);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── travelling scan dot ─────────────────────────────────
    var p = (t * 0.12) % 1;
    var dotV = p <= NOW
      ? histVal(Math.round((p / NOW) * (HCOUNT - 1)))
      : medVal(p);
    var dx = X(p), dy = Y(dotV);
    if (p > NOW) {
      // band ticks in the forecast region
      var up = Y(Math.min(0.98, medVal(p) + spread(p)));
      var lo = Y(Math.max(0.02, medVal(p) - spread(p)));
      ctx.strokeStyle = 'rgba(26,26,24,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx, up);
      ctx.lineTo(dx, lo);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(dx, dy, Math.max(3, W * 0.008), 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dx, dy, Math.max(6, W * 0.016), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(26,26,24,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── labels ──────────────────────────────────────────────
    var fs = Math.max(8, W * 0.013);
    ctx.font = fs + 'px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(134,132,124,0.75)';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText('// history', cx, cy - Math.max(6, H * 0.04));
    ctx.textAlign = 'right';
    ctx.fillText('// forecast', cx + cw, cy - Math.max(6, H * 0.04));

    ctx.fillStyle = MUTED;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('now', nowX, cy + ch + Math.max(4, H * 0.02));

    // P90 / P10 markers at the right edge of the cone
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var rEdge = cx + cw;
    ctx.fillStyle = 'rgba(134,132,124,0.85)';
    ctx.fillText('P90', rEdge, Y(Math.min(0.98, medVal(1) + spread(1))) - fs);
    ctx.fillText('P10', rEdge, Y(Math.max(0.02, medVal(1) - spread(1))) + fs);

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
  closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closePopup(); });
  backdrop.addEventListener('click', closePopup);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });

  // ── Boot ─────────────────────────────────────────────────
  resize();

  var rtimer;
  window.addEventListener('resize', function () {
    clearTimeout(rtimer);
    rtimer = setTimeout(resize, 100);
  });

  frame(performance.now());

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { frame(performance.now()); }
  });

}());
