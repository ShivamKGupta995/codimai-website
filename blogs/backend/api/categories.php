<?php
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';

setCors();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$db   = getDb();
$stmt = $db->query("SELECT id, name, slug, color FROM categories ORDER BY sort_order ASC, name ASC");
jsonOut(['categories' => $stmt->fetchAll()]);
