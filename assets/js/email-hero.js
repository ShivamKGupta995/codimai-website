(function () {
  'use strict';

  var canvas = document.getElementById('email-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf = null;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var BG      = '#F7F5F0';
  var INK     = '#1A1A18';
  var MUTED   = '#86847C';
  var SURF    = '#FFFFFF';
  var BORDER  = 'rgba(26,26,24,0.11)';
  var ACCENT  = '#7A6145';
  var ACCENT2 = 'rgba(122,97,69,0.14)';
  var ACCENT3 = 'rgba(122,97,69,0.30)';
  var FAINT   = 'rgba(26,26,24,0.055)';
  var GREEN   = '#2E7D52';
  var GREEN2  = 'rgba(46,125,82,0.12)';

  var PHASE_DUR = 6.5, HOLD = 1.6;
  var t = 0, holding = 0, last = 0;

  var contacts = [
    { initials: 'AK', name: 'Arjun K.', company: 'TechCorp' },
    { initials: 'SM', name: 'Sara M.',  company: 'RetailPlus' },
    { initials: 'RP', name: 'Ravi P.',  company: 'GrowthCo' },
    { initials: 'JL', name: 'Julia L.', company: 'FinanceHub' }
  ];

  var SUBJECT   = 'Following up, Arjun — quick question';
  var BODY1     = 'Hi Arjun, reaching out to TechCorp';
  var BODY2     = 'about your Q3 pipeline goals...';

  var seqSteps = [
    { day: 'Day 0', label: 'First touch',    status: 'sent' },
    { day: 'Day 3', label: 'No reply → follow-up', status: 'pending' },
    { day: 'Day 7', label: 'Re-engage',      status: 'pending' },
    { day: 'Reply', label: 'Sequence stops', status: 'done' }
  ];

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.floor(r.width);
    H = canvas.height = Math.floor(r.height);
  }

  function ease(x) { return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2; }

  // ── Panel 1: Contact list ────────────────────────────────
  function drawContactPanel(progress) {
    if (progress <= 0) return;

    var panelX = W * 0.02;
    var panelW = W * 0.27;
    var cardH  = Math.max(36, H * 0.13);
    var cardGap= Math.max(4,  H * 0.018);
    var startY = H * 0.10;

    // Section label
    var op0 = Math.min(1, progress * 4);
    ctx.globalAlpha = op0;
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.013) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('// Contacts', panelX, startY - Math.max(8, H * 0.028));
    ctx.globalAlpha = 1;

    contacts.forEach(function (c, i) {
      var cardProgress = Math.min(1, Math.max(0, progress * contacts.length * 1.2 - i * 0.8));
      if (cardProgress <= 0) return;
      var op = Math.min(1, cardProgress * 2.5);
      ctx.globalAlpha = op;

      var cy = startY + i * (cardH + cardGap);
      var avatarR = Math.max(12, W * 0.023);
      var avatarX = panelX + avatarR + Math.max(4, W * 0.008);
      var avatarCY = cy + cardH / 2;

      // Card background
      ctx.fillStyle = progress > 0.6 ? ACCENT2 : FAINT;
      ctx.strokeStyle = progress > 0.6 ? ACCENT3 : BORDER;
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.beginPath();
      ctx.roundRect(panelX, cy, panelW, cardH, Math.max(4, W * 0.006));
      ctx.fill();
      ctx.stroke();

      // Avatar circle
      ctx.beginPath();
      ctx.arc(avatarX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.fillStyle = ACCENT2;
      ctx.fill();
      ctx.strokeStyle = ACCENT3;
      ctx.lineWidth = Math.max(1, W * 0.0015);
      ctx.stroke();

      ctx.fillStyle = ACCENT;
      ctx.font = 'bold ' + Math.max(8, W * 0.016) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.initials, avatarX, avatarCY);

      // Name + company
      var textX = avatarX + avatarR + Math.max(5, W * 0.010);
      ctx.fillStyle = INK;
      ctx.font = 'bold ' + Math.max(8, W * 0.016) + 'px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.name, textX, avatarCY - Math.max(4, H * 0.016));

      ctx.fillStyle = MUTED;
      ctx.font = Math.max(7, W * 0.013) + 'px Inter, sans-serif';
      ctx.fillText(c.company, textX, avatarCY + Math.max(4, H * 0.016));

      // "Draft ready" badge that appears after composer shows
      if (progress > 0.7) {
        var badgeOp = Math.min(1, (progress - 0.7) * 5);
        ctx.globalAlpha = op * badgeOp;
        var badgeX = panelX + panelW - Math.max(38, W * 0.072) - Math.max(3, W * 0.005);
        var badgeY = cy + Math.max(4, H * 0.012);
        var badgeW = Math.max(38, W * 0.072);
        var badgeH = Math.max(11, H * 0.032);
        ctx.fillStyle = ACCENT2;
        ctx.strokeStyle = ACCENT3;
        ctx.lineWidth = Math.max(1, W * 0.001);
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, Math.max(3, W * 0.004));
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ACCENT;
        ctx.font = Math.max(6, W * 0.011) + 'px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✉ Draft ready', badgeX + badgeW / 2, badgeY + badgeH / 2);
      }

      ctx.globalAlpha = 1;
    });
  }

  // ── Panel 2: Email composer card ─────────────────────────
  function drawComposerCard(progress, rawT) {
    if (progress <= 0) return;

    var cardX = W * 0.33;
    var cardW = W * 0.34;
    var cardY = H * 0.06;
    var cardH = H * 0.80;
    var pad   = Math.max(8, W * 0.018);

    var op = Math.min(1, progress * 3);
    ctx.globalAlpha = op;

    // Card shadow / outer glow
    ctx.shadowColor = 'rgba(26,26,24,0.08)';
    ctx.shadowBlur  = Math.max(8, W * 0.016);
    ctx.fillStyle = SURF;
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, Math.max(6, W * 0.009));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Card header bar
    var headerH = Math.max(22, H * 0.068);
    ctx.fillStyle = ACCENT2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, headerH, [Math.max(6, W * 0.009), Math.max(6, W * 0.009), 0, 0]);
    ctx.fill();

    // Envelope icon (simplified)
    var iconX = cardX + pad;
    var iconCY = cardY + headerH / 2;
    var iconW  = Math.max(10, W * 0.022);
    var iconH  = iconW * 0.65;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.fillStyle = SURF;
    ctx.beginPath();
    ctx.roundRect(iconX, iconCY - iconH/2, iconW, iconH, Math.max(1, W * 0.002));
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconX, iconCY - iconH/2);
    ctx.lineTo(iconX + iconW/2, iconCY + iconH * 0.12);
    ctx.lineTo(iconX + iconW, iconCY - iconH/2);
    ctx.stroke();

    // Header label
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold ' + Math.max(8, W * 0.014) + 'px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI Composer', iconX + iconW + Math.max(5, W * 0.008), iconCY);

    // Animated dots
    var dotCount = Math.floor(rawT * 3) % 4;
    var dots = '.'.repeat(dotCount);
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.013) + 'px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('drafting' + dots, cardX + cardW - pad, iconCY);

    // Fields
    var fy = cardY + headerH + Math.max(8, H * 0.020);
    var lh = Math.max(14, H * 0.060);
    var fs = Math.max(8, W * 0.014);

    // TO field
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(7, W * 0.012) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('TO', cardX + pad, fy + lh * 0.5);

    ctx.fillStyle = INK;
    ctx.font = Math.max(8, W * 0.014) + 'px Inter, sans-serif';
    ctx.fillText('Arjun K. <arjun@techcorp.io>', cardX + pad + Math.max(18, W * 0.036), fy + lh * 0.5);

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.moveTo(cardX + pad, fy + lh);
    ctx.lineTo(cardX + cardW - pad, fy + lh);
    ctx.stroke();
    fy += lh + Math.max(2, H * 0.006);

    // SUBJECT field with typing animation
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(7, W * 0.012) + 'px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUB', cardX + pad, fy + lh * 0.5);

    var subProg = ease(Math.min(1, Math.max(0, (progress - 0.10) * 4)));
    var subChars = Math.floor(SUBJECT.length * subProg);
    var subText = SUBJECT.slice(0, subChars);
    var cursorOn = Math.floor(rawT * 3) % 2 === 0;
    ctx.fillStyle = INK;
    ctx.font = Math.max(8, W * 0.014) + 'px Inter, sans-serif';
    ctx.fillText(subText + (subProg < 1 && cursorOn ? '|' : ''), cardX + pad + Math.max(18, W * 0.036), fy + lh * 0.5);

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.moveTo(cardX + pad, fy + lh);
    ctx.lineTo(cardX + cardW - pad, fy + lh);
    ctx.stroke();
    fy += lh + Math.max(6, H * 0.016);

    // Body
    var bodyProg = ease(Math.min(1, Math.max(0, (progress - 0.45) * 3.5)));
    if (bodyProg > 0) {
      var bOp = Math.min(1, bodyProg * 3);
      ctx.globalAlpha = op * bOp;

      // Greeting
      var greeting = 'Hi Arjun,';
      ctx.fillStyle = INK;
      ctx.font = Math.max(8, W * 0.015) + 'px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(greeting, cardX + pad, fy);
      fy += Math.max(12, H * 0.042);

      // Line 1 with personalization token highlight
      var bodyFs = Math.max(8, W * 0.014);
      ctx.font = bodyFs + 'px Inter, sans-serif';

      var body1Chars = Math.floor(BODY1.length * Math.min(1, bodyProg * 1.8));
      var body1Text = BODY1.slice(0, body1Chars);
      ctx.fillStyle = INK;
      ctx.fillText(body1Text, cardX + pad, fy);

      // Highlight "TechCorp" once fully typed
      if (bodyProg > 0.5) {
        var hWord = 'TechCorp';
        var preText = 'Hi Arjun, reaching out to ';
        ctx.font = bodyFs + 'px Inter, sans-serif';
        var preW2 = ctx.measureText('reaching out to ').width;
        var hW2   = ctx.measureText(hWord).width;
        var hPad2 = Math.max(2, W * 0.003);
        var highlightX = cardX + pad + preW2;
        var highlightOp = Math.min(1, (bodyProg - 0.5) * 4);
        ctx.globalAlpha = op * highlightOp;
        ctx.fillStyle = ACCENT2;
        ctx.beginPath();
        ctx.roundRect(highlightX - hPad2, fy - bodyFs * 0.65, hW2 + hPad2 * 2, bodyFs * 1.3, Math.max(2, W * 0.003));
        ctx.fill();
        ctx.fillStyle = ACCENT;
        ctx.font = bodyFs + 'px Inter, sans-serif';
        ctx.fillText(hWord, highlightX, fy);
        ctx.globalAlpha = op * bOp;
      }
      fy += Math.max(10, H * 0.038);

      // Line 2
      var body2Chars = Math.floor(BODY2.length * Math.min(1, Math.max(0, bodyProg * 2 - 0.8)));
      var body2Text = BODY2.slice(0, body2Chars);
      var body2cursor = body2Chars < BODY2.length && cursorOn;
      ctx.fillStyle = INK;
      ctx.font = bodyFs + 'px Inter, sans-serif';
      ctx.fillText(body2Text + (body2cursor ? '|' : ''), cardX + pad, fy);
      fy += Math.max(14, H * 0.050);

      // Personalization note
      if (bodyProg > 0.8) {
        var noteOp = Math.min(1, (bodyProg - 0.8) * 5);
        ctx.globalAlpha = op * noteOp;
        var noteW = cardW - pad * 2;
        var noteH = Math.max(16, H * 0.050);
        ctx.fillStyle = 'rgba(122,97,69,0.08)';
        ctx.strokeStyle = ACCENT3;
        ctx.lineWidth = Math.max(1, W * 0.001);
        ctx.beginPath();
        ctx.roundRect(cardX + pad, fy, noteW, noteH, Math.max(3, W * 0.004));
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ACCENT;
        ctx.font = Math.max(7, W * 0.012) + 'px Inter, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('↻ Personalized from CRM · 4 contacts in sequence', cardX + pad + noteW/2, fy + noteH/2);
        ctx.textAlign = 'left';
      }
    }

    ctx.globalAlpha = 1;
  }

  // ── Panel 3: Follow-up sequence ──────────────────────────
  function drawSequencePanel(progress) {
    if (progress <= 0) return;

    var colX = W * 0.72;
    var colW = W * 0.26;
    var nodeX = colX + colW / 2;
    var nodeR = Math.max(11, W * 0.020);

    var stepYs = [H * 0.14, H * 0.33, H * 0.52, H * 0.70];

    // Section label
    var op0 = Math.min(1, progress * 4);
    ctx.globalAlpha = op0;
    ctx.fillStyle = MUTED;
    ctx.font = Math.max(8, W * 0.013) + 'px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('// Follow-up Sequence', colX, stepYs[0] - Math.max(10, H * 0.035));
    ctx.globalAlpha = 1;

    seqSteps.forEach(function (step, i) {
      var sProg = Math.min(1, Math.max(0, progress * seqSteps.length * 1.1 - i * 0.9));
      if (sProg <= 0) return;
      var op = Math.min(1, sProg * 2.5);
      ctx.globalAlpha = op;

      var cy = stepYs[i];

      // Connector arrow from previous node
      if (i > 0 && sProg > 0.2) {
        var prevY = stepYs[i - 1];
        var arrProg = Math.min(1, (sProg - 0.2) * 2.5);
        var arrEndY = prevY + nodeR + (cy - nodeR - prevY - nodeR) * arrProg;
        ctx.strokeStyle = 'rgba(122,97,69,0.25)';
        ctx.lineWidth = Math.max(1, W * 0.0015);
        ctx.setLineDash([Math.max(3, W * 0.005), Math.max(3, W * 0.005)]);
        ctx.beginPath();
        ctx.moveTo(nodeX, prevY + nodeR);
        ctx.lineTo(nodeX, arrEndY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node circle
      var isDone   = step.status === 'done';
      var isSent   = step.status === 'sent';
      ctx.beginPath();
      ctx.arc(nodeX, cy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = isDone ? GREEN2 : isSent ? ACCENT2 : FAINT;
      ctx.fill();
      ctx.strokeStyle = isDone ? GREEN : isSent ? ACCENT : BORDER;
      ctx.lineWidth = Math.max(1.5, W * 0.002);
      ctx.stroke();

      // Icon inside node
      ctx.fillStyle = isDone ? GREEN : ACCENT;
      ctx.font = Math.max(7, W * 0.014) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isDone ? '✓' : '✉', nodeX, cy);

      // Day badge
      ctx.fillStyle = isDone ? GREEN2 : ACCENT2;
      ctx.strokeStyle = isDone ? GREEN : ACCENT3;
      ctx.lineWidth = Math.max(1, W * 0.001);
      var dayW = Math.max(22, W * 0.052);
      var dayH = Math.max(10, H * 0.028);
      ctx.beginPath();
      ctx.roundRect(nodeX - dayW / 2, cy - nodeR - dayH - Math.max(2, H * 0.005), dayW, dayH, Math.max(3, W * 0.004));
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDone ? GREEN : ACCENT;
      ctx.font = Math.max(6, W * 0.011) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(step.day, nodeX, cy - nodeR - dayH / 2 - Math.max(2, H * 0.005));

      // Label below node
      ctx.fillStyle = INK;
      ctx.font = Math.max(7, W * 0.013) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(step.label, nodeX, cy + nodeR + Math.max(3, H * 0.008));

      ctx.globalAlpha = 1;
    });
  }

  // ── Bottom stats strip ───────────────────────────────────
  function drawStats(progress) {
    if (progress < 0.7) return;
    var op = Math.min(1, (progress - 0.7) * 5);
    ctx.globalAlpha = op;

    var stats = [
      { val: '68%', label: 'Open rate' },
      { val: '34%', label: 'Reply rate' },
      { val: '12%', label: 'Converted' }
    ];

    var totalW = W * 0.94;
    var chipW  = totalW / stats.length - Math.max(4, W * 0.010);
    var chipH  = Math.max(22, H * 0.072);
    var chipY  = H * 0.886;
    var startX = W * 0.03;
    var gap    = Math.max(4, W * 0.010);

    stats.forEach(function (s, i) {
      var bx = startX + i * (chipW + gap);
      ctx.fillStyle = SURF;
      ctx.strokeStyle = BORDER;
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.beginPath();
      ctx.roundRect(bx, chipY, chipW, chipH, Math.max(3, W * 0.005));
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = ACCENT;
      ctx.font = 'bold ' + Math.max(10, W * 0.020) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.val, bx + chipW / 2, chipY + chipH * 0.38);

      ctx.fillStyle = MUTED;
      ctx.font = Math.max(7, W * 0.012) + 'px Inter, sans-serif';
      ctx.fillText(s.label, bx + chipW / 2, chipY + chipH * 0.72);
    });
    ctx.globalAlpha = 1;
  }

  // ── Connector arrows left panel → center card ────────────
  function drawConnectors(progress) {
    if (progress < 0.3) return;
    var op = Math.min(1, (progress - 0.3) * 4);
    ctx.globalAlpha = op;

    var fromX = W * 0.29;    // right edge of contact panel
    var toX   = W * 0.33;    // left edge of composer card
    var midY  = H * 0.42;

    ctx.strokeStyle = ACCENT3;
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.setLineDash([Math.max(3, W * 0.005), Math.max(3, W * 0.005)]);
    ctx.beginPath();
    ctx.moveTo(fromX, midY);
    ctx.lineTo(toX, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    var hs = Math.max(4, W * 0.007);
    var a  = 0; // pointing right
    ctx.fillStyle = ACCENT3;
    ctx.beginPath();
    ctx.moveTo(toX, midY);
    ctx.lineTo(toX - hs, midY - hs * 0.5);
    ctx.lineTo(toX - hs, midY + hs * 0.5);
    ctx.closePath();
    ctx.fill();

    // Connector from composer to sequence panel
    var c2X = W * 0.67;   // right edge of composer
    var s2X = W * 0.72;   // left edge of sequence
    var s2Y = H * 0.42;

    ctx.strokeStyle = ACCENT3;
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.setLineDash([Math.max(3, W * 0.005), Math.max(3, W * 0.005)]);
    ctx.beginPath();
    ctx.moveTo(c2X, s2Y);
    ctx.lineTo(s2X, s2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = ACCENT3;
    ctx.beginPath();
    ctx.moveTo(s2X, s2Y);
    ctx.lineTo(s2X - hs, s2Y - hs * 0.5);
    ctx.lineTo(s2X - hs, s2Y + hs * 0.5);
    ctx.closePath();
    ctx.fill();

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

    var phaseContacts  = Math.min(1, p * 3.0);
    var phaseComposer  = Math.min(1, Math.max(0, p - 0.22) * 2.8);
    var phaseConnectors= Math.min(1, Math.max(0, p - 0.30) * 4);
    var phaseSequence  = Math.min(1, Math.max(0, p - 0.55) * 3);
    var phaseStats     = p;

    drawContactPanel(phaseContacts);
    drawComposerCard(phaseComposer, t);
    drawConnectors(phaseConnectors);
    drawSequencePanel(phaseSequence);
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
