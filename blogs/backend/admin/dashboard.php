<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
requireLogin();

$db     = getDb();
$filter = $_GET['status'] ?? 'all';
$search = trim($_GET['q'] ?? '');

$where  = ['1=1'];
$params = [];
if ($filter !== 'all') { $where[] = 'p.status=:st'; $params[':st'] = $filter; }
if ($search)           { $where[] = 'p.title LIKE :q'; $params[':q'] = '%'.$search.'%'; }
$cond = implode(' AND ', $where);

$stmt = $db->prepare("SELECT p.id, p.title, p.slug, p.status, p.author_name, p.published_at, p.read_time, c.name AS category
                      FROM posts p LEFT JOIN categories c ON p.category_id=c.id
                      WHERE $cond ORDER BY p.id DESC");
$stmt->execute($params);
$posts = $stmt->fetchAll();

$totals = $db->query("SELECT status, COUNT(*) AS n FROM posts GROUP BY status")->fetchAll();
$counts = ['all' => 0, 'published' => 0, 'draft' => 0];
foreach ($totals as $r) { $counts[$r['status']] = $r['n']; $counts['all'] += $r['n']; }

/* New contacts badge (table may not exist yet) */
$newContacts = 0;
try {
    $newContacts = (int)$db->query("SELECT COUNT(*) FROM contacts WHERE status='new'")->fetchColumn();
} catch (PDOException) { /* table not created yet */ }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Dashboard  CodimAI Blog Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <meta name="robots" content="noindex, nofollow"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F7F5F0; color: #1A1A18; display: flex; min-height: 100vh; }
    .sidebar { width: 220px; background: #1A1A18; color: rgba(255,255,255,.7); display: flex; flex-direction: column; flex-shrink: 0; position: fixed; top: 0; bottom: 0; left: 0; overflow-y: auto; }
    .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,.08); color: #F7F5F0; text-decoration: none; font-weight: 600; font-size: .95rem; }
    .sidebar-dot { width: 8px; height: 8px; border-radius: 50%; background: #F7F5F0; }
    .sidebar-label { font-size: .62rem; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.3); padding: 20px 20px 8px; }
    .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 20px; font-size: .86rem; font-weight: 500; color: rgba(255,255,255,.55); text-decoration: none; border-left: 3px solid transparent; transition: all .15s; }
    .sidebar-link:hover { color: #fff; background: rgba(255,255,255,.05); }
    .sidebar-link.active { color: #F7F5F0; border-left-color: #F7F5F0; background: rgba(255,255,255,.07); }
    .sidebar-footer { margin-top: auto; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,.08); }
    .sidebar-footer a { font-size: .8rem; color: rgba(255,255,255,.35); text-decoration: none; }
    .sidebar-footer a:hover { color: rgba(255,255,255,.7); }
    .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
    .topbar { background: #fff; border-bottom: 1px solid #EFEDE6; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .topbar h1 { font-size: .95rem; font-weight: 600; color: #1A1A18; }
    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px; font-family: inherit; font-size: .84rem; font-weight: 500; cursor: pointer; text-decoration: none; border: none; transition: all .15s; }
    .btn-primary { background: #1A1A18; color: #F7F5F0; }
    .btn-primary:hover { opacity: .85; }
    .btn-outline { border: 1.5px solid #EFEDE6; background: #fff; color: #3A3A36; }
    .btn-outline:hover { border-color: #1A1A18; color: #1A1A18; }
    .btn-danger { background: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; }
    .btn-danger:hover { background: #EF4444; color: #fff; }
    .btn-sm { padding: 6px 12px; font-size: .78rem; }
    .content { padding: 32px; flex: 1; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #fff; border: 1px solid #EFEDE6; border-radius: 10px; padding: 20px 22px; }
    .stat-card .s-label { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #86847C; margin-bottom: 8px; }
    .stat-card .s-val   { font-size: 1.8rem; font-weight: 600; color: #1A1A18; letter-spacing: -.02em; }
    .stat-card .s-sub   { font-size: .74rem; color: #86847C; margin-top: 4px; }
    .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-bar input[type=search] { flex: 1; min-width: 200px; padding: 9px 14px; font-family: inherit; font-size: .86rem; border: 1.5px solid #EFEDE6; border-radius: 8px; color: #1A1A18; outline: none; }
    .filter-bar input:focus { border-color: #1A1A18; }
    .filter-bar select { padding: 9px 14px; font-family: inherit; font-size: .86rem; border: 1.5px solid #EFEDE6; border-radius: 8px; color: #3A3A36; background: #fff; outline: none; cursor: pointer; }
    .table-wrap { background: #fff; border: 1px solid #EFEDE6; border-radius: 10px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #F7F5F0; padding: 12px 18px; text-align: left; font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #86847C; border-bottom: 1px solid #EFEDE6; white-space: nowrap; }
    tbody td { padding: 14px 18px; border-bottom: 1px solid #F7F5F0; font-size: .86rem; color: #3A3A36; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #F7F5F0; }
    .post-title strong { display: block; font-size: .9rem; color: #1A1A18; font-weight: 500; margin-bottom: 2px; }
    .post-title span { font-size: .74rem; color: #86847C; }
    .badge { display: inline-block; padding: 3px 9px; border-radius: 12px; font-size: .68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .badge-published { background: rgba(26,26,24,.08); color: #1A1A18; }
    .badge-draft     { background: #F7F5F0; color: #86847C; }
    .actions { display: flex; align-items: center; gap: 6px; }
    .empty-state { text-align: center; padding: 60px 24px; color: #86847C; font-size: .9rem; }
  </style>
</head>
<body>

<aside class="sidebar">
  <a href="dashboard.php" class="sidebar-logo">
    <span class="sidebar-dot"></span> CodimAI Blog
  </a>
  <div class="sidebar-label">Content</div>
  <a href="dashboard.php" class="sidebar-link active">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    All Posts
  </a>
  <a href="editor.php" class="sidebar-link">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    New Post
  </a>
  <div class="sidebar-label">CRM</div>
  <a href="contacts.php" class="sidebar-link" id="contacts-link">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    Contacts
    <?php if ($newContacts): ?>
    <span style="margin-left:auto;background:#F7F5F0;color:#1A1A18;font-size:.6rem;font-weight:700;padding:2px 6px;border-radius:10px"><?= $newContacts ?></span>
    <?php endif; ?>
  </a>
  <div class="sidebar-footer">
    <a href="logout.php">← Logout</a>
  </div>
</aside>

<div class="main">
  <div class="topbar">
    <h1>Blog Posts</h1>
    <a href="editor.php" class="btn btn-primary">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      New Post
    </a>
  </div>

  <div class="content">
    <div class="stats-row">
      <div class="stat-card">
        <div class="s-label">Total Posts</div>
        <div class="s-val"><?= $counts['all'] ?></div>
      </div>
      <div class="stat-card">
        <div class="s-label">Published</div>
        <div class="s-val"><?= $counts['published'] ?></div>
      </div>
      <div class="stat-card">
        <div class="s-label">Drafts</div>
        <div class="s-val"><?= $counts['draft'] ?></div>
        <div class="s-sub">Not yet live</div>
      </div>
    </div>

    <form method="GET" class="filter-bar">
      <input type="search" name="q" placeholder="Search posts…" value="<?= htmlspecialchars($search) ?>"/>
      <select name="status" onchange="this.form.submit()">
        <option value="all"       <?= $filter==='all'       ?'selected':''?>>All (<?= $counts['all'] ?>)</option>
        <option value="published" <?= $filter==='published' ?'selected':''?>>Published (<?= $counts['published'] ?>)</option>
        <option value="draft"     <?= $filter==='draft'     ?'selected':''?>>Drafts (<?= $counts['draft'] ?>)</option>
      </select>
      <button type="submit" class="btn btn-outline">Search</button>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Author</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if (!$posts): ?>
            <tr><td colspan="6">
              <div class="empty-state">No posts yet. <a href="editor.php" style="color:#1A1A18;text-decoration:underline">Create one →</a></div>
            </td></tr>
          <?php else: ?>
            <?php foreach ($posts as $p): ?>
            <tr>
              <td class="post-title">
                <strong><a href="editor.php?id=<?= $p['id'] ?>" style="color:inherit;text-decoration:none"><?= htmlspecialchars($p['title']) ?></a></strong>
                <span>/blogs/<?= htmlspecialchars($p['slug']) ?>/</span>
              </td>
              <td><?= htmlspecialchars($p['category'] ?? '') ?></td>
              <td><span class="badge badge-<?= $p['status'] ?>"><?= ucfirst($p['status']) ?></span></td>
              <td><?= htmlspecialchars($p['author_name']) ?></td>
              <td><?= $p['published_at'] ? date('d M Y', strtotime($p['published_at'])) : '' ?></td>
              <td>
                <div class="actions">
                  <a href="editor.php?id=<?= $p['id'] ?>" class="btn btn-outline btn-sm">Edit</a>
                  <a href="/blogs/post.php?slug=<?= urlencode($p['slug']) ?>" target="_blank" class="btn btn-outline btn-sm">View</a>
                  <form method="POST" action="delete.php" onsubmit="return confirm('Delete this post? This cannot be undone.')">
                    <input type="hidden" name="id" value="<?= $p['id'] ?>"/>
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(getCsrfToken()) ?>"/>
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>
</body>
</html>
