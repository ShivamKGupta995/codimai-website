(function () {
  'use strict';

  var canvas = document.getElementById('whatsapp-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Palette (mirrors tokens; WhatsApp-green accent) ──────
  var BG        = '#F7F5F0';
  var INK       = '#1A1A18';
  var MUTED     = '#86847C';
  var SURFACE   = '#FFFFFF';
  var GRID      = 'rgba(26,26,24,0.06)';
  var SOFTLINE  = 'rgba(26,26,24,0.10)';
  var GREEN     = '#1FA855';
  var GREEN_TOP = 'rgba(37,211,102,0.22)';
  var GREEN_BOT = 'rgba(37,211,102,0.00)';
  var BORDER    = 'rgba(26,26,24,0.14)';

  // ── Business data: conversations / month ─────────────────
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  var VALS   = [320, 470, 610, 880, 1050, 1240];
  var VMAX   = 1400;
  var TICKS  = [0, 350, 700, 1050, 1400];

  // Bubbles anchored to climbing points (legible text + ticks)
  var MARKERS = [
    { idx: 1, text: 'New order',  scale: 0 },
    { idx: 3, text: 'Booking',    scale: 0 }
  ];

  var DUR = 5.4, HOLD = 1.4;
  var t = 0, holding = 0, last = 0;

  // ── Plot geometry (fills the container) ──────────────────
  function plot() {
    return {
      L: W * 0.13,   // left (room for y labels)
      R: W * 0.965,
      T: H * 0.17,
      B: H * 0.78    // x axis baseline
    };
  }
  function xAt(i, pg) { return pg.L + (pg.R - pg.L) * (i / (VALS.length - 1)); }
  function yAt(v, pg) { return pg.B - (pg.B - pg.T) * (v / VMAX); }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function easeInOut(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function fmt(v) { return v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : '' + v; }

  // Catmull-Rom sampled polyline through the data points
  function buildCurve() {
    var pg = plot();
    var pts = VALS.map(function (v, i) { return { x: xAt(i, pg), y: yAt(v, pg) }; });
    var out = [], seg = 24;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (var s = 0; s < seg; s++) {
        var u = s / seg, u2 = u * u, u3 = u2 * u;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3)
        });
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  // ── Axes: gridlines, y-value ticks, month labels ─────────
  function drawAxes(pg) {
    var yfs = Math.max(8, W * 0.0145);
    ctx.font = yfs + 'px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    TICKS.forEach(function (v) {
      var y = yAt(v, pg);
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pg.L, y);
      ctx.lineTo(pg.R, y);
      ctx.stroke();
      ctx.fillStyle = MUTED;
      ctx.textAlign = 'right';
      ctx.fillText(fmt(v), pg.L - W * 0.015, y);
    });

    // month labels
    var xfs = Math.max(8, W * 0.0145);
    ctx.font = xfs + 'px "JetBrains Mono", monospace';
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    MONTHS.forEach(function (m, i) {
      ctx.fillText(m, xAt(i, pg), pg.B + H * 0.03);
    });

    // eyebrow
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.014) + 'px "JetBrains Mono", monospace';
    ctx.fillText('// CONVERSATIONS / MONTH', pg.L, pg.T - H * 0.06);
  }

  // ── Growth area + line, progressively revealed ───────────
  function drawCurve(curve, headX, pg) {
    // soft full line
    ctx.beginPath();
    ctx.moveTo(curve[0].x, curve[0].y);
    for (var i = 1; i < curve.length; i++) ctx.lineTo(curve[i].x, curve[i].y);
    ctx.strokeStyle = SOFTLINE;
    ctx.lineWidth = Math.max(1, W * 0.0016);
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, headX, H);
    ctx.clip();

    var grad = ctx.createLinearGradient(0, pg.T, 0, pg.B);
    grad.addColorStop(0, GREEN_TOP);
    grad.addColorStop(1, GREEN_BOT);
    ctx.beginPath();
    ctx.moveTo(curve[0].x, pg.B);
    for (var j = 0; j < curve.length; j++) ctx.lineTo(curve[j].x, curve[j].y);
    ctx.lineTo(curve[curve.length - 1].x, pg.B);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(curve[0].x, curve[0].y);
    for (var k = 1; k < curve.length; k++) ctx.lineTo(curve[k].x, curve[k].y);
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = Math.max(1.8, W * 0.0030);
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // ── Legible WhatsApp message bubble ──────────────────────
  function drawBubble(cx, anchorY, scale, text) {
    if (scale <= 0.01) return;
    var bh = Math.max(30, W * 0.072);
    var fs = bh * 0.40;
    ctx.font = '500 ' + fs + 'px "Inter", system-ui, sans-serif';
    var tw = ctx.measureText(text).width;
    var tickW = fs * 1.5;
    var padX = bh * 0.34;
    var bw = padX * 2 + tw + tickW;
    var bx = cx - bw * 0.5;
    var by = anchorY - bh - Math.max(12, W * 0.03);

    ctx.save();
    ctx.translate(cx, by + bh);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -(by + bh));

    rrect(bx, by, bw, bh, Math.max(6, bh * 0.22));
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    // tail
    ctx.beginPath();
    ctx.moveTo(cx - bh * 0.16, by + bh - 1);
    ctx.lineTo(cx, by + bh + bh * 0.26);
    ctx.lineTo(cx + bh * 0.06, by + bh - 1);
    ctx.closePath();
    ctx.fillStyle = SURFACE;
    ctx.fill();

    // text
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '500 ' + fs + 'px "Inter", system-ui, sans-serif';
    ctx.fillText(text, bx + padX, by + bh * 0.5);

    // green double-tick
    var tx = bx + padX + tw + fs * 0.45;
    var ty = by + bh * 0.56;
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = Math.max(1, fs * 0.13);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);                 ctx.lineTo(tx + fs * 0.28, ty + fs * 0.30);
    ctx.lineTo(tx + fs * 0.78, ty - fs * 0.34);
    ctx.moveTo(tx + fs * 0.30, ty);     ctx.lineTo(tx + fs * 0.44, ty + fs * 0.18);
    ctx.lineTo(tx + fs * 0.94, ty - fs * 0.34);
    ctx.stroke();

    ctx.restore();
  }

  // ── Value callout that rides the line head ───────────────
  function drawCallout(hx, hy, val, pct) {
    var label = val.toLocaleString();
    var fs = Math.max(15, W * 0.046);
    ctx.font = '600 ' + fs + 'px "Inter", system-ui, sans-serif';
    var tw = ctx.measureText(label).width;
    var afs = fs * 0.5;
    var padX = fs * 0.5;
    var bw = padX * 2 + tw + afs * 3.2;
    var bh = fs * 1.7;
    var bx = hx - bw - W * 0.02;
    var by = hy - bh - H * 0.02;
    if (bx < plot().L) bx = hx + W * 0.02;        // flip if off-screen left
    if (by < 2) by = hy + H * 0.02;

    rrect(bx, by, bw, bh, Math.max(7, fs * 0.32));
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '600 ' + fs + 'px "Inter", system-ui, sans-serif';
    ctx.fillText(label, bx + padX, by + bh * 0.5);

    // green ▲ pct
    var ax = bx + padX + tw + afs * 0.8;
    var ay = by + bh * 0.5;
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.moveTo(ax, ay + afs * 0.4);
    ctx.lineTo(ax + afs * 0.5, ay - afs * 0.5);
    ctx.lineTo(ax + afs, ay + afs * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.font = '600 ' + afs + 'px "Inter", system-ui, sans-serif';
    ctx.fillText(pct + '%', ax + afs * 1.25, ay + afs * 0.05);
  }

  // ── Render ───────────────────────────────────────────────
  function render(progress) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var pg = plot();
    drawAxes(pg);

    var curve = buildCurve();
    var drawP = easeInOut(progress);
    var headIdx = Math.floor(Math.min(0.999, drawP) * (curve.length - 1));
    var head = curve[headIdx];
    var headX = head.x;

    drawCurve(curve, headX, pg);

    // data dots already reached
    VALS.forEach(function (v, i) {
      var dx = xAt(i, pg), dy = yAt(v, pg);
      if (dx <= headX + 1) {
        ctx.beginPath();
        ctx.arc(dx, dy, Math.max(2.6, W * 0.0058), 0, Math.PI * 2);
        ctx.fillStyle = GREEN;
        ctx.fill();
        ctx.strokeStyle = SURFACE;
        ctx.lineWidth = Math.max(1, W * 0.0022);
        ctx.stroke();
      }
    });

    // climbing bubbles
    MARKERS.forEach(function (m) {
      var dx = xAt(m.idx, pg), dy = yAt(VALS[m.idx], pg);
      var want = (dx <= headX) ? 1 : 0;
      m.scale += (want - m.scale) * 0.12;
      drawBubble(dx, dy, m.scale, m.text);
    });

    // glowing head dot
    if (progress > 0.001 && progress < 0.999) {
      ctx.beginPath();
      ctx.arc(head.x, head.y, Math.max(8, W * 0.022), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37,211,102,0.18)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head.x, head.y, Math.max(3.2, W * 0.0085), 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      ctx.strokeStyle = SURFACE;
      ctx.lineWidth = Math.max(1, W * 0.0022);
      ctx.stroke();
    }

    // value callout (rides the head)
    var fpos = drawP * (VALS.length - 1);
    var fi = Math.min(VALS.length - 2, Math.floor(fpos));
    var ff = fpos - fi;
    var curVal = Math.round(VALS[fi] + (VALS[fi + 1] - VALS[fi]) * ff);
    var pct = Math.round((curVal / VALS[0] - 1) * 100);
    drawCallout(head.x, head.y, curVal, pct);
  }

  function frame(now) {
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;

    if (t < 1) {
      t = Math.min(1, t + dt / DUR);
    } else {
      holding += dt;
      if (holding >= HOLD) {
        t = 0; holding = 0;
        MARKERS.forEach(function (m) { m.scale = 0; });
      }
    }

    render(t);
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

  if (reduceMotion) {
    t = 1;
    MARKERS.forEach(function (m) { m.scale = 1; });
    render(1);
    return;
  }

  raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    } else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  });

}());
