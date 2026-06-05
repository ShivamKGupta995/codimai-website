<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: dashboard.php');
    exit;
}

verifyCsrf();

$id = (int)($_POST['id'] ?? 0);
if ($id) {
    getDb()->prepare('DELETE FROM posts WHERE id=?')->execute([$id]);
}

header('Location: dashboard.php?deleted=1');
exit;
