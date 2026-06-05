<?php
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

setCors();

if (!isLoggedIn()) jsonError('Unauthorized', 401);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

if (empty($_FILES['image'])) jsonError('No file uploaded');

try {
    $url = uploadImage($_FILES['image']);
    jsonOut(['url' => $url]);
} catch (RuntimeException $e) {
    jsonError($e->getMessage());
}
