<?php
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/db.php';

setCors();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonError('Method not allowed', 405); }

/* Honeypot — bots fill the website field */
if (!empty($_POST['website'])) { jsonOut(['success' => true]); }

$name     = trim($_POST['name']      ?? '');
$email    = trim($_POST['email']     ?? '');
$company  = trim($_POST['company']   ?? '');
$teamSize = trim($_POST['team_size'] ?? '');
$interest = trim($_POST['interest']  ?? '');
$message  = trim($_POST['message']   ?? '');

if (!$name)                          { jsonError('Name is required'); }
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) { jsonError('Valid email is required'); }
if (!$interest)                      { jsonError('Please select an interest'); }

$db = getDb();

/* Ensure table exists (safe to call repeatedly) */
$db->exec("CREATE TABLE IF NOT EXISTS contacts (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    company    VARCHAR(150)  DEFAULT '',
    team_size  VARCHAR(30)   DEFAULT '',
    interest   VARCHAR(100)  NOT NULL,
    message    TEXT,
    status     ENUM('new','in_progress','responded') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email  (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$stmt = $db->prepare(
    "INSERT INTO contacts (name, email, company, team_size, interest, message)
     VALUES (:name, :email, :company, :team_size, :interest, :message)"
);
$stmt->execute([
    ':name'      => $name,
    ':email'     => $email,
    ':company'   => $company,
    ':team_size' => $teamSize,
    ':interest'  => $interest,
    ':message'   => $message,
]);

jsonOut(['success' => true, 'message' => 'Thank you — we will be in touch shortly.']);
