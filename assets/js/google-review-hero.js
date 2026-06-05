(function () {
  'use strict';

  var canvas = document.getElementById('review-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var BG     = '#F7F5F0';
  var INK    = '#1A1A18';
  var MUTED  = '#86847C';
  var SURF   = '#FFFFFF';
  var GOLD   = '#B8860B';
  var GOLD2  = 'rgba(184,134,11,0.14)';
  var GOLD3  = 'rgba(184,134,11,0.32)';
  var GREEN  = '#2E7D52';
  var GREEN2 = 'rgba(46,125,82,0.12)';
  var RED    = '#B43C3C';
  var RED2   = 'rgba(180,60,60,0.10)';
  var BORDER = 'rgba(26,26,24,0.11)';
  var FAINT  = 'rgba(26,26,24,0.055)';

  var PHASE_DUR = 6.5, HOLD = 1.6;
  var t = 0, holding = 0, last = 0;

  // Two review scenarios that cycle
  var scenarios = [
    {
      stars: 5,
      reviewer: 'Priya S.',
      text: '"Exceptional service. Highly recommend!"',
      type: 'positive',
      reply: 'Thank you, Priya! Your kind words mean a great deal to us. We look forward to welcoming you again soon.'
    },
    {
      stars: 3,
      reviewer: 'Rahul M.',
      text: '"Good experience, some room to improve."',
      type: 'neutral',
      reply: 'Hi Rahul, thank you for taking the time to share your feedback. We\'d love to learn more...'
    }
  ];

  var scenarioIdx = 0;

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function ease(x) { return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2; }

  // ── Draw stars ────────────────────────────────────────────
  function drawStars(cx, cy, count, size) {
    var total = 5;
    var gap   = size * 2.5;
    var startX = cx - (total - 1) * gap / 2;
    for (var i = 0; i < total; i++) {
      var pts = 5, outer = size, inner = size * 0.42;
      ctx.beginPath();
      for (var j = 0; j < pts * 2; j++) {
        var ang = (j * Math.PI / pts) - Math.PI / 2;
        var r2 = (j % 2 === 0) ? outer : inner;
        var sx = startX + i * gap + Math.cos(ang) * r2;
        var sy = cy + Math.sin(ang) * r2;
        if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fillStyle = i < count ? GOLD : 'rgba(184,134,11,0.22)';
      ctx.fill();
    }
  }

  // ── Panel 1: Incoming review card ────────────────────────
  function drawReviewCard(progress, scenario) {
    if (progress <= 0) return;

    var cardX = W * 0.03;
    var cardW = W * 0.36;
    var cardY = H * 0.08;
    var cardH = H * 0.60;
    var pad   = Math.max(8, W * 0.020);
    var op    = Math.min(1, progress * 3);

    ctx.globalAlpha = op;

    // Shadow / card
    ctx.shadowColor = 'rgba(26,26,24,0.07)';
    ctx.shadowBlur  = Math.max(6, W * 0.014);
    ctx.fillStyle   = SURF;
    ctx.strokeStyle = scenario.stars >= 4 ? GOLD3 : 'rgba(180,60,60,0.28)';
    ctx.lineWidth   = Math.max(1, W * 0.0015);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, Math.max(5, W * 0.008));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // "New review" badge
    var badgeW = Math.max(50, W * 0.10);
    var badgeH = Math.max(13, H * 0.040);
    ctx.fillStyle = scenario.stars >= 4 ? GOLD2 : RED2;
    ctx.strokeStyle = scenario.stars >= 4 ? GOLD3 : 'rgba(180,60,60,0.35)';
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.roundRect(cardX + pad, cardY + pad, badgeW, badgeH, Math.max(3, W * 0.004));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = scenario.stars >= 4 ? GOLD : RED;
    ctx.font = Math.max(7, W * 0.012) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scenario.stars >= 4 ? '★ New review' : '⚑ Low rating', cardX + pad + badgeW / 2, cardY + pad + badgeH / 2);

    // "Google" label
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(7, W * 0.011) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Google', cardX + cardW - pad, cardY + pad + badgeH / 2);

    // Stars row
    var starsY = cardY + pad + badgeH + Math.max(10, H * 0.040);
    var starSz = Math.max(7, W * 0.014);
    drawStars(cardX + cardW / 2, starsY, scenario.stars, starSz);

    // Reviewer name
    ctx.fillStyle = INK;
    ctx.font = 'bold ' + Math.max(9, W * 0.018) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scenario.reviewer, cardX + cardW / 2, starsY + Math.max(14, H * 0.054));

    // Review text
    var textY = starsY + Math.max(26, H * 0.100);
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.014) + 'px Inter, sans-serif';

    // Word-wrap the review text to fit card width
    var maxLineW = cardW - pad * 2;
    var words = scenario.text.split(' ');
    var line = '';
    var lineY = textY;
    var lineH2 = Math.max(13, H * 0.044);
    for (var wi = 0; wi < words.length; wi++) {
      var testLine = line + (line ? ' ' : '') + words[wi];
      if (ctx.measureText(testLine).width > maxLineW && line) {
        ctx.fillText(line, cardX + cardW / 2, lineY);
        line  = words[wi];
        lineY += lineH2;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, cardX + cardW / 2, lineY);

    // Timestamp
    ctx.fillStyle = 'rgba(134,132,124,0.6)';
    ctx.font = Math.max(7, W * 0.011) + 'px Inter, sans-serif';
    ctx.fillText('Just now · Google Maps', cardX + cardW / 2, cardY + cardH - pad);

    ctx.globalAlpha = 1;
  }

  // ── Center: AI classifier ────────────────────────────────
  function drawClassifier(progress, scenario, rawT) {
    if (progress <= 0) return;

    var cx = W * 0.50;
    var cy = H * 0.36;
    var r  = Math.max(20, W * 0.038);
    var op = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    // Glow
    var grd = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.0);
    grd.addColorStop(0, 'rgba(184,134,11,0.12)');
    grd.addColorStop(1, 'rgba(184,134,11,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = SURF;
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.stroke();

    // Rotating spokes
    var spokes = 6;
    for (var i = 0; i < spokes; i++) {
      var ang = (i / spokes) * Math.PI * 2 + rawT * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r * 0.32, cy + Math.sin(ang) * r * 0.32);
      ctx.lineTo(cx + Math.cos(ang) * r * 0.72, cy + Math.sin(ang) * r * 0.72);
      ctx.strokeStyle = 'rgba(184,134,11,0.45)';
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.stroke();
    }

    // Label inside
    ctx.fillStyle = GOLD;
    ctx.font = Math.max(7, W * 0.011) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', cx, cy);

    // Label below
    var dotCount = Math.floor(rawT * 2.5) % 4;
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(7, W * 0.011) + 'px Inter, sans-serif';
    ctx.fillText('Classifying' + '.'.repeat(dotCount), cx, cy + r + Math.max(8, H * 0.026));

    ctx.globalAlpha = 1;
  }

  // ── Connecting arrows ────────────────────────────────────
  function drawFlowArrows(progress, scenario) {
    if (progress <= 0) return;
    var op = Math.min(1, progress * 4);
    ctx.globalAlpha = op;

    var fromX = W * 0.03 + W * 0.36;   // right edge of review card
    var toX   = W * 0.50 - Math.max(20, W * 0.038);  // left edge of AI node
    var midY  = H * 0.36;

    // Review → AI
    var prog1 = Math.min(1, progress * 2);
    var ex1   = fromX + (toX - fromX) * prog1;
    ctx.strokeStyle = GOLD3;
    ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.setLineDash([Math.max(3, W * 0.006), Math.max(3, W * 0.006)]);
    ctx.beginPath();
    ctx.moveTo(fromX, midY);
    ctx.lineTo(ex1, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // AI → right panel
    if (progress > 0.5) {
      var prog2  = Math.min(1, (progress - 0.5) * 3);
      var aiEdge = W * 0.50 + Math.max(20, W * 0.038);
      var destX  = W * 0.62;
      var destY  = scenario.stars >= 4 ? H * 0.28 : H * 0.55;
      var ex2    = aiEdge + (destX - aiEdge) * prog2;
      var ey2    = midY + (destY - midY) * prog2;
      ctx.strokeStyle = scenario.stars >= 4 ? 'rgba(46,125,82,0.4)' : 'rgba(180,60,60,0.4)';
      ctx.lineWidth = Math.max(1.5, W * 0.002);
      ctx.setLineDash([Math.max(3, W * 0.006), Math.max(3, W * 0.006)]);
      ctx.beginPath();
      ctx.moveTo(aiEdge, midY);
      ctx.lineTo(ex2, ey2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  }

  // ── Panel 2: Auto-reply being typed ─────────────────────
  function drawReplyPanel(progress, scenario, rawT) {
    if (progress <= 0) return;
    if (scenario.stars < 4) return; // escalation shown instead

    var cardX = W * 0.62;
    var cardW = W * 0.35;
    var cardY = H * 0.06;
    var cardH = H * 0.55;
    var pad   = Math.max(7, W * 0.016);
    var op    = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    ctx.shadowColor = 'rgba(26,26,24,0.07)';
    ctx.shadowBlur  = Math.max(6, W * 0.012);
    ctx.fillStyle   = SURF;
    ctx.strokeStyle = 'rgba(46,125,82,0.35)';
    ctx.lineWidth   = Math.max(1, W * 0.0015);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, Math.max(5, W * 0.008));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header
    var hdrH = Math.max(20, H * 0.060);
    ctx.fillStyle = GREEN2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, hdrH, [Math.max(5, W*0.008), Math.max(5, W*0.008), 0, 0]);
    ctx.fill();

    ctx.fillStyle = GREEN;
    ctx.font = 'bold ' + Math.max(7, W * 0.013) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ AI Reply — Auto-posting', cardX + cardW / 2, cardY + hdrH / 2);

    // Reply text typing
    var fy = cardY + hdrH + Math.max(8, H * 0.024);
    var lh = Math.max(12, H * 0.046);
    var fs = Math.max(8, W * 0.013);

    var replyProg = ease(Math.min(1, progress * 1.5));
    var charsShown = Math.floor(scenario.reply.length * replyProg);
    var replyText  = scenario.reply.slice(0, charsShown);
    var cursor     = charsShown < scenario.reply.length && Math.floor(rawT * 3) % 2 === 0;

    // Break into lines
    ctx.font = fs + 'px Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var maxW  = cardW - pad * 2;
    var words = (replyText + (cursor ? '|' : '')).split(' ');
    var line2 = '';
    var ly    = fy;
    for (var wi = 0; wi < words.length; wi++) {
      var test = line2 + (line2 ? ' ' : '') + words[wi];
      if (ctx.measureText(test).width > maxW && line2) {
        ctx.fillText(line2, cardX + pad, ly);
        line2 = words[wi];
        ly   += lh;
        if (ly + lh > cardY + cardH - pad) break;
      } else {
        line2 = test;
      }
    }
    if (line2 && ly + lh <= cardY + cardH - pad) {
      ctx.fillText(line2, cardX + pad, ly);
    }

    // Posted badge
    if (progress > 0.85) {
      var btmOp = Math.min(1, (progress - 0.85) * 7);
      ctx.globalAlpha = op * btmOp;
      ctx.fillStyle = GREEN2;
      ctx.strokeStyle = 'rgba(46,125,82,0.3)';
      ctx.lineWidth = Math.max(1, W * 0.001);
      var postW = Math.max(60, W * 0.20);
      var postH = Math.max(12, H * 0.038);
      ctx.beginPath();
      ctx.roundRect(cardX + cardW / 2 - postW / 2, cardY + cardH - postH - pad * 0.5, postW, postH, Math.max(3, W * 0.004));
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = GREEN;
      ctx.font = Math.max(7, W * 0.012) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Posted in < 3 min', cardX + cardW / 2, cardY + cardH - postH / 2 - pad * 0.5);
    }

    ctx.globalAlpha = 1;
  }

  // ── Panel 2 (alt): Escalation box ───────────────────────
  function drawEscalatePanel(progress, scenario) {
    if (progress <= 0) return;
    if (scenario.stars >= 4) return;

    var cardX = W * 0.62;
    var cardW = W * 0.35;
    var cardY = H * 0.30;
    var cardH = H * 0.38;
    var pad   = Math.max(7, W * 0.016);
    var op    = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    ctx.shadowColor = 'rgba(26,26,24,0.07)';
    ctx.shadowBlur  = Math.max(6, W * 0.012);
    ctx.fillStyle   = SURF;
    ctx.strokeStyle = 'rgba(180,60,60,0.35)';
    ctx.lineWidth   = Math.max(1, W * 0.0015);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, Math.max(5, W * 0.008));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header
    var hdrH = Math.max(20, H * 0.060);
    ctx.fillStyle = RED2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, hdrH, [Math.max(5, W*0.008), Math.max(5, W*0.008), 0, 0]);
    ctx.fill();

    ctx.fillStyle = RED;
    ctx.font = 'bold ' + Math.max(7, W * 0.013) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚑ Escalating to team', cardX + cardW / 2, cardY + hdrH / 2);

    // Steps
    var steps = ['Empathetic draft ready', 'Manager notified', 'Service-recovery triggered'];
    var sy = cardY + hdrH + Math.max(8, H * 0.022);
    var lh = (cardH - hdrH - pad * 2) / steps.length;
    steps.forEach(function (s, i) {
      var sprog = Math.min(1, Math.max(0, progress * steps.length * 1.2 - i));
      if (sprog <= 0) return;
      var bop = Math.min(1, sprog * 3);
      ctx.globalAlpha = op * bop;
      ctx.fillStyle = MUTED;
      ctx.font = Math.max(7, W * 0.012) + 'px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = RED;
      ctx.fillText('→', cardX + pad, sy + i * lh + lh / 2);
      ctx.fillStyle = INK;
      ctx.fillText(s, cardX + pad + Math.max(10, W * 0.018), sy + i * lh + lh / 2);
    });

    ctx.globalAlpha = 1;
  }

  // ── Rating meter (bottom) ────────────────────────────────
  function drawRatingStrip(progress) {
    if (progress <= 0) return;
    var op = Math.min(1, progress * 3.5);
    ctx.globalAlpha = op;

    var stripY = H * 0.73;
    var stripH = H * 0.22;
    var stripX = W * 0.03;
    var stripW = W * 0.94;

    ctx.fillStyle = SURF;
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.roundRect(stripX, stripY, stripW, stripH, Math.max(5, W * 0.007));
    ctx.fill();
    ctx.stroke();

    var ratingProg = ease(Math.min(1, progress * 1.8));
    var currentRating = 4.1 + (4.8 - 4.1) * ratingProg;
    var colCY = stripY + stripH / 2;

    // Big rating number
    var numX = stripX + Math.max(30, W * 0.060);
    ctx.fillStyle = INK;
    ctx.font = 'bold ' + Math.max(18, W * 0.036) + 'px Gilda Display, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentRating.toFixed(1), numX, colCY - Math.max(2, H * 0.008));

    // Stars below the number
    var starSz = Math.max(6, W * 0.012);
    drawStars(numX, colCY + Math.max(10, H * 0.040), 5, starSz);

    // Divider
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.moveTo(numX + Math.max(22, W * 0.048), stripY + stripH * 0.2);
    ctx.lineTo(numX + Math.max(22, W * 0.048), stripY + stripH * 0.8);
    ctx.stroke();

    // Response rate + label
    var statsX = numX + Math.max(28, W * 0.058);
    var statItems = [
      { label: 'Avg. Rating', val: currentRating.toFixed(1) + ' / 5' },
      { label: 'Response rate', val: '98%' },
      { label: 'Reply time', val: '< 3 min' }
    ];
    var statW = (stripW - (statsX - stripX) - Math.max(8, W * 0.014)) / statItems.length;
    statItems.forEach(function (s, i) {
      var sx = statsX + i * statW;
      ctx.fillStyle = GOLD;
      ctx.font = 'bold ' + Math.max(10, W * 0.018) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.val, sx + statW / 2, colCY - Math.max(4, H * 0.016));
      ctx.fillStyle = MUTED;
      ctx.font = Math.max(7, W * 0.011) + 'px Inter, sans-serif';
      ctx.fillText(s.label, sx + statW / 2, colCY + Math.max(8, H * 0.032));
    });

    ctx.globalAlpha = 1;
  }

  function draw(ts) {
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;

    if (!reduceMotion) {
      if (holding > 0) {
        holding -= dt;
        if (holding < 0) {
          holding = 0;
          t = 0;
          scenarioIdx = (scenarioIdx + 1) % scenarios.length;
        }
      } else {
        t += dt / PHASE_DUR;
        if (t >= 1) { t = 1; holding = HOLD; }
      }
    } else {
      t = 1;
    }

    var p   = ease(Math.min(t, 1));
    var scn = scenarios[scenarioIdx];

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    var phaseCard       = Math.min(1, p * 3.0);
    var phaseClassifier = Math.min(1, Math.max(0, p - 0.25) * 3.5);
    var phaseArrows     = Math.min(1, Math.max(0, p - 0.30) * 4.0);
    var phaseRight      = Math.min(1, Math.max(0, p - 0.55) * 3.5);
    var phaseStrip      = Math.min(1, Math.max(0, p - 0.60) * 3.5);

    drawReviewCard(phaseCard, scn);
    drawClassifier(phaseClassifier, scn, t);
    drawFlowArrows(phaseArrows, scn);
    drawReplyPanel(phaseRight, scn, t);
    drawEscalatePanel(phaseRight, scn);
    drawRatingStrip(phaseStrip);

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
