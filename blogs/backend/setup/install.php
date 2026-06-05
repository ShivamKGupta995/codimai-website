<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>CodimAI Blog  Setup</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F7F5F0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 44px 40px; max-width: 560px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,.08); border: 1px solid #EFEDE6; }
    .logo { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 1.1rem; color: #1A1A18; margin-bottom: 28px; display: flex; align-items: center; gap: 8px; }
    .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #1A1A18; }
    h1 { font-size: 1.4rem; color: #1A1A18; margin-bottom: 8px; font-weight: 500; }
    p  { color: #86847C; font-size: .9rem; margin-bottom: 24px; line-height: 1.7; }
    .step { display: flex; gap: 14px; margin-bottom: 12px; padding: 14px 16px; border-radius: 8px; background: #F7F5F0; border: 1px solid #EFEDE6; }
    .step-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: .85rem; flex-shrink: 0; }
    .step-icon.ok  { background: rgba(26,26,24,.08); color: #1A1A18; }
    .step-icon.err { background: rgba(200,60,60,.1); color: #C83C3C; }
    .step-text strong { display: block; font-size: .88rem; color: #1A1A18; margin-bottom: 3px; }
    .step-text span   { font-size: .8rem; color: #86847C; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #1A1A18; color: #F7F5F0; border-radius: 8px; font-family: inherit; font-size: .9rem; font-weight: 500; text-decoration: none; cursor: pointer; border: none; transition: opacity .2s; }
    .btn:hover { opacity: .85; }
    .warn { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; font-size: .82rem; color: #92400E; margin-top: 20px; }
  </style>
</head>
<body>
<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../config.php';

$steps   = [];
$success = true;

try {
    $db = getDb();
    $steps[] = ['ok', 'Database connection', 'Connected to ' . DB_NAME . ' on ' . DB_HOST];
} catch (Exception $e) {
    $steps[] = ['err', 'Database connection', $e->getMessage()];
    $success = false;
}

if ($success) {
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS categories (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(100) NOT NULL,
            slug        VARCHAR(100) NOT NULL UNIQUE,
            color       VARCHAR(20)  DEFAULT '#1A1A18',
            sort_order  INT          DEFAULT 0,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $db->exec("CREATE TABLE IF NOT EXISTS posts (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            title               VARCHAR(255)    NOT NULL,
            slug                VARCHAR(255)    NOT NULL UNIQUE,
            content             LONGTEXT,
            excerpt             TEXT,
            thumbnail_url       VARCHAR(500),
            category_id         INT             DEFAULT NULL,
            author_name         VARCHAR(100)    DEFAULT 'The CodimAI Team',
            author_role         VARCHAR(150),
            author_bio          TEXT,
            status              ENUM('draft','published') DEFAULT 'draft',
            meta_title          VARCHAR(255),
            meta_description    TEXT,
            tags                TEXT,
            read_time           INT             DEFAULT 5,
            published_at        DATETIME        DEFAULT NULL,
            created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
            INDEX idx_slug   (slug),
            INDEX idx_status (status),
            INDEX idx_pubat  (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $steps[] = ['ok', 'Database tables created', 'posts, categories tables ready'];
    } catch (Exception $e) {
        $steps[] = ['err', 'Create tables', $e->getMessage()];
        $success = false;
    }

    try {
        $cats = [
            ['Agentic AI',      'agentic-ai',      '#1A1A18', 1],
            ['Generative AI',   'generative-ai',   '#3A3A36', 2],
            ['Insights',        'insights',        '#3A3A36', 3],
            ['Recommendation',  'recommendation',  '#3A3A36', 4],
            ['Prediction',      'prediction',      '#3A3A36', 5],
            ['Data Analytics',  'data-analytics',  '#3A3A36', 6],
            ['Agents',          'agents',          '#3A3A36', 7],
        ];
        $ins = $db->prepare("INSERT IGNORE INTO categories (name,slug,color,sort_order) VALUES (?,?,?,?)");
        foreach ($cats as $c) $ins->execute($c);
        $steps[] = ['ok', 'Default categories seeded', implode(', ', array_column($cats, 0))];
    } catch (Exception $e) {
        $steps[] = ['err', 'Seed categories', $e->getMessage()];
    }

    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $htaccess = $uploadDir . '.htaccess';
    if (!file_exists($htaccess)) file_put_contents($htaccess, "Options -Indexes\n");
    $steps[] = is_writable($uploadDir)
        ? ['ok',  'Uploads directory', 'Created and writable']
        : ['err', 'Uploads directory', 'Not writable  check permissions (chmod 755)'];
}
?>

<div class="card">
  <div class="logo"><span class="logo-dot"></span> CodimAI Blog Setup</div>
  <h1><?= $success ? 'Installation complete.' : 'Setup failed.' ?></h1>
  <p><?= $success
    ? 'Your blog database is ready. Go to the admin panel to create your first post.'
    : 'One or more steps failed. Check config.php and try again.' ?></p>

  <?php foreach ($steps as [$status, $title, $detail]): ?>
    <div class="step">
      <div class="step-icon <?= $status ?>"><?= $status === 'ok' ? '✓' : '✗' ?></div>
      <div class="step-text">
        <strong><?= htmlspecialchars($title) ?></strong>
        <span><?= htmlspecialchars($detail) ?></span>
      </div>
    </div>
  <?php endforeach; ?>

  <?php if ($success): ?>
    <a href="../admin/login.php" class="btn">Go to Admin Panel →</a>
    <div class="warn">
      <strong>Security:</strong> Delete or protect <code>setup/install.php</code> after installation.
    </div>
  <?php else: ?>
    <a href="install.php" class="btn">Retry Setup</a>
  <?php endif; ?>
</div>

</body>
</html>
