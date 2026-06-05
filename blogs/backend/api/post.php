<?php
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';

setCors();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$slug = trim($_GET['slug'] ?? '');
$id   = (int)($_GET['id']   ?? 0);

if (!$slug && !$id) jsonError('Provide slug or id');

$db  = getDb();
$sql = "SELECT p.*, c.name AS category
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'published'";

if ($slug) {
    $sql  .= ' AND p.slug = :val';
    $param = [':val' => $slug];
} else {
    $sql  .= ' AND p.id = :val';
    $param = [':val' => $id];
}

$stmt = $db->prepare($sql);
$stmt->execute($param);
$post = $stmt->fetch();

if (!$post) jsonError('Post not found', 404);

$post['tags'] = $post['tags']
    ? array_filter(array_map('trim', explode(',', $post['tags'])))
    : [];

/* Related posts: same category, excluding this post */
$rel = $db->prepare("SELECT p.slug, p.title, p.excerpt, p.thumbnail_url,
                            p.author_name, p.published_at, p.read_time,
                            c.name AS category
                     FROM posts p
                     LEFT JOIN categories c ON p.category_id = c.id
                     WHERE p.status='published' AND p.category_id=? AND p.id!=?
                     ORDER BY p.published_at DESC LIMIT 3");
$rel->execute([$post['category_id'], $post['id']]);
$post['related'] = $rel->fetchAll();

jsonOut(['post' => $post]);
