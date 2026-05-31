/* ============================================================
   Hero signature rendering — "from pixels to worlds".
   A 3D point cloud that settles from scattered pixels into a
   rotating spatial world, drawn in warm brand ink on the cream
   canvas. Monochrome by design: color stays with imagery, the
   chrome stays neutral (CodimAI brand).

   Vanilla canvas 2D, no dependencies. Built for smoothness:
   zero per-frame allocation, depth-bucketed batched fills, and
   a single batched stroke for the filaments. DPR-aware,
   resize-safe, fully static under prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var TAU = Math.PI * 2;
  var INK = '26,26,24';                 /* --cd-ink #1A1A18 */

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fewer points on small screens keeps phones smooth */
  var small     = window.innerWidth < 820;
  var COUNT     = small ? 620 : 1000;
  var LINK_DIST = 32;
  var SETTLE    = 0.04;                  /* pixels → world easing */
  var PERSP     = 2.6;

  /* Depth buckets: draw all same-shade dots in one fill (few state changes) */
  var BUCKETS = 7;
  var palette = [];
  for (var bi = 0; bi < BUCKETS; bi++) {
    var a = 0.22 + ((bi + 0.5) / BUCKETS) * 0.55;   /* 0.22 .. 0.77 */
    palette.push('rgba(' + INK + ',' + a.toFixed(3) + ')');
  }

  /* Flat typed arrays — no objects, no GC churn */
  var hx, hy, hz, px, py, pz, sx, sy, sr, sb;
  var dpr, W, H, cx, cy, radius, t = 0, raf = null;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function build() {
    hx = new Float32Array(COUNT); hy = new Float32Array(COUNT); hz = new Float32Array(COUNT);
    px = new Float32Array(COUNT); py = new Float32Array(COUNT); pz = new Float32Array(COUNT);
    sx = new Float32Array(COUNT); sy = new Float32Array(COUNT);
    sr = new Float32Array(COUNT); sb = new Uint8Array(COUNT);

    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < COUNT; i++) {
      var y = 1 - (i / (COUNT - 1)) * 2;            /* -1 .. 1 */
      var r = Math.sqrt(1 - y * y);
      var theta = golden * i;
      hx[i] = Math.cos(theta) * r;
      hy[i] = y;
      hz[i] = Math.sin(theta) * r;
      if (reduced) {                                 /* start as finished world */
        px[i] = hx[i]; py[i] = hy[i]; pz[i] = hz[i];
      } else {                                       /* start scattered as pixels */
        px[i] = (Math.random() - 0.5) * 3.2;
        py[i] = (Math.random() - 0.5) * 3.2;
        pz[i] = (Math.random() - 0.5) * 3.2;
      }
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cx = W > 820 ? W * 0.72 : W * 0.5;
    cy = H * 0.5;
    radius = Math.min(W, H) * (W > 820 ? 0.42 : 0.46);
  }

  function frame() {
    t += 0.0015;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    var ay = t + mouse.x * 0.5;
    var ax = -0.32 + mouse.y * 0.35;
    var cosY = Math.cos(ay), sinY = Math.sin(ay);
    var cosX = Math.cos(ax), sinX = Math.sin(ax);

    /* ---- Update + project (single pass, no allocation) ----- */
    for (var i = 0; i < COUNT; i++) {
      var x = px[i], yv = py[i], z = pz[i];
      if (!reduced) {
        x  += (hx[i] - x)  * SETTLE; px[i] = x;
        yv += (hy[i] - yv) * SETTLE; py[i] = yv;
        z  += (hz[i] - z)  * SETTLE; pz[i] = z;
      }
      var x1 = x * cosY - z * sinY;
      var z1 = x * sinY + z * cosY;
      var y1 = yv * cosX - z1 * sinX;
      var z2 = yv * sinX + z1 * cosX;

      var s = PERSP / (PERSP + z2);
      sx[i] = cx + x1 * radius * s;
      sy[i] = cy + y1 * radius * s;

      var fade = 1 - (z2 + 1) / 2;               /* 1 front .. 0 back */
      sr[i] = (0.9 + fade * 2.0) * s;
      var b = (fade * BUCKETS) | 0;
      sb[i] = b > BUCKETS - 1 ? BUCKETS - 1 : (b < 0 ? 0 : b);
    }

    ctx.clearRect(0, 0, W, H);

    /* ---- Filaments: one batched stroke, front hemisphere ---- */
    ctx.strokeStyle = 'rgba(' + INK + ',0.05)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (var a2 = 0; a2 < COUNT; a2 += 3) {
      if (sb[a2] < BUCKETS - 3) continue;          /* front-facing only */
      var ax2 = sx[a2], ay2 = sy[a2];
      for (var b2 = a2 + 1, end = a2 + 7; b2 < end && b2 < COUNT; b2++) {
        var dx = ax2 - sx[b2], dy = ay2 - sy[b2];
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
          ctx.moveTo(ax2, ay2);
          ctx.lineTo(sx[b2], sy[b2]);
        }
      }
    }
    ctx.stroke();

    /* ---- Dots: one fill per depth bucket -------------------- */
    for (var bkt = 0; bkt < BUCKETS; bkt++) {
      ctx.fillStyle = palette[bkt];
      ctx.beginPath();
      for (var k = 0; k < COUNT; k++) {
        if (sb[k] !== bkt) continue;
        var rr = sr[k];
        ctx.moveTo(sx[k] + rr, sy[k]);
        ctx.arc(sx[k], sy[k], rr, 0, TAU);
      }
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  /* ---- Wire up --------------------------------------------- */
  build();
  resize();
  window.addEventListener('resize', resize);

  if (reduced) {
    frame();          /* single static paint */
    stop();
    return;
  }

  window.addEventListener('mousemove', function (e) {
    mouse.tx = (e.clientX / window.innerWidth - 0.5);
    mouse.ty = (e.clientY / window.innerHeight - 0.5);
  });

  /* Pause when scrolled off-screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
  } else {
    start();
  }
}());
