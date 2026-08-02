<?php
require_once __DIR__ . '/backend/config.php';
require_once __DIR__ . '/backend/includes/db.php';

$slug = trim($_GET['slug'] ?? '');
if (!$slug) { header('Location: /blogs/'); exit; }

$db   = getDb();
$stmt = $db->prepare(
    "SELECT p.*, c.name AS category, c.slug AS category_slug
     FROM posts p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = :slug AND p.status = 'published'"
);
$stmt->execute([':slug' => $slug]);
$post = $stmt->fetch();

if (!$post) {
    http_response_code(404);
    $notFound = true;
} else {
    $notFound = false;
    $rel = $db->prepare(
        "SELECT p.slug, p.title, p.excerpt, p.published_at, p.read_time, c.name AS category
         FROM posts p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.status='published' AND p.category_id=? AND p.id!=?
         ORDER BY p.published_at DESC LIMIT 3"
    );
    $rel->execute([$post['category_id'], $post['id']]);
    $related = $rel->fetchAll();
}

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function fmtDate(string $d): string {
    return date('d M Y', strtotime($d));
}

$title    = $post['title']   ?? 'Post not found';
$desc     = $post['excerpt'] ?? '';
$pubDate  = $post['published_at'] ? date('Y-m-d', strtotime($post['published_at'])) : '';
$fmtPub   = $post['published_at'] ? fmtDate($post['published_at']) : '';
$category = $post['category'] ?? '';
$author   = $post['author_name'] ?? 'The CodimAI Team';
$readTime = $post['read_time'] ?? 1;
$lede     = $post['lede'] ?? $desc;
$siteUrl  = SITE_URL;
$canonical = $siteUrl . '/blogs/post.php?slug=' . urlencode($slug);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="icon" type="image/png" href="../assets/img/favicon.png">
  <link rel="apple-touch-icon" href="../assets/img/favicon.png">

  <title><?= h($title) ?> | CodimAI</title>
  <meta name="description" content="<?= h($desc) ?>">
  <link rel="canonical" href="<?= h($canonical) ?>">

  <meta property="og:type"        content="article">
  <meta property="og:site_name"   content="CodimAI">
  <meta property="og:url"         content="<?= h($canonical) ?>">
  <meta property="og:title"       content="<?= h($title) ?> | CodimAI">
  <meta property="og:description" content="<?= h($desc) ?>">
  <meta property="og:image"       content="<?= $post['thumbnail_url'] ? h($post['thumbnail_url']) : h($siteUrl . '/assets/img/og-default.png') ?>">
  <?php if ($pubDate): ?>
  <meta property="article:published_time" content="<?= h($pubDate) ?>">
  <?php endif; ?>
  <?php if ($category): ?>
  <meta property="article:section" content="<?= h($category) ?>">
  <?php endif; ?>

  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="<?= h($title) ?> | CodimAI">
  <meta name="twitter:description" content="<?= h($desc) ?>">
  <meta name="twitter:image"       content="<?= $post['thumbnail_url'] ? h($post['thumbnail_url']) : h($siteUrl . '/assets/img/og-default.png') ?>">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Inter:wght@400;500&family=JetBrains+Mono&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <style>html { scroll-snap-type: none; }</style>

  <?php if (!$notFound): ?>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "headline": <?= json_encode($title) ?>,
      "description": <?= json_encode($desc) ?>,
      "datePublished": "<?= h($pubDate) ?>",
      "dateModified":  "<?= h($pubDate) ?>",
      "author": {
        "@type": "Organization",
        "name": <?= json_encode($author) ?>,
        "url": "<?= h($siteUrl) ?>/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CodimAI",
        "url": "<?= h($siteUrl) ?>/"
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": "<?= h($canonical) ?>" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type":"ListItem","position":1,"name":"Home","item":"<?= h($siteUrl) ?>/" },
        { "@type":"ListItem","position":2,"name":"Blogs","item":"<?= h($siteUrl) ?>/blogs/" },
        { "@type":"ListItem","position":3,"name":<?= json_encode($title) ?>,"item":"<?= h($canonical) ?>" }
      ]
    }
  ]
}
  </script>
  <?php endif; ?>
</head>
<body>

  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header" role="banner">
    <div class="container site-header__inner">

      <a href="/" class="nav-logo" aria-label="CodimAI  home"><span class="nav-logo__mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><img src="../assets/img/logo-word.png" alt="" class="nav-logo__word" width="223" height="44"></a>

      <nav aria-label="Primary navigation">
        <ul class="nav-links" role="list">
          <li><a href="/">Home</a></li>
          <li class="nav-dropdown">
            <button class="nav-btn-ghost" aria-haspopup="true" aria-expanded="false">AI</button>
            <ul class="nav-dropdown__menu" role="menu">
              <li role="none"><a href="/ai/agentic-ai"     role="menuitem">Agentic AI</a></li>
              <li role="none"><a href="/ai/generative"     role="menuitem">Generative</a></li>
              <li role="none"><a href="/ai/insights"       role="menuitem">Insights</a></li>
              <li role="none"><a href="/ai/recommendation" role="menuitem">Recommendation</a></li>
              <li role="none"><a href="/ai/prediction"     role="menuitem">Prediction</a></li>
              <li role="none"><a href="/ai/data-analytics" role="menuitem">Data Analytics</a></li>
            </ul>
          </li>
          <li class="nav-dropdown">
            <button class="nav-btn-ghost" aria-haspopup="true" aria-expanded="false">Agents</button>
            <ul class="nav-dropdown__menu" role="menu">
              <li role="none"><a href="https://waco.codimai.com"      role="menuitem">WhatsApp</a></li>
              <li role="none"><a href="/agents/email"         role="menuitem">Email</a></li>
              <li role="none"><a href="/agents/google-review" role="menuitem">Google Review</a></li>
              <li role="none"><a href="/agents/blogs-agent"   role="menuitem">Blogs Agent</a></li>
            </ul>
          </li>
          <li><a href="./" aria-current="page">Blogs</a></li>
        </ul>
      </nav>

      <a href="/get-started" class="cd-btn-primary nav-cta">Get Started</a>

      <button class="nav-hamburger" aria-expanded="false" aria-controls="nav-mobile-overlay" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div id="nav-mobile-overlay" class="nav-mobile-overlay" role="navigation" aria-label="Mobile navigation">
    <a href="/">Home</a>
    <button class="nav-btn-ghost" aria-expanded="false">AI</button>
    <ul class="nav-mobile-submenu">
      <li><a href="/ai/agentic-ai">Agentic AI</a></li>
      <li><a href="/ai/generative">Generative</a></li>
      <li><a href="/ai/insights">Insights</a></li>
      <li><a href="/ai/recommendation">Recommendation</a></li>
      <li><a href="/ai/prediction">Prediction</a></li>
      <li><a href="/ai/data-analytics">Data Analytics</a></li>
    </ul>
    <button class="nav-btn-ghost" aria-expanded="false">Agents</button>
    <ul class="nav-mobile-submenu">
      <li><a href="https://waco.codimai.com">WhatsApp</a></li>
      <li><a href="/agents/email">Email</a></li>
      <li><a href="/agents/google-review">Google Review</a></li>
      <li><a href="/agents/blogs-agent">Blogs Agent</a></li>
    </ul>
    <a href="./">Blogs</a>
    <a href="/get-started" class="nav-mobile-cta">Get Started</a>
    <button class="nav-mobile-close" aria-label="Close menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>

  <main id="main-content">

  <?php if ($notFound): ?>

    <section class="post-hero">
      <div class="container">
        <a href="./" class="post-hero__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
          All posts
        </a>
        <h1 class="post-hero__title">Post not found</h1>
        <p class="post-hero__lede">The post you're looking for doesn't exist or has been removed.</p>
        <a href="./" class="cd-btn-primary" style="margin-top:2rem;display:inline-block">Back to blog</a>
      </div>
    </section>

  <?php else: ?>

    <article>

      <header class="post-hero">
        <div class="container">
          <a href="./" class="post-hero__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
            All posts
          </a>
          <p class="post-hero__meta">
            <?php if ($fmtPub): ?>
            <time datetime="<?= h($pubDate) ?>"><?= h($fmtPub) ?></time>
            <span aria-hidden="true">·</span>
            <?php endif; ?>
            <?php if ($category): ?>
            <span><?= h($category) ?></span>
            <span aria-hidden="true">·</span>
            <?php endif; ?>
            <span><?= (int)$readTime ?> min read</span>
          </p>
          <h1 class="post-hero__title"><?= h($title) ?></h1>
          <p class="post-hero__lede"><?= h($lede) ?></p>
          <?php if (!empty($post['thumbnail_url'])): ?>
          <div class="post-hero__thumb">
            <img src="<?= h($post['thumbnail_url']) ?>" alt="<?= h($title) ?>" loading="eager">
          </div>
          <?php endif; ?>
        </div>
      </header>

      <div class="post-article">
        <div class="container">
          <div class="post-layout">

            <div class="post-body" id="post-body">
              <?= $post['content'] /* HTML from Quill  trusted admin content */ ?>
            </div>

            <aside class="post-toc-aside" id="post-toc-aside" aria-label="Table of contents" hidden>
              <p class="post-toc-aside__heading">Table of contents</p>
              <ol class="post-toc-aside__list" id="post-toc-list"></ol>
            </aside>

          </div>
        </div>
      </div>

    </article>

    <?php if ($related): ?>
    <section class="post-related" aria-labelledby="related-heading">
      <div class="container">
        <h2 id="related-heading" class="post-related__heading">Related posts</h2>
        <div class="blog-index__grid" style="margin-top:2rem">
          <?php foreach ($related as $r): ?>
          <article class="blog-card" role="listitem">
            <a href="post.php?slug=<?= urlencode($r['slug']) ?>" class="blog-card__thumb-wrap" tabindex="-1" aria-hidden="true">
              <div class="blog-card__placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <?php if ($r['category']): ?>
              <span class="blog-card__cat"><?= h($r['category']) ?></span>
              <?php endif; ?>
            </a>
            <div class="blog-card__body">
              <h3 class="blog-card__title">
                <a href="post.php?slug=<?= urlencode($r['slug']) ?>"><?= h($r['title']) ?></a>
              </h3>
              <?php if ($r['excerpt']): ?>
              <p class="blog-card__excerpt"><?= h($r['excerpt']) ?></p>
              <?php endif; ?>
              <div class="blog-card__footer">
                <?php if ($r['published_at']): ?>
                <time class="blog-card__date"><?= fmtDate($r['published_at']) ?></time>
                <?php endif; ?>
                <span class="blog-card__read-cta">Read <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
              </div>
            </div>
          </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>
    <?php endif; ?>

  <?php endif; ?>

  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <a href="/" class="nav-logo" aria-label="CodimAI  home"><span class="nav-logo__mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><img src="../assets/img/logo-word.png" alt="CodimAI" class="nav-logo__word" width="160" height="32"></a>
        <p class="site-footer__tagline">Frontier AI built for the real world.</p>
      </div>
      <nav class="site-footer__nav" aria-label="Footer navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/ai/agentic-ai">Agentic AI</a></li>
          <li><a href="https://waco.codimai.com">Agents</a></li>
          <li><a href="./">Blog</a></li>
          <li><a href="/get-started">Get Started</a></li>
        </ul>
      </nav>
    </div>
    <div class="container site-footer__bottom">
      <p>&copy; <?= date('Y') ?> CodimAI. All rights reserved.</p>
    </div>
  </footer>

  <script src="../assets/js/nav.js" defer></script>

  <script>
  (function () {
    var body    = document.getElementById('post-body');
    var aside   = document.getElementById('post-toc-aside');
    var tocList = document.getElementById('post-toc-list');
    if (!body || !aside || !tocList) return;

    var headings = Array.from(body.querySelectorAll('h2, h3'));
    if (headings.length < 2) return;

    /* Assign IDs */
    var used = {};
    headings.forEach(function (h) {
      if (h.id) return;
      var base = h.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
      var id = base, n = 1;
      while (used[id]) { id = base + '-' + (++n); }
      used[id] = true;
      h.id = id;
    });

    /* Build sidebar TOC */
    var links = [];
    tocList.innerHTML = headings.map(function (h) {
      var isH3 = h.tagName === 'H3';
      return '<li class="post-toc-aside__item' + (isH3 ? ' toc-h3' : '') + '">' +
               '<a class="post-toc-aside__link" href="#' + h.id + '">' +
                 h.textContent.trim() +
               '</a></li>';
    }).join('');

    links = Array.from(tocList.querySelectorAll('.post-toc-aside__link'));
    aside.removeAttribute('hidden');

    /* Smooth scroll */
    aside.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', a.getAttribute('href'));
    });

    /* Active section tracking via IntersectionObserver */
    var activeId = '';

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

      headings.forEach(function (h) { io.observe(h); });
    }
  }());
  </script>

</body>
</html>
