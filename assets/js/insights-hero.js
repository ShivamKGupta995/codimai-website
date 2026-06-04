(function () {
  'use strict';

  var canvas = document.getElementById('insights-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  // ── Brand palette ─────────────────────────────────────────
  var BG    = '#F7F5F0';
  var INK   = '#1A1A18';
  var MUTED = '#86847C';

  var SAMPLES = 46;   // points held per metric row
  var STEP    = 5;    // advance the series every Nth frame (slow scroll)

  // ── Metric rows — each a live, scrolling time series ──────
  var ROWS = [
    { name: 'Revenue', mono: 'trend ↑',  base: 0.52, amp: 0.10, freq: 1.7, phase: 0.0, vals: [], anom: [], spike: 0 },
    { name: 'Churn',   mono: 'watch',    base: 0.46, amp: 0.07, freq: 2.3, phase: 1.4, vals: [], anom: [], spike: 0 },
    { name: 'Usage',   mono: 'baseline', base: 0.55, amp: 0.09, freq: 1.3, phase: 3.0, vals: [], anom: [], spike: 0 },
    { name: 'Latency', mono: 'p95 ms',   base: 0.44, amp: 0.06, freq: 2.9, phase: 0.7, vals: [], anom: [], spike: 0 },
  ];

  var tick = 0;     // sample counter (advances the series)
  var frame_n = 0;  // raw frame counter

  // seed each row with a baseline history
  ROWS.forEach(function (row) {
    for (var i = 0; i < SAMPLES; i++) {
      row.vals.push(baseValue(row, i));
      row.anom.push(false);
    }
  });

  function baseValue(row, k) {
    return row.base + row.amp * Math.sin(k * 0.45 * row.freq + row.phase);
  }

  function nextValue(row) {
    var v = baseValue(row, tick) + (Math.random() - 0.5) * 0.04;
    var isAnom = false;
    if (row.spike > 0) {
      v = row.base + row.spikeDir * (0.28 + Math.random() * 0.08);
      isAnom = true;
      row.spike--;
    } else if (Math.random() < 0.018) {
      row.spike = 0;                       // single-sample spike
      row.spikeDir = Math.random() < 0.5 ? 1 : -1;
      v = row.base + row.spikeDir * (0.30 + Math.random() * 0.08);
      isAnom = true;
    }
    return { v: Math.max(0.05, Math.min(0.95, v)), anom: isAnom };
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function mean(arr) {
    var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }
  function std(arr, m) {
    var s = 0; for (var i = 0; i < arr.length; i++) { var d = arr[i] - m; s += d * d; }
    return Math.sqrt(s / arr.length);
  }

  function drawRow(row, idx, rowTop, rowH) {
    var labelW = W * 0.26;
    var chartX = W * 0.30;
    var chartW = W * 0.66;
    var insetY = rowH * 0.20;
    var innerH = rowH - insetY * 2;
    var topY   = rowTop + insetY;

    function X(i) { return chartX + (i / (SAMPLES - 1)) * chartW; }
    function Y(v) { return topY + (1 - v) * innerH; }

    // baseline band (mean ± std of non-anomalous samples)
    var clean = [];
    for (var i = 0; i < row.vals.length; i++) if (!row.anom[i]) clean.push(row.vals[i]);
    var m = mean(clean.length ? clean : row.vals);
    var sd = std(clean.length ? clean : row.vals, m);
    var bandT = Y(m + sd * 1.6);
    var bandB = Y(m - sd * 1.6);
    ctx.fillStyle = 'rgba(26,26,24,0.05)';
    ctx.fillRect(chartX, bandT, chartW, bandB - bandT);
    // baseline mid line (dashed)
    ctx.setLineDash([Math.max(2, W * 0.004), Math.max(2, W * 0.004)]);
    ctx.strokeStyle = 'rgba(26,26,24,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartX, Y(m)); ctx.lineTo(chartX + chartW, Y(m)); ctx.stroke();
    ctx.setLineDash([]);

    // metric line
    ctx.beginPath();
    for (var j = 0; j < row.vals.length; j++) {
      var x = X(j), y = Y(row.vals[j]);
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(26,26,24,0.78)';
    ctx.lineWidth = Math.max(1.2, W * 0.0019);
    ctx.lineJoin = 'round';
    ctx.stroke();

    // anomaly markers
    for (var a = 0; a < row.anom.length; a++) {
      if (!row.anom[a]) continue;
      var ax = X(a), ay = Y(row.vals[a]);
      ctx.beginPath();
      ctx.arc(ax, ay, Math.max(4, W * 0.011), 0, Math.PI * 2);
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.2, W * 0.0018);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, Math.max(1.6, W * 0.004), 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
      // tag the freshest anomaly (near the right edge)
      if (a >= SAMPLES - 4) {
        var fs = Math.max(7, W * 0.011);
        ctx.font = fs + 'px "JetBrains Mono", monospace';
        ctx.fillStyle = MUTED;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('// anomaly', ax - Math.max(6, W * 0.012), ay - Math.max(6, W * 0.012));
      }
    }

    // last-value dot
    var lx = X(SAMPLES - 1), ly = Y(row.vals[SAMPLES - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(2, W * 0.005), 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    // label block
    var nameF = Math.max(11, rowH * 0.26);
    ctx.fillStyle = INK;
    ctx.font = '500 ' + nameF + 'px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(row.name, W * 0.05, rowTop + rowH * 0.46);

    var monoF = Math.max(8, rowH * 0.17);
    ctx.fillStyle = MUTED;
    ctx.font = monoF + 'px "JetBrains Mono", monospace';
    ctx.fillText('// ' + row.mono, W * 0.05, rowTop + rowH * 0.46 + monoF + Math.max(3, rowH * 0.07));

    // row separator
    if (idx > 0) {
      ctx.strokeStyle = 'rgba(26,26,24,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.05, rowTop); ctx.lineTo(W * 0.96, rowTop); ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // advance the series at STEP cadence
    frame_n++;
    if (frame_n % STEP === 0) {
      tick++;
      ROWS.forEach(function (row) {
        var nx = nextValue(row);
        row.vals.shift(); row.vals.push(nx.v);
        row.anom.shift(); row.anom.push(nx.anom);
      });
    }

    var pad  = Math.max(8, H * 0.05);
    var n    = ROWS.length;
    var rowH = (H - pad * 2) / n;
    ROWS.forEach(function (row, i) { drawRow(row, i, pad + i * rowH, rowH); });

    raf = requestAnimationFrame(render);
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

  render();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { render(); }
  });

}());
