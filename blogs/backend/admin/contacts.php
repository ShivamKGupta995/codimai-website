<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
requireLogin();

$db = getDb();

/* Ensure table is up to date */
$db->exec("CREATE TABLE IF NOT EXISTS contacts (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    company    VARCHAR(150)  DEFAULT '',
    team_size  VARCHAR(30)   DEFAULT '',
    interest   VARCHAR(100)  NOT NULL,
    message    TEXT,
    notes      TEXT,
    status     ENUM('new','in_progress','responded') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email  (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

/* ── AJAX POST handler ──────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    /* verifyCsrf() reads $_POST['csrf_token'] or X-CSRF-Token header itself;
       it exits with 403 on failure, returns void on success. */
    verifyCsrf();

    $id = (int)($_POST['id'] ?? 0);
    if (!$id) { echo json_encode(['error' => 'Missing id']); exit; }

    if ($_POST['action'] === 'update_status') {
        $allowed = ['new', 'in_progress', 'responded'];
        $status  = $_POST['status'] ?? '';
        if (!in_array($status, $allowed, true)) {
            echo json_encode(['error' => 'Invalid status']); exit;
        }
        $db->prepare("UPDATE contacts SET status=? WHERE id=?")->execute([$status, $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($_POST['action'] === 'save_notes') {
        $notes = trim($_POST['notes'] ?? '');
        $db->prepare("UPDATE contacts SET notes=? WHERE id=?")->execute([$notes, $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['error' => 'Unknown action']); exit;
}

/* ── CSV export ─────────────────────────────────────────── */
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    $rows = $db->query(
        "SELECT name, email, company, team_size, interest, message, notes, status, created_at
         FROM contacts ORDER BY created_at DESC"
    )->fetchAll();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="contacts-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Name','Email','Company','Team Size','Interest','Message','Notes','Status','Date']);
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['name'], $r['email'], $r['company'], $r['team_size'],
            $r['interest'], $r['message'], $r['notes'] ?? '',
            $r['status'], date('d M Y H:i', strtotime($r['created_at']))
        ]);
    }
    fclose($out); exit;
}

/* ── List ───────────────────────────────────────────────── */
$filter = $_GET['status'] ?? 'all';
$search = trim($_GET['q'] ?? '');

$where  = ['1=1'];
$params = [];
if ($filter !== 'all')   { $where[] = 'status = :st'; $params[':st'] = $filter; }
if ($search)             { $where[] = '(name LIKE :q OR email LIKE :q OR company LIKE :q)'; $params[':q'] = '%'.$search.'%'; }
$cond = implode(' AND ', $where);

$stmt = $db->prepare("SELECT * FROM contacts WHERE $cond ORDER BY created_at DESC");
$stmt->execute($params);
$contacts = $stmt->fetchAll();

$totals = $db->query("SELECT status, COUNT(*) AS n FROM contacts GROUP BY status")->fetchAll();
$counts = ['all' => 0, 'new' => 0, 'in_progress' => 0, 'responded' => 0];
foreach ($totals as $r) { $counts[$r['status']] = (int)$r['n']; $counts['all'] += (int)$r['n']; }

$csrf = getCsrfToken();

$statusLabel = ['new' => 'New', 'in_progress' => 'In Progress', 'responded' => 'Responded'];
$statusNext  = ['new' => 'in_progress', 'in_progress' => 'responded', 'responded' => 'new'];
$statusBtn   = ['new' => 'Start', 'in_progress' => 'Mark responded', 'responded' => 'Reopen'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Contacts  CodimAI Admin</title>
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
    .btn-sm { padding: 6px 12px; font-size: .78rem; }
    .content { padding: 32px; flex: 1; }
    .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #fff; border: 1px solid #EFEDE6; border-radius: 10px; padding: 20px 22px; }
    .stat-card .s-label { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #86847C; margin-bottom: 8px; }
    .stat-card .s-val   { font-size: 1.8rem; font-weight: 600; color: #1A1A18; letter-spacing: -.02em; }
    .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-bar input[type=search] { flex: 1; min-width: 200px; padding: 9px 14px; font-family: inherit; font-size: .86rem; border: 1.5px solid #EFEDE6; border-radius: 8px; color: #1A1A18; outline: none; }
    .filter-bar input:focus { border-color: #1A1A18; }
    .filter-bar select { padding: 9px 14px; font-family: inherit; font-size: .86rem; border: 1.5px solid #EFEDE6; border-radius: 8px; color: #3A3A36; background: #fff; outline: none; cursor: pointer; }
    .table-wrap { background: #fff; border: 1px solid #EFEDE6; border-radius: 10px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #F7F5F0; padding: 11px 16px; text-align: left; font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #86847C; border-bottom: 1px solid #EFEDE6; white-space: nowrap; }
    tbody td { padding: 0; border-bottom: 1px solid #F7F5F0; vertical-align: top; }
    tbody tr:last-child td { border-bottom: none; }
    .td-inner { padding: 14px 16px; }
    /* expanded row for notes */
    .notes-row td { border-bottom: 1px solid #F7F5F0; background: #FAFAF8; }
    .notes-row.hidden { display: none; }
    .contact-name { font-size: .88rem; font-weight: 500; color: #1A1A18; }
    .contact-sub  { font-size: .74rem; color: #86847C; margin-top: 2px; line-height: 1.4; }
    .msg-text { font-size: .8rem; color: #86847C; max-width: 200px; word-break: break-word; line-height: 1.5; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: .67rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    .badge-new         { background: #FFF3CD; color: #856404; }
    .badge-in_progress { background: #DBEAFE; color: #1D4ED8; }
    .badge-responded   { background: #D1FAE5; color: #065F46; }
    .status-btn { padding: 5px 11px; border-radius: 6px; font-family: inherit; font-size: .74rem; font-weight: 500; cursor: pointer; border: 1.5px solid #EFEDE6; background: #fff; color: #3A3A36; transition: all .15s; white-space: nowrap; }
    .status-btn:hover { border-color: #1A1A18; color: #1A1A18; }
    .status-btn:disabled { opacity: .4; cursor: not-allowed; }
    .notes-toggle { background: none; border: none; cursor: pointer; color: #86847C; font-size: .78rem; padding: 4px 8px; border-radius: 5px; font-family: inherit; transition: all .15s; }
    .notes-toggle:hover { color: #1A1A18; background: #F7F5F0; }
    .notes-area { width: 100%; min-height: 80px; padding: 10px 14px; font-family: inherit; font-size: .85rem; line-height: 1.6; border: 1.5px solid #EFEDE6; border-radius: 8px; resize: vertical; color: #1A1A18; background: #fff; outline: none; }
    .notes-area:focus { border-color: #1A1A18; }
    .notes-save-msg { font-size: .74rem; color: #065F46; margin-top: 6px; min-height: 1rem; }
    .empty-state { text-align: center; padding: 60px 24px; color: #86847C; font-size: .9rem; }
    @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2,1fr); } }
  </style>
</head>
<body>

<aside class="sidebar">
  <a href="dashboard.php" class="sidebar-logo"><span class="sidebar-dot"></span> CodimAI Blog</a>
  <div class="sidebar-label">Content</div>
  <a href="dashboard.php" class="sidebar-link">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    All Posts
  </a>
  <a href="editor.php" class="sidebar-link">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    New Post
  </a>
  <div class="sidebar-label">CRM</div>
  <a href="contacts.php" class="sidebar-link active">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    Contacts
    <?php if ($counts['new']): ?>
    <span style="margin-left:auto;background:#F7F5F0;color:#1A1A18;font-size:.6rem;font-weight:700;padding:2px 6px;border-radius:10px"><?= $counts['new'] ?></span>
    <?php endif; ?>
  </a>
  <div class="sidebar-footer"><a href="logout.php">← Logout</a></div>
</aside>

<div class="main">
  <div class="topbar">
    <h1>Contacts <span style="font-weight:400;color:#86847C;margin-left:8px;font-size:.85rem"><?= $counts['all'] ?> total</span></h1>
    <a href="contacts.php?export=csv<?= $filter!=='all'?'&status='.urlencode($filter):'' ?><?= $search?'&q='.urlencode($search):'' ?>"
       class="btn btn-outline">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export CSV
    </a>
  </div>

  <div class="content">

    <div class="stats-row">
      <div class="stat-card"><div class="s-label">Total</div><div class="s-val"><?= $counts['all'] ?></div></div>
      <div class="stat-card"><div class="s-label">New</div><div class="s-val"><?= $counts['new'] ?></div></div>
      <div class="stat-card"><div class="s-label">In Progress</div><div class="s-val"><?= $counts['in_progress'] ?></div></div>
      <div class="stat-card"><div class="s-label">Responded</div><div class="s-val"><?= $counts['responded'] ?></div></div>
    </div>

    <form method="GET" class="filter-bar">
      <input type="search" name="q" placeholder="Search name, email, company…" value="<?= htmlspecialchars($search) ?>"/>
      <select name="status" onchange="this.form.submit()">
        <option value="all"         <?= $filter==='all'         ?'selected':''?>>All (<?= $counts['all'] ?>)</option>
        <option value="new"         <?= $filter==='new'         ?'selected':''?>>New (<?= $counts['new'] ?>)</option>
        <option value="in_progress" <?= $filter==='in_progress' ?'selected':''?>>In Progress (<?= $counts['in_progress'] ?>)</option>
        <option value="responded"   <?= $filter==='responded'   ?'selected':''?>>Responded (<?= $counts['responded'] ?>)</option>
      </select>
      <button type="submit" class="btn btn-outline">Search</button>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Contact</th>
            <th>Interest</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if (!$contacts): ?>
            <tr><td colspan="6"><div class="empty-state">No contacts yet. Submissions from the Get Started form appear here.</div></td></tr>
          <?php else: ?>
            <?php foreach ($contacts as $c):
              $cur  = $c['status'];
              $next = $statusNext[$cur];
              $btnL = $statusBtn[$cur];
            ?>

            <!-- Main row -->
            <tr class="contact-row">
              <td>
                <div class="td-inner">
                  <div class="contact-name"><?= htmlspecialchars($c['name']) ?></div>
                  <div class="contact-sub">
                    <a href="mailto:<?= htmlspecialchars($c['email']) ?>" style="color:inherit"><?= htmlspecialchars($c['email']) ?></a>
                  </div>
                  <?php if ($c['company']): ?>
                  <div class="contact-sub"><?= htmlspecialchars($c['company']) ?></div>
                  <?php endif; ?>
                  <?php if ($c['team_size']): ?>
                  <div class="contact-sub"><?= htmlspecialchars($c['team_size']) ?></div>
                  <?php endif; ?>
                </div>
              </td>
              <td><div class="td-inner" style="font-size:.85rem"><?= htmlspecialchars($c['interest']) ?></div></td>
              <td>
                <div class="td-inner">
                  <div class="msg-text"><?= htmlspecialchars(mb_strimwidth($c['message'] ?? '', 0, 100, '…')) ?></div>
                </div>
              </td>
              <td>
                <div class="td-inner">
                  <span class="badge badge-<?= htmlspecialchars($cur) ?>" id="badge-<?= $c['id'] ?>">
                    <?= htmlspecialchars($statusLabel[$cur]) ?>
                  </span>
                </div>
              </td>
              <td>
                <div class="td-inner" style="white-space:nowrap;font-size:.8rem;color:#86847C">
                  <?= date('d M Y', strtotime($c['created_at'])) ?>
                </div>
              </td>
              <td>
                <div class="td-inner" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <button class="status-btn" data-id="<?= $c['id'] ?>" data-next="<?= $next ?>"
                          onclick="updateStatus(this)"><?= $btnL ?></button>
                  <button class="notes-toggle" data-id="<?= $c['id'] ?>"
                          onclick="toggleNotes(this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Notes<?= $c['notes'] ? ' ✓' : '' ?>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Notes expand row -->
            <tr class="notes-row hidden" id="notes-row-<?= $c['id'] ?>">
              <td colspan="6">
                <div style="padding:12px 16px 16px">
                  <label style="font-size:.74rem;font-weight:600;color:#86847C;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:6px">Internal Notes</label>
                  <textarea class="notes-area" id="notes-ta-<?= $c['id'] ?>"
                            placeholder="Add notes about this lead…"
                            onblur="saveNotes(<?= $c['id'] ?>, this)"><?= htmlspecialchars($c['notes'] ?? '') ?></textarea>
                  <div class="notes-save-msg" id="notes-msg-<?= $c['id'] ?>"></div>
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

<script>
var CSRF = <?= json_encode($csrf) ?>;

var STATUS_LABEL = { new: 'New', in_progress: 'In Progress', responded: 'Responded' };
var STATUS_NEXT  = { new: 'in_progress', in_progress: 'responded', responded: 'new' };
var STATUS_BTN   = { new: 'Start', in_progress: 'Mark responded', responded: 'Reopen' };

function post(data) {
  var fd = new FormData();
  data.csrf_token = CSRF;
  Object.keys(data).forEach(function(k) { fd.append(k, data[k]); });
  return fetch('contacts.php', { method: 'POST', body: fd }).then(function(r){ return r.json(); });
}

function updateStatus(btn) {
  var id   = btn.dataset.id;
  var next = btn.dataset.next;
  btn.disabled = true;
  post({ action: 'update_status', id: id, status: next })
    .then(function(data) {
      if (!data.success) { alert(data.error || 'Update failed'); btn.disabled = false; return; }
      var badge = document.getElementById('badge-' + id);
      badge.textContent = STATUS_LABEL[next];
      badge.className   = 'badge badge-' + next;
      btn.dataset.next  = STATUS_NEXT[next];
      btn.textContent   = STATUS_BTN[next];
      btn.disabled      = false;
    })
    .catch(function() { alert('Network error'); btn.disabled = false; });
}

function toggleNotes(btn) {
  var id  = btn.dataset.id;
  var row = document.getElementById('notes-row-' + id);
  var open = row.classList.toggle('hidden');
  if (!open) {
    var ta = document.getElementById('notes-ta-' + id);
    if (ta) ta.focus();
  }
}

function saveNotes(id, ta) {
  var msg = document.getElementById('notes-msg-' + id);
  post({ action: 'save_notes', id: id, notes: ta.value })
    .then(function(data) {
      if (data.success) {
        msg.textContent = 'Saved';
        setTimeout(function(){ msg.textContent = ''; }, 2000);
        /* update toggle button indicator */
        var btns = document.querySelectorAll('.notes-toggle[data-id="' + id + '"]');
        btns.forEach(function(b) {
          b.innerHTML = b.innerHTML.replace(/ ✓$/, '') + (ta.value.trim() ? ' ✓' : '');
        });
      } else {
        msg.textContent = data.error || 'Save failed';
      }
    })
    .catch(function() { msg.textContent = 'Network error'; });
}
</script>
</body>
</html>
