# How to Start the CodimAI Website Locally

**Stack:** PHP 8.3 · Apache 2.4 · MySQL 8.0 · Static HTML/CSS/JS

---

## Option A  Apache (recommended, already installed)

Apache is already running on your machine. One command links the project into it.

### 1. Create a symlink into Apache's webroot

```bash
sudo ln -s /home/shivam/Documents/CodimAi/CodimAiWebaiteRebuild /var/www/html/codimai
```

### 2. Allow Apache to follow symlinks

```bash
sudo nano /etc/apache2/sites-enabled/000-default.conf
```

Add this block inside `<VirtualHost *:80>` (before the closing tag):

```apache
<Directory /home/shivam/Documents/CodimAi/CodimAiWebaiteRebuild>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### 3. Enable mod_rewrite and restart

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 4. Open in browser

```
http://localhost/codimai/
http://localhost/codimai/blogs/
http://localhost/codimai/blogs/backend/admin/login.php
```

---

## Option B  PHP built-in server (zero config, fastest start)

No Apache config needed. Just run from the project root.

```bash
cd /home/shivam/Documents/CodimAi/CodimAiWebaiteRebuild
php -S localhost:8000
```

Open in browser:

```
http://localhost:8000/
http://localhost:8000/blogs/
http://localhost:8000/blogs/backend/admin/login.php
```

> **Note:** The PHP built-in server handles one request at a time. Fine for development, not for production.

---

## Database setup (already done  skip if you ran seed.php)

If the database is empty or you're setting up fresh:

```bash
# The seed script creates the DB, tables, categories, and 8 test posts
# Visit in browser after starting the server:
http://localhost:8000/blogs/backend/setup/seed.php
```

Or run directly via MySQL CLI:

```bash
mysql -u root -p'CodimAi@2025' -e "CREATE DATABASE IF NOT EXISTS codimai_blog CHARACTER SET utf8mb4;"
```

Then visit the seed URL above.

---

## Credentials

| What | Value |
|------|-------|
| **DB host** | localhost |
| **DB name** | codimai_blog |
| **DB user** | root |
| **DB password** | CodimAi@2025 |
| **Admin email** | admin@local.dev |
| **Admin password** | admin123 |

---

## Key URLs (PHP built-in server)

| Page | URL |
|------|-----|
| Home | `http://localhost:8000/` |
| Blog listing | `http://localhost:8000/blogs/` |
| Blog post (example) | `http://localhost:8000/blogs/what-makes-an-agent-agentic/` |
| Admin login | `http://localhost:8000/blogs/backend/admin/login.php` |
| Admin dashboard | `http://localhost:8000/blogs/backend/admin/dashboard.php` |
| Seed test data | `http://localhost:8000/blogs/backend/setup/seed.php` |
| API  posts | `http://localhost:8000/blogs/backend/api/posts.php?status=published` |
| AI pages | `http://localhost:8000/ai/agentic-ai.html` |
| Agents pages | `http://localhost:8000/agents/whatsapp.html` |

---

## MySQL quick commands

```bash
# Start MySQL if stopped
sudo systemctl start mysql

# Check it's running
sudo systemctl status mysql

# Connect to DB manually
mysql -u root -p'CodimAi@2025' codimai_blog

# Count posts in DB
mysql -u root -p'CodimAi@2025' codimai_blog -e "SELECT COUNT(*) FROM posts;"
```

---

## Apache quick commands

```bash
# Start / stop / restart
sudo systemctl start apache2
sudo systemctl stop apache2
sudo systemctl restart apache2

# Check status
sudo systemctl status apache2

# View error log (if something breaks)
sudo tail -f /var/log/apache2/error.log
```

---

## Fastest single-command start

```bash
cd /home/shivam/Documents/CodimAi/CodimAiWebaiteRebuild && php -S localhost:8000
```

Then open `http://localhost:8000/blogs/`  done.


  ┌──────────────────────────────────────┬────────────────────────────────────────────────┐
  │                 What                 │                      URL                       │
  ├──────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Blog listing                         │ http://localhost/blogs/                        │
  ├──────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Run seed again (safe, INSERT IGNORE) │ http://localhost/blogs/backend/setup/seed.php  │
  ├──────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Admin login                          │ http://localhost/blogs/backend/admin/login.php │
  ├──────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Admin credentials                    │ admin@local.dev / admin123                     │
  └──────────────────────────────────────┴────────────────────────────────────────────────┘