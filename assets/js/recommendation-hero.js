(function () {
  'use strict';

  var canvas = document.getElementById('recommendation-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ─────────────────────────────────────────
  var BG      = '#F7F5F0';
  var SURFACE = '#FFFFFF';
  var INK     = '#1A1A18';
  var MUTED   = '#86847C';
  var BORDER  = 'rgba(26,26,24,0.20)';

  // ── Candidate items being ranked for one user ─────────────
  // score eases toward target; targets drift to trigger live re-ranking.
  var ITEMS = [
    { label: 'Wireless Buds', sub: 'electronics', score: 0.62, target: 0.62, y: 0, init: false },
    { label: 'Running Shoes', sub: 'apparel',     score: 0.48, target: 0.48, y: 0, init: false },
    { label: 'Coffee Plan',   sub: 'grocery',     score: 0.74, target: 0.74, y: 0, init: false },
    { label: 'Smart Watch',   sub: 'electronics', score: 0.55, target: 0.55, y: 0, init: false },
    { label: 'Yoga Mat',      sub: 'fitness',      score: 0.41, target: 0.41, y: 0, init: false },
  ];

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
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

  // ── Periodically nudge targets so the ranking reshuffles ──
  function retarget() {
    ITEMS.forEach(function (it) {
      it.target = Math.max(0.20, Math.min(0.96, it.target + (Math.random() - 0.46) * 0.24));
    });
    setTimeout(retarget, 1800 + Math.random() * 1400);
  }
  setTimeout(retarget, 1200);

  function drawUser(ux, uy, ur) {
    // soft halo
    ctx.beginPath();
    ctx.arc(ux, uy, ur + Math.max(3, W * 0.006), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239,237,230,0.62)';
    ctx.fill();
    // disc
    ctx.beginPath();
    ctx.arc(ux, uy, ur, 0, Math.PI * 2);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.0014);
    ctx.stroke();

    // person glyph: head + shoulders
    ctx.fillStyle = INK;
    var hr = ur * 0.24;
    ctx.beginPath();
    ctx.arc(ux, uy - ur * 0.22, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ux, uy + ur * 0.52, ur * 0.46, Math.PI * 1.08, Math.PI * 1.92, false);
    ctx.closePath();
    ctx.fill();

    // mono caption
    var fs = Math.max(7, ur * 0.22);
    ctx.fillStyle = MUTED;
    ctx.font = fs + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('// for you', ux, uy + ur + Math.max(6, W * 0.01));
  }

  function drawCard(it, rank, x, w, cardH) {
    var isTop = rank === 0;
    var r = Math.max(7, cardH * 0.16);

    rrect(x, it.y, w, cardH, r);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.strokeStyle = isTop ? 'rgba(26,26,24,0.42)' : 'rgba(26,26,24,0.16)';
    ctx.lineWidth = isTop ? Math.max(1.4, W * 0.0022) : Math.max(0.9, W * 0.0013);
    ctx.stroke();

    var ip   = Math.max(8, cardH * 0.16);
    var midY = it.y + cardH * 0.5;

    // rank number
    var rnf = Math.max(10, cardH * 0.34);
    ctx.fillStyle = isTop ? INK : MUTED;
    ctx.font = rnf + 'px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var rankStr = '0' + (rank + 1);
    ctx.fillText(rankStr, x + ip, midY);
    var rankW = ctx.measureText(rankStr).width + ip * 0.9;

    // label + sub
    var lx = x + ip + rankW;
    var lf = Math.max(9, cardH * 0.26);
    ctx.fillStyle = INK;
    ctx.font = '500 ' + lf + 'px "Inter", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(it.label, lx, it.y + cardH * 0.42);

    var sf = Math.max(7, cardH * 0.17);
    ctx.fillStyle = MUTED;
    ctx.font = sf + 'px "JetBrains Mono", monospace';
    ctx.fillText(it.sub, lx, it.y + cardH * 0.42 + sf + Math.max(2, cardH * 0.06));

    // percentage (right)
    var pf = Math.max(9, cardH * 0.26);
    var pct = Math.round(it.score * 100) + '%';
    ctx.fillStyle = INK;
    ctx.font = '500 ' + pf + 'px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var pctX = x + w - ip;
    ctx.fillText(pct, pctX, midY);
    var pctW = ctx.measureText('100%').width + ip * 0.7;

    // score bar (bottom)
    var barX = lx;
    var barW = (pctX - pctW) - barX;
    if (barW > 10) {
      var barY = it.y + cardH * 0.72;
      var barH = Math.max(3, cardH * 0.11);
      rrect(barX, barY, barW, barH, barH * 0.5);
      ctx.fillStyle = 'rgba(26,26,24,0.08)';
      ctx.fill();
      rrect(barX, barY, Math.max(barH, barW * it.score), barH, barH * 0.5);
      ctx.fillStyle = isTop ? INK : 'rgba(26,26,24,0.55)';
      ctx.fill();
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // ease scores toward targets
    ITEMS.forEach(function (it) { it.score += (it.target - it.score) * 0.045; });

    // ranking order (descending score)
    var order = ITEMS.slice().sort(function (a, b) { return b.score - a.score; });

    // layout
    var pad   = Math.max(10, H * 0.07);
    var n     = ITEMS.length;
    var gap   = Math.max(6, H * 0.022);
    var listX = W * 0.40;
    var listW = W * 0.52;
    var cardH = (H - pad * 2 - gap * (n - 1)) / n;

    // assign each item a target slot by rank; ease its y toward it
    order.forEach(function (it, rank) {
      var ty = pad + rank * (cardH + gap);
      if (!it.init) { it.y = ty; it.init = true; }
      it.y += (ty - it.y) * 0.12;
    });

    // connector: user → current top card
    var ux = W * 0.15, uy = H * 0.5, ur = Math.max(20, W * 0.052);
    var top = order[0];
    var topCY = top.y + cardH * 0.5;
    var cpx = (ux + ur + listX) * 0.5;
    ctx.beginPath();
    ctx.moveTo(ux + ur, uy);
    ctx.bezierCurveTo(cpx, uy, cpx, topCY, listX, topCY);
    ctx.strokeStyle = 'rgba(26,26,24,0.24)';
    ctx.lineWidth = Math.max(1, W * 0.0017);
    ctx.stroke();

    // cards (draw in fixed item order so z-order is stable during reorder)
    var ranks = {};
    order.forEach(function (it, rank) { ranks[it.label] = rank; });
    ITEMS.forEach(function (it) { drawCard(it, ranks[it.label], listX, listW, cardH); });

    drawUser(ux, uy, ur);

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

  frame();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { frame(); }
  });

}());
