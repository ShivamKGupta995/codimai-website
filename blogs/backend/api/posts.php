<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e) {
    error_log('posts.php exception: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    while (ob_get_level() > 0) { ob_end_clean(); }
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Server error']);
});

register_shutdown_function(function () {
    $err = error_get_last();
    if (!$err) return;
    $fatal = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];
    if (!in_array($err['type'], $fatal, true)) return;
    error_log('posts.php fatal: ' . $err['message'] . ' @ ' . $err['file'] . ':' . $err['line']);
    while (ob_get_level() > 0) { ob_end_clean(); }
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Server error']);
});

require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

setCors();
header('Content-Type: application/json; charset=utf-8');

$method   = strtoupper($_SERVER['REQUEST_METHOD']);
$override = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? $_GET['_method'] ?? '';
if ($method === 'POST' && $override !== '') {
    $override = strtoupper($override);
    if (in_array($override, ['PUT', 'DELETE'], true)) $method = $override;
}

/* ── GET: list posts ─────────────────────────────────────── */
if ($method === 'GET') {
    $db       = getDb();
    $status   = $_GET['status']   ?? 'published';
    $category = $_GET['category'] ?? '';
    $search   = $_GET['search']   ?? '';
    $page     = max(1, (int)($_GET['page']  ?? 1));
    $limit    = min(50, max(1, (int)($_GET['limit'] ?? 12)));
    $offset   = ($page - 1) * $limit;

    if ($status !== 'published' && !isLoggedIn()) {
        $status = 'published';
    }

    $where  = ['1=1'];
    $params = [];

    if ($status !== 'all') {
        $where[]         = 'p.status = :status';
        $params[':status'] = $status;
    }
    if ($category !== '' && $category !== 'all') {
        $where[]      = 'c.name = :cat';
        $params[':cat'] = $category;
    }
    if ($search !== '') {
        $where[]       = '(p.title LIKE :q OR p.excerpt LIKE :q2)';
        $params[':q']  = '%' . $search . '%';
        $params[':q2'] = '%' . $search . '%';
    }

    $cond = implode(' AND ', $where);

    $stmt = $db->prepare("SELECT COUNT(*) FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE $cond");
    $stmt->execute($params);
    $total = (int) $stmt->fetchColumn();

    $sql = "SELECT p.id, p.title, p.slug, p.excerpt, p.thumbnail_url,
                   p.author_name, p.author_role, p.published_at, p.read_time,
                   p.status, c.name AS category
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE $cond
            ORDER BY p.published_at DESC
            LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $posts = $stmt->fetchAll();

    jsonOut([
        'posts'      => $posts,
        'total'      => $total,
        'page'       => $page,
        'limit'      => $limit,
        'totalPages' => (int) ceil($total / $limit),
    ]);
}

/* ── POST: create post (admin only) ─────────────────────── */
if ($method === 'POST') {
    if (!isLoggedIn()) jsonError('Unauthorized', 401);
    verifyCsrf();

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError('Invalid JSON body');

    foreach (['title', 'content', 'category_id'] as $f) {
        if (empty($body[$f])) jsonError("Field '$f' is required");
    }

    $db    = getDb();
    $title = trim($body['title']);
    $slug  = !empty($body['slug']) ? trim($body['slug']) : makeSlug($title);

    $base = $slug; $i = 1;
    do {
        $stmt = $db->prepare('SELECT id FROM posts WHERE slug=?');
        $stmt->execute([$slug]);
        if (!$stmt->fetchColumn()) break;
        $slug = $base . '-' . $i++;
    } while (true);

    $content  = $body['content'];
    $readTime = calcReadTime($content);
    $status   = in_array($body['status'] ?? '', ['draft','published']) ? $body['status'] : 'draft';
    $pubAt    = $status === 'published' ? ($body['published_at'] ?? date('Y-m-d H:i:s')) : null;

    $stmt = $db->prepare("INSERT INTO posts
        (title,slug,content,excerpt,thumbnail_url,category_id,
         author_name,author_role,author_bio,status,
         meta_title,meta_description,tags,read_time,published_at)
        VALUES
        (:title,:slug,:content,:excerpt,:thumb,:cat,
         :aname,:arole,:abio,:status,
         :mtitle,:mdesc,:tags,:rt,:pubat)");

    $stmt->execute([
        ':title'   => $title,
        ':slug'    => $slug,
        ':content' => $content,
        ':excerpt' => trim($body['excerpt'] ?? ''),
        ':thumb'   => $body['thumbnail_url'] ?? null,
        ':cat'     => (int)$body['category_id'],
        ':aname'   => trim($body['author_name'] ?? 'The CodimAI Team'),
        ':arole'   => trim($body['author_role'] ?? ''),
        ':abio'    => trim($body['author_bio']  ?? ''),
        ':status'  => $status,
        ':mtitle'  => trim($body['meta_title'] ?? $title),
        ':mdesc'   => trim($body['meta_description'] ?? $body['excerpt'] ?? ''),
        ':tags'    => trim($body['tags'] ?? ''),
        ':rt'      => $readTime,
        ':pubat'   => $pubAt,
    ]);

    jsonOut(['success' => true, 'id' => (int)$db->lastInsertId(), 'slug' => $slug], 201);
}

/* ── PUT: update post ───────────────────────────────────── */
if ($method === 'PUT') {
    if (!isLoggedIn()) jsonError('Unauthorized', 401);
    verifyCsrf();

    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Missing post id');

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError('Invalid JSON body');

    $db      = getDb();
    $content = $body['content'] ?? '';
    $status  = in_array($body['status'] ?? '', ['draft','published']) ? $body['status'] : 'draft';
    $pubAtIfPublishing = $status === 'published' ? date('Y-m-d H:i:s') : null;

    $stmt = $db->prepare("UPDATE posts SET
        title=:title, content=:content, excerpt=:excerpt,
        thumbnail_url=:thumb, category_id=:cat,
        author_name=:aname, author_role=:arole, author_bio=:abio,
        status=:status, meta_title=:mtitle, meta_description=:mdesc,
        tags=:tags, read_time=:rt,
        published_at = COALESCE(published_at, :pubat)
        WHERE id=:id");

    $stmt->execute([
        ':title'   => trim($body['title'] ?? ''),
        ':content' => $content,
        ':excerpt' => trim($body['excerpt'] ?? ''),
        ':thumb'   => $body['thumbnail_url'] ?? null,
        ':cat'     => (int)($body['category_id'] ?? 1),
        ':aname'   => trim($body['author_name'] ?? 'The CodimAI Team'),
        ':arole'   => trim($body['author_role'] ?? ''),
        ':abio'    => trim($body['author_bio']  ?? ''),
        ':status'  => $status,
        ':mtitle'  => trim($body['meta_title'] ?? $body['title'] ?? ''),
        ':mdesc'   => trim($body['meta_description'] ?? ''),
        ':tags'    => trim($body['tags'] ?? ''),
        ':rt'      => calcReadTime($content),
        ':pubat'   => $pubAtIfPublishing,
        ':id'      => $id,
    ]);

    jsonOut(['success' => true]);
}

/* ── DELETE ──────────────────────────────────────────────── */
if ($method === 'DELETE') {
    if (!isLoggedIn()) jsonError('Unauthorized', 401);
    verifyCsrf();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Missing post id');
    $db = getDb();
    $db->prepare('DELETE FROM posts WHERE id=?')->execute([$id]);
    jsonOut(['success' => true]);
}

jsonError('Method not allowed', 405);
