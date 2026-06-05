<?php
$envFile = file_exists(__DIR__ . '/.env.local')
    ? __DIR__ . '/.env.local'
    : __DIR__ . '/.env.production';

foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if ($line[0] === '#' || !str_contains($line, '=')) continue;
    [$key, $val] = explode('=', $line, 2);
    $_ENV[trim($key)] = trim($val);
}

function env(string $key, string $default = ''): string {
    return $_ENV[$key] ?? $default;
}

define('DB_HOST',    env('DB_HOST', 'localhost'));
define('DB_NAME',    env('DB_NAME', ''));
define('DB_USER',    env('DB_USER', ''));
define('DB_PASS',    env('DB_PASS', ''));
define('DB_CHARSET', 'utf8mb4');

define('SITE_URL',     env('SITE_URL',     'http://localhost:8000'));
define('FRONTEND_URL', env('FRONTEND_URL', 'http://localhost:8000'));

define('UPLOAD_DIR',    __DIR__ . '/uploads/');
define('UPLOAD_URL',    SITE_URL . '/blogs/backend/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024);

define('ADMIN_EMAIL',  env('ADMIN_EMAIL', ''));
define('ADMIN_PASS',   env('ADMIN_PASS',  ''));
define('SESSION_NAME', 'codimai_blog_admin');

define('SMTP_HOST',   env('SMTP_HOST',   'smtp.hostinger.com'));
define('SMTP_PORT',   (int) env('SMTP_PORT',   '587'));
define('SMTP_USER',   env('SMTP_USER',   ''));
define('SMTP_PASS',   env('SMTP_PASS',   ''));
define('MAIL_FROM',      env('MAIL_FROM',      ''));   // defaults to SMTP_USER if blank
define('MAIL_FROM_NAME', env('MAIL_FROM_NAME', 'CodimAI'));
define('CONTACT_TO',     env('CONTACT_TO',     ''));   // where audit-request leads are emailed; defaults to SMTP_USER

define('DEBUG', env('DEBUG', 'false') === 'true');
