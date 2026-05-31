<?php
/**
 * Shared <head> for PHP blog pages.
 * Caller must define: $pageTitle, $pageDesc, $canonicalUrl, $ogImage, $jsonLd (optional)
 */
?>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Favicon — CodimAI bar mark -->
  <link rel="icon" type="image/png" href="/assets/img/favicon.png">
  <link rel="apple-touch-icon" href="/assets/img/favicon.png">

  <title><?= htmlspecialchars($pageTitle) ?> | CodimAI</title>
  <meta name="description" content="<?= htmlspecialchars($pageDesc) ?>">
  <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl) ?>">

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="CodimAI">
  <meta property="og:title"       content="<?= htmlspecialchars($pageTitle) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($pageDesc) ?>">
  <meta property="og:url"         content="<?= htmlspecialchars($canonicalUrl) ?>">
  <meta property="og:image"       content="<?= htmlspecialchars($ogImage ?? '/assets/img/og-default.jpg') ?>">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="<?= htmlspecialchars($pageTitle) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($pageDesc) ?>">
  <meta name="twitter:image"       content="<?= htmlspecialchars($ogImage ?? '/assets/img/og-default.jpg') ?>">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Inter:wght@400;500&family=JetBrains+Mono&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/components.css">

<?php if (!empty($jsonLd)): ?>
  <script type="application/ld+json"><?= $jsonLd ?></script>
<?php endif; ?>
