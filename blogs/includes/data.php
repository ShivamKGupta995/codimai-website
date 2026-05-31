<?php
/**
 * Blog data access layer — swap the source here without touching templates.
 * Currently reads from flat JSON files in blogs/posts/.
 */

define('POSTS_DIR', __DIR__ . '/../posts/');

/**
 * Returns an array of all post metadata, sorted newest-first.
 * Each item: [slug, title, date, description, author, image]
 */
function get_all_posts(): array {
    $posts = [];
    foreach (glob(POSTS_DIR . '*.json') as $file) {
        $data = json_decode(file_get_contents($file), true);
        if ($data) {
            $data['slug'] = basename($file, '.json');
            $posts[] = $data;
        }
    }
    usort($posts, fn($a, $b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));
    return $posts;
}

/**
 * Returns a single post by slug, or null if not found.
 */
function get_post(string $slug): ?array {
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));
    $file = POSTS_DIR . $slug . '.json';
    if (!file_exists($file)) return null;
    $data = json_decode(file_get_contents($file), true);
    if ($data) $data['slug'] = $slug;
    return $data ?: null;
}
