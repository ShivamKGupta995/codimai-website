<?php
/**
 * Dynamic XML sitemap  marketing pages + every published blog post.
 * Served at /sitemap.xml via a root .htaccess rewrite.
 *
 * Robust by design: the static marketing URLs are always emitted, so a
 * database outage degrades to a still-valid sitemap (it just falls back
 * to the pre-rendered post directories for the blog entries).
 */
ini_set('display_errors', '0');
require_once __DIR__ . '/../config.php';   // SITE_URL + DB_* constants

header('Content-Type: application/xml; charset=utf-8');

$base     = public_base_url();                   // correct host even if env is missing
$blogsDir = __DIR__ . '/../../';                 // repo .../blogs/

/* Stable marketing pages (clean URLs). */
$static = [
    ['/',                    '1.0', 'weekly'],
    ['/ai/agentic-ai',       '0.9', 'monthly'],
    ['/ai/generative',       '0.9', 'monthly'],
    ['/ai/insights',         '0.8', 'monthly'],
    ['/ai/recommendation',   '0.8', 'monthly'],
    ['/ai/prediction',       '0.8', 'monthly'],
    ['/ai/data-analytics',   '0.8', 'monthly'],
    /* /agents/whatsapp is 301'd to waco.codimai.com — never list a redirect */
    ['/agents/email',        '0.8', 'monthly'],
    ['/agents/google-review','0.8', 'monthly'],
    ['/agents/blogs-agent',  '0.8', 'monthly'],
    ['/get-started',         '0.9', 'monthly'],
    ['/blogs/',              '0.7', 'weekly'],

    /* SEO landing pages */
    ['/ai-agent-development',     '0.9', 'monthly'],
    ['/agentic-ai-development',   '0.9', 'monthly'],
    ['/generative-ai-services',   '0.9', 'monthly'],
    ['/ai-consulting',            '0.9', 'monthly'],
    ['/ai-automation-services',   '0.9', 'monthly'],
    ['/ai-chatbot-development',   '0.9', 'monthly'],
    ['/whatsapp-ai-agent',        '0.9', 'monthly'],
    ['/email-ai-agent',           '0.9', 'monthly'],
    ['/customer-support-ai',      '0.9', 'monthly'],
    ['/predictive-analytics',     '0.9', 'monthly'],
];

$urls = [];
foreach ($static as $s) {
    $urls[] = ['loc' => $base . $s[0], 'priority' => $s[1], 'changefreq' => $s[2], 'lastmod' => null];
}

/* Link each post to whichever URL actually resolves:
   a pre-rendered /blogs/<slug>/ directory if one exists, else the
   dynamic /blogs/post.php?slug=<slug> route. */
function post_loc(string $base, string $blogsDir, string $slug): string {
    return is_file($blogsDir . $slug . '/index.html')
        ? $base . '/blogs/' . $slug . '/'
        : $base . '/blogs/post.php?slug=' . rawurlencode($slug);
}

$seen = [];   // slugs already added, to de-dupe DB posts vs on-disk pages

/* Published posts from the database (if reachable). */
try {
    $dsn  = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);
    $db   = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $rows = $db->query(
        "SELECT slug, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC"
    )->fetchAll();
    foreach ($rows as $r) {
        $seen[$r['slug']] = true;
        $urls[] = [
            'loc'        => post_loc($base, $blogsDir, $r['slug']),
            'priority'   => '0.6',
            'changefreq' => 'monthly',
            'lastmod'    => !empty($r['published_at']) ? date('Y-m-d', strtotime($r['published_at'])) : null,
        ];
    }
} catch (Throwable $e) {
    error_log('sitemap.php: DB unavailable  ' . $e->getMessage());
}

/* Always include pre-rendered blog post pages on disk (not in the DB),
   so hand-built posts are crawled regardless of DB state. */
foreach (glob($blogsDir . '*/index.html') as $f) {
    $slug = basename(dirname($f));
    if (in_array($slug, ['includes', 'backend', 'posts'], true)) continue;
    if (isset($seen[$slug])) continue;
    $urls[] = [
        'loc'        => $base . '/blogs/' . $slug . '/',
        'priority'   => '0.6',
        'changefreq' => 'monthly',
        'lastmod'    => date('Y-m-d', filemtime($f)),
    ];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $u) {
    echo '  <url><loc>' . htmlspecialchars($u['loc'], ENT_XML1) . '</loc>';
    if (!empty($u['lastmod'])) echo '<lastmod>' . $u['lastmod'] . '</lastmod>';
    echo '<changefreq>' . $u['changefreq'] . '</changefreq>';
    echo '<priority>' . $u['priority'] . '</priority></url>' . "\n";
}
echo '</urlset>' . "\n";
