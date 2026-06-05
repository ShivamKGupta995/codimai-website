(function () {
  'use strict';

  var canvas = document.getElementById('blogs-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var BG      = '#F7F5F0';
  var INK     = '#1A1A18';
  var MUTED   = '#86847C';
  var SURF    = '#FFFFFF';
  var ACCENT  = '#4A6741';
  var ACCENT2 = 'rgba(74,103,65,0.14)';
  var ACCENT3 = 'rgba(74,103,65,0.32)';
  var BORDER  = 'rgba(26,26,24,0.11)';
  var FAINT   = 'rgba(26,26,24,0.055)';

  var PHASE_DUR = 6.5, HOLD = 1.6;
  var t = 0, holding = 0, last = 0;

  var keywords = [
    { label: 'AI automation',  vol: '8.2K', weight: 1.00 },
    { label: 'business AI',    vol: '7.1K', weight: 0.92 },
    { label: 'local SEO tips', vol: '5.4K', weight: 0.78 },
    { label: 'chatbot tools',  vol: '3.8K', weight: 0.62 }
  ];

  var BLOG_TITLE = 'How AI Automation Drives Business Growth';

  var docStructure = [
    { type: 'h1',  w: 0.88 },
    { type: 'p',   w: 0.70 },
    { type: 'p',   w: 0.55 },
    { type: 'h2',  w: 0.64 },
    { type: 'p',   w: 0.72 },
    { type: 'p',   w: 0.48 },
    { type: 'h2',  w: 0.58 },
    { type: 'p',   w: 0.66 },
    { type: 'h2',  w: 0.52 },
    { type: 'p',   w: 0.60 }
  ];

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function ease(x) { return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2; }

  // ── Panel 1: Keyword research list ───────────────────────
  function drawKeywordPanel(progress) {
    if (progress <= 0) return;

    var panelX = W * 0.03;
    var panelW = W * 0.32;
    var topY   = H * 0.10;
    var pad    = Math.max(7, W * 0.015);
    var rowH   = Math.max(28, H * 0.135);
    var gap    = Math.max(4,  H * 0.016);

    // Section label
    var labOp = Math.min(1, progress * 5);
    ctx.globalAlpha = labOp;
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.013) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('// Target Keywords', panelX, topY - Math.max(9, H * 0.030));
    ctx.globalAlpha = 1;

    keywords.forEach(function (kw, i) {
      var rowProg = Math.min(1, Math.max(0, progress * keywords.length * 1.1 - i * 0.85));
      if (rowProg <= 0) return;
      var op = Math.min(1, rowProg * 2.5);
      ctx.globalAlpha = op;

      var ry = topY + i * (rowH + gap);

      // Row card
      ctx.fillStyle = rowProg > 0.5 ? ACCENT2 : FAINT;
      ctx.strokeStyle = rowProg > 0.5 ? ACCENT3 : BORDER;
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.beginPath();
      ctx.roundRect(panelX, ry, panelW, rowH, Math.max(4, W * 0.006));
      ctx.fill();
      ctx.stroke();

      // Keyword label
      var fs = Math.max(9, W * 0.016);
      ctx.fillStyle = INK;
      ctx.font = 'bold ' + fs + 'px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(kw.label, panelX + pad, ry + rowH * 0.36);

      // Volume bar
      var barX  = panelX + pad;
      var barY  = ry + rowH * 0.62;
      var barMaxW = panelW - pad * 2 - Math.max(22, W * 0.045);
      var barH2  = Math.max(3, H * 0.014);
      var barFill = barMaxW * kw.weight * ease(Math.min(1, rowProg * 1.6));

      ctx.fillStyle = FAINT;
      ctx.beginPath();
      ctx.roundRect(barX, barY - barH2 / 2, barMaxW, barH2, barH2 / 2);
      ctx.fill();

      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.roundRect(barX, barY - barH2 / 2, barFill, barH2, barH2 / 2);
      ctx.fill();

      // Volume number
      ctx.fillStyle = ACCENT;
      ctx.font = Math.max(8, W * 0.013) + 'px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(kw.vol + '/mo', panelX + panelW - pad * 0.5, ry + rowH * 0.62);

      ctx.globalAlpha = 1;
    });
  }

  // ── Center: AI writer node ────────────────────────────────
  function drawAINode(cx, cy, rawT, progress) {
    if (progress <= 0) return;
    var r  = Math.max(22, W * 0.040);
    var op = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    // Glow
    var grd = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.8);
    grd.addColorStop(0, 'rgba(74,103,65,0.14)');
    grd.addColorStop(1, 'rgba(74,103,65,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = SURF;
    ctx.fill();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.stroke();

    // Rotating spokes
    for (var i = 0; i < 8; i++) {
      var ang = (i / 8) * Math.PI * 2 + rawT * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r * 0.30, cy + Math.sin(ang) * r * 0.30);
      ctx.lineTo(cx + Math.cos(ang) * r * 0.72, cy + Math.sin(ang) * r * 0.72);
      ctx.strokeStyle = 'rgba(74,103,65,0.38)';
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = ACCENT;
    ctx.font = Math.max(7, W * 0.012) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', cx, cy);

    var dotCount = Math.floor(rawT * 2.5) % 4;
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(7, W * 0.011) + 'px Inter, sans-serif';
    ctx.fillText('Writing' + '.'.repeat(dotCount), cx, cy + r + Math.max(8, H * 0.026));

    ctx.globalAlpha = 1;
  }

  // ── Connecting arrows (keywords → AI → doc) ──────────────
  function drawConnectors(progress, nodeX, nodeY) {
    if (progress <= 0) return;
    var op = Math.min(1, progress * 4);
    ctx.globalAlpha = op;
    ctx.setLineDash([Math.max(3, W * 0.006), Math.max(3, W * 0.006)]);

    // Left panel right edge → AI node left
    var fromX = W * 0.03 + W * 0.32;
    var toX   = nodeX - Math.max(22, W * 0.040);
    var midY  = nodeY;
    var prog1 = Math.min(1, progress * 2);
    var ex1   = fromX + (toX - fromX) * prog1;
    ctx.strokeStyle = ACCENT3;
    ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.beginPath();
    ctx.moveTo(fromX, midY);
    ctx.lineTo(ex1, midY);
    ctx.stroke();

    // AI node right → doc panel left
    if (progress > 0.5) {
      var prog2 = Math.min(1, (progress - 0.5) * 3);
      var aiRight  = nodeX + Math.max(22, W * 0.040);
      var docLeft  = W * 0.62;
      var ex2 = aiRight + (docLeft - aiRight) * prog2;
      ctx.beginPath();
      ctx.moveTo(aiRight, midY);
      ctx.lineTo(ex2, midY);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ── Panel 2: Blog draft forming ───────────────────────────
  function drawBlogDraft(progress, rawT) {
    if (progress <= 0) return;

    var cardX = W * 0.62;
    var cardW = W * 0.35;
    var cardY = H * 0.06;
    var cardH = H * 0.80;
    var pad   = Math.max(7, W * 0.016);
    var op    = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    // Card
    ctx.shadowColor = 'rgba(26,26,24,0.07)';
    ctx.shadowBlur  = Math.max(6, W * 0.012);
    ctx.fillStyle   = SURF;
    ctx.strokeStyle = BORDER;
    ctx.lineWidth   = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, Math.max(5, W * 0.008));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header strip
    var hdrH = Math.max(20, H * 0.060);
    ctx.fillStyle = ACCENT2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, hdrH, [Math.max(5,W*0.008), Math.max(5,W*0.008), 0, 0]);
    ctx.fill();

    ctx.fillStyle = ACCENT;
    ctx.font = 'bold ' + Math.max(7, W * 0.013) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var dotCount = Math.floor(rawT * 2.5) % 4;
    ctx.fillText('✎  Blog Draft · drafting' + '.'.repeat(dotCount), cardX + cardW / 2, cardY + hdrH / 2);

    // Title types out
    var titleProg = ease(Math.min(1, Math.max(0, (progress - 0.10) * 3)));
    var titleChars = Math.floor(BLOG_TITLE.length * titleProg);
    var titleText  = BLOG_TITLE.slice(0, titleChars);
    var cursorOn   = titleChars < BLOG_TITLE.length && Math.floor(rawT * 3) % 2 === 0;
    var titleFS    = Math.max(8, W * 0.015);
    var titleMaxW  = cardW - pad * 2;

    ctx.fillStyle = INK;
    ctx.font = 'bold ' + titleFS + 'px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Word-wrap title
    var words = (titleText + (cursorOn ? '|' : '')).split(' ');
    var line2 = '', ly = cardY + hdrH + pad;
    var tlh = titleFS * 1.45;
    for (var wi = 0; wi < words.length; wi++) {
      var test = line2 + (line2 ? ' ' : '') + words[wi];
      if (ctx.measureText(test).width > titleMaxW && line2) {
        ctx.fillText(line2, cardX + pad, ly);
        line2 = words[wi];
        ly += tlh;
      } else {
        line2 = test;
      }
    }
    if (line2) ctx.fillText(line2, cardX + pad, ly);
    var afterTitleY = ly + tlh + Math.max(6, H * 0.016);

    // Doc structure lines build in
    var structProg = ease(Math.min(1, Math.max(0, (progress - 0.45) * 2.5)));
    var linesShown = Math.floor(docStructure.length * structProg);
    var structY = afterTitleY;
    var slh = Math.max(8, H * 0.040);

    for (var si = 0; si < linesShown; si++) {
      var row = docStructure[si];
      var lw  = (cardW - pad * 2) * row.w;
      var lh2 = row.type === 'h1' ? Math.max(4, slh * 0.42) :
                row.type === 'h2' ? Math.max(3, slh * 0.32) :
                                    Math.max(2, slh * 0.22);
      var lop = Math.min(1, Math.max(0, structProg * docStructure.length - si) * 2);
      ctx.globalAlpha = op * lop;
      ctx.fillStyle = row.type === 'h1' ? 'rgba(74,103,65,0.55)' :
                      row.type === 'h2' ? 'rgba(74,103,65,0.38)' :
                                          'rgba(26,26,24,0.18)';
      ctx.beginPath();
      ctx.roundRect(cardX + pad, structY, lw, lh2, Math.max(1, W * 0.002));
      ctx.fill();
      structY += slh;
      if (structY + slh > cardY + cardH - pad) break;
    }
    ctx.globalAlpha = op;

    // SEO score dial in bottom-right of card
    if (progress > 0.72) {
      var seoOp = Math.min(1, (progress - 0.72) * 5);
      ctx.globalAlpha = op * seoOp;
      var seoR  = Math.max(14, W * 0.028);
      var seoCX = cardX + cardW - seoR - Math.max(8, W * 0.015);
      var seoCY = cardY + cardH - seoR - Math.max(8, H * 0.024);
      var seoScore = Math.floor(72 + 22 * ease(Math.min(1, (progress - 0.72) * 3)));

      var startA = -Math.PI * 0.75, sweep = Math.PI * 1.5;
      var fillA  = startA + sweep * ((seoScore - 70) / 30);

      ctx.beginPath();
      ctx.arc(seoCX, seoCY, seoR, startA, startA + sweep);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(seoCX, seoCY, seoR, startA, fillA);
      ctx.strokeStyle = ACCENT;
      ctx.stroke();
      ctx.lineCap = 'butt';

      ctx.fillStyle = INK;
      ctx.font = 'bold ' + Math.max(9, W * 0.016) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seoScore, seoCX, seoCY - Math.max(2, H * 0.006));
      ctx.fillStyle = MUTED;
      ctx.font = Math.max(6, W * 0.010) + 'px Inter, sans-serif';
      ctx.fillText('SEO', seoCX, seoCY + Math.max(8, H * 0.026));
    }

    ctx.globalAlpha = 1;
  }

  // ── Bottom stat strip ─────────────────────────────────────
  function drawStats(progress) {
    if (progress < 0.75) return;
    var op = Math.min(1, (progress - 0.75) * 6);
    ctx.globalAlpha = op;

    var sy    = H * 0.89;
    var sh    = Math.max(18, H * 0.068);
    var sx    = W * 0.03;
    var sw    = W * 0.55;

    ctx.fillStyle = SURF;
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, Math.max(3, W * 0.005));
    ctx.fill();
    ctx.stroke();

    var items = ['2× / week', 'Your voice', 'SEO-first'];
    var labels= ['Publish cadence', 'Brand tone', 'Structure'];
    var iw = sw / items.length;
    items.forEach(function (v, i) {
      var ix = sx + i * iw;
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold ' + Math.max(9, W * 0.016) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v, ix + iw / 2, sy + sh * 0.36);
      ctx.fillStyle = MUTED;
      ctx.font = Math.max(7, W * 0.011) + 'px Inter, sans-serif';
      ctx.fillText(labels[i], ix + iw / 2, sy + sh * 0.72);
    });

    ctx.globalAlpha = 1;
  }

  function draw(ts) {
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;

    if (!reduceMotion) {
      if (holding > 0) {
        holding -= dt;
        if (holding < 0) { holding = 0; t = 0; }
      } else {
        t += dt / PHASE_DUR;
        if (t >= 1) { t = 1; holding = HOLD; }
      }
    } else {
      t = 1;
    }

    var p = ease(Math.min(t, 1));

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var nodeX = W * 0.52;
    var nodeY = H * 0.40;

    var phaseKW   = Math.min(1, p * 2.8);
    var phaseNode = Math.min(1, Math.max(0, p - 0.28) * 3.5);
    var phaseConn = Math.min(1, Math.max(0, p - 0.32) * 4.0);
    var phaseDoc  = Math.min(1, Math.max(0, p - 0.52) * 3.0);
    var phaseStats= p;

    drawKeywordPanel(phaseKW);
    drawConnectors(phaseConn, nodeX, nodeY);
    drawAINode(nodeX, nodeY, t, phaseNode);
    drawBlogDraft(phaseDoc, t);
    drawStats(phaseStats);

    raf = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    window.addEventListener('resize', function () { resize(); });
    last = performance.now();
    raf = requestAnimationFrame(draw);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
