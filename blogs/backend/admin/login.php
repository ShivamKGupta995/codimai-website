<?php
require_once __DIR__ . '/../includes/auth.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';
    if (attemptLogin($email, $pass)) {
        header('Location: dashboard.php');
        exit;
    }
    $error = 'Invalid email or password.';
}

if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Admin Login — CodimAI Blog</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <meta name="robots" content="noindex, nofollow"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #EFEDE6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 44px 40px; width: 100%; max-width: 400px; box-shadow: 0 8px 40px rgba(0,0,0,.08); border: 1px solid #EFEDE6; }
    .logo { font-size: 1rem; font-weight: 600; color: #1A1A18; margin-bottom: 32px; display: flex; align-items: center; gap: 8px; }
    .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #1A1A18; }
    h1 { font-size: 1.3rem; font-weight: 500; color: #1A1A18; margin-bottom: 6px; }
    p  { font-size: .86rem; color: #86847C; margin-bottom: 28px; }
    .form-group { margin-bottom: 18px; }
    label { display: block; font-size: .78rem; font-weight: 600; color: #3A3A36; margin-bottom: 7px; letter-spacing: .02em; }
    input[type=email], input[type=password] { width: 100%; padding: 11px 14px; font-family: inherit; font-size: .9rem; border: 1.5px solid #EFEDE6; border-radius: 8px; color: #1A1A18; outline: none; transition: border-color .2s; }
    input:focus { border-color: #1A1A18; }
    .btn { width: 100%; padding: 12px; background: #1A1A18; color: #F7F5F0; border: none; border-radius: 8px; font-family: inherit; font-size: .9rem; font-weight: 500; cursor: pointer; margin-top: 6px; transition: opacity .2s; }
    .btn:hover { opacity: .85; }
    .error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px 14px; border-radius: 8px; font-size: .84rem; margin-bottom: 18px; }
    .back { display: block; text-align: center; margin-top: 20px; font-size: .82rem; color: #86847C; text-decoration: none; }
    .back:hover { color: #1A1A18; }
  </style>
</head>
<body>
<div class="card">
  <div class="logo"><span class="logo-dot"></span> CodimAI Blog</div>
  <h1>Admin Login</h1>
  <p>Blog management panel</p>
  <?php if ($error): ?>
    <div class="error"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>
  <form method="POST" autocomplete="on">
    <div class="form-group">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" required autofocus value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" placeholder="admin@codimai.com"/>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required placeholder="••••••••"/>
    </div>
    <button type="submit" class="btn">Sign In →</button>
  </form>
  <a href="/" class="back">← Back to website</a>
</div>
</body>
</html>
