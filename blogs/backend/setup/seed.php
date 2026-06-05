<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>CodimAI Blog  Seed</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F7F5F0; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px; }
    .card { background: #fff; border-radius: 12px; padding: 44px 40px; max-width: 640px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,.08); border: 1px solid #EFEDE6; }
    .logo { font-weight: 600; font-size: 1rem; color: #1A1A18; margin-bottom: 28px; display: flex; align-items: center; gap: 8px; }
    .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #1A1A18; flex-shrink: 0; }
    h1 { font-size: 1.4rem; color: #1A1A18; margin-bottom: 8px; font-weight: 500; }
    p  { color: #86847C; font-size: .9rem; margin-bottom: 24px; line-height: 1.7; }
    .step { display: flex; gap: 14px; margin-bottom: 10px; padding: 13px 16px; border-radius: 8px; background: #F7F5F0; border: 1px solid #EFEDE6; }
    .step-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: .82rem; flex-shrink: 0; }
    .ok  { background: rgba(26,26,24,.08); color: #1A1A18; }
    .err { background: rgba(200,60,60,.1); color: #C83C3C; }
    .skip { background: rgba(134,132,124,.1); color: #86847C; }
    .step-text strong { display: block; font-size: .86rem; color: #1A1A18; margin-bottom: 2px; }
    .step-text span   { font-size: .78rem; color: #86847C; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #1A1A18; color: #F7F5F0; border-radius: 8px; font-family: inherit; font-size: .9rem; font-weight: 500; text-decoration: none; transition: opacity .2s; }
    .btn:hover { opacity: .85; }
    .btn-outline { background: transparent; color: #1A1A18; border: 1.5px solid #1A1A18; margin-left: 10px; }
    .warn { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; font-size: .82rem; color: #92400E; margin-top: 20px; }
    .summary { margin-top: 24px; padding: 16px; background: #F7F5F0; border-radius: 8px; font-size: .84rem; color: #3A3A36; line-height: 1.8; }
    .summary strong { color: #1A1A18; }
  </style>
</head>
<body>
<?php
/* ── Bootstrap ───────────────────────────────────────────── */
$envFile = file_exists(__DIR__ . '/../.env.local')
    ? __DIR__ . '/../.env.local'
    : __DIR__ . '/../.env.production';

foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if ($line[0] === '#' || !str_contains($line, '=')) continue;
    [$k, $v] = explode('=', $line, 2);
    $_ENV[trim($k)] = trim($v);
}

$DB_HOST = $_ENV['DB_HOST'] ?? 'localhost';
$DB_NAME = $_ENV['DB_NAME'] ?? 'codimai_blog';
$DB_USER = $_ENV['DB_USER'] ?? 'root';
$DB_PASS = $_ENV['DB_PASS'] ?? '';

$steps   = [];
$success = true;
$pdo     = null;

/* ── Step 1: Create database if missing ─────────────────── */
try {
    $root = new PDO(
        "mysql:host=$DB_HOST;charset=utf8mb4",
        $DB_USER, $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $root->exec("CREATE DATABASE IF NOT EXISTS `$DB_NAME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $steps[] = ['ok', 'Database', "Created / confirmed: $DB_NAME on $DB_HOST"];
} catch (PDOException $e) {
    $steps[] = ['err', 'Database', $e->getMessage()];
    $success = false;
}

/* ── Step 2: Connect to the DB ──────────────────────────── */
if ($success) {
    try {
        $pdo = new PDO(
            "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
            $DB_USER, $DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci',
            ]
        );
        $steps[] = ['ok', 'Connection', "Connected to $DB_NAME"];
    } catch (PDOException $e) {
        $steps[] = ['err', 'Connection', $e->getMessage()];
        $success = false;
    }
}

/* ── Step 3: Create tables ──────────────────────────────── */
if ($success) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(100) NOT NULL,
            slug        VARCHAR(100) NOT NULL UNIQUE,
            color       VARCHAR(20)  DEFAULT '#1A1A18',
            sort_order  INT          DEFAULT 0,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS contacts (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $steps[] = ['ok', 'Tables', 'posts + categories + contacts tables ready'];
    } catch (PDOException $e) {
        $steps[] = ['err', 'Tables', $e->getMessage()];
        $success = false;
    }
}

/* ── Step 4: Seed categories ────────────────────────────── */
$catIds = [];
if ($success) {
    try {
        $cats = [
            [1, 'Agentic AI',     'agentic-ai'],
            [2, 'Generative AI',  'generative-ai'],
            [3, 'Insights',       'insights'],
            [4, 'Recommendation', 'recommendation'],
            [5, 'Prediction',     'prediction'],
            [6, 'Data Analytics', 'data-analytics'],
            [7, 'Agents',         'agents'],
        ];
        $ins = $pdo->prepare("INSERT IGNORE INTO categories (sort_order, name, slug) VALUES (?, ?, ?)");
        foreach ($cats as $c) { $ins->execute($c); }

        /* Fetch IDs by slug so seed posts can reference them */
        $rows = $pdo->query("SELECT id, slug FROM categories")->fetchAll();
        foreach ($rows as $r) $catIds[$r['slug']] = $r['id'];

        $steps[] = ['ok', 'Categories', implode(', ', array_column($cats, 1))];
    } catch (PDOException $e) {
        $steps[] = ['err', 'Categories', $e->getMessage()];
        $success = false;
    }
}

/* ── Step 5: Seed posts ─────────────────────────────────── */
$seeded = 0;
$skipped = 0;
if ($success) {
    $posts = [
        [
            'slug'        => 'what-makes-an-agent-agentic',
            'title'       => 'What makes an AI agent actually agentic?',
            'category'    => 'agentic-ai',
            'published_at'=> '2025-03-18 09:00:00',
            'read_time'   => 4,
            'excerpt'     => 'Planning, tool use, and self-verification  the three properties that separate a chat interface from a system that ships work end-to-end.',
            'tags'        => 'Agentic AI, Planning, Tool Use, Automation',
            'content'     => '<p>Almost every product now claims to have an "AI agent." Most of them are a text box wired to a language model. That is useful  but it is not agentic. An agent is defined less by the model behind it and more by what it can do without you holding its hand at every step.</p>

<p>When we evaluate whether a system is genuinely agentic, we look for three properties. All three have to be present. Drop any one and you are back to a clever autocomplete.</p>

<h2>1. It plans</h2>
<p>A chat interface answers the question in front of it. An agent decomposes a goal into steps, sequences them, and adapts the plan when a step fails. The difference shows up the moment a task needs more than one move.</p>
<p>Ask a chatbot to "reconcile last month\'s invoices," and it will explain how. Ask an agent, and it will list the invoices, fetch each record, compare line items, flag the mismatches, and tell you what it could not resolve  because it treated your sentence as an objective, not a prompt.</p>

<h2>2. It uses tools</h2>
<p>Language alone cannot read your database, call your API, or send an email. Agentic systems act on the world through tools, and choosing the right tool at the right moment is most of the skill.</p>
<ul>
  <li><strong>Retrieval</strong>  pulling the specific record or document a step needs.</li>
  <li><strong>Action</strong>  writing to systems, triggering workflows, and producing artifacts.</li>
  <li><strong>Computation</strong>  handing maths, code, and structured logic to something deterministic.</li>
</ul>

<h2>3. It verifies its own work</h2>
<p>This is the property almost everyone skips, and it is the one that separates a demo from production. A real agent checks its output against the goal before declaring success.</p>
<blockquote>The question isn\'t "can it produce an answer?" It\'s "can it tell whether the answer is right, and fix it when it isn\'t?"</blockquote>

<h2>The practical test</h2>
<p>Next time a tool is described as an agent, ask three questions. Can it break a goal into steps and recover when one fails? Can it act on real systems, not just talk about them? And can it check its own work before handing it back?</p>',
        ],
        [
            'slug'        => 'reading-your-data',
            'title'       => 'Reading your data so you don\'t have to.',
            'category'    => 'insights',
            'published_at'=> '2025-04-05 09:00:00',
            'read_time'   => 5,
            'excerpt'     => 'How natural-language analytics turns a dashboard no-one checks into a daily briefing that surfaces what matters.',
            'tags'        => 'Insights, Analytics, Natural Language, Data',
            'content'     => '<p>Most dashboards fail not because of bad data, but because of bad timing. The insight is there  buried in a chart that someone opens once a week, skims for thirty seconds, and closes.</p>

<p>The real problem is attention. Data teams can surface almost anything, but they cannot force a decision-maker to look at the right thing at the right moment.</p>

<h2>The attention problem</h2>
<p>A dashboard is passive. It waits to be opened. A natural-language briefing is active  it arrives when something worth knowing has happened, framed in the language of the person who needs to act on it.</p>
<p>This is not a small distinction. It changes who consumes insights (everyone, not just analysts), how quickly they act, and how much organisational energy goes into maintaining a system no-one uses.</p>

<h2>What changes with AI-driven analytics</h2>
<p>When an AI reads your data continuously, three things become possible that were not practical before:</p>
<ul>
  <li><strong>Anomaly detection at scale</strong>  surface the outlier in a table with a million rows without a human writing the query.</li>
  <li><strong>Narrative generation</strong>  turn numbers into a sentence that explains the why, not just the what.</li>
  <li><strong>Proactive delivery</strong>  push the right insight to the right person before they think to ask for it.</li>
</ul>

<h2>What this looks like in practice</h2>
<p>Instead of a weekly analytics meeting to walk through charts, a team lead receives: "Sales from the northern region dropped 18% week-over-week. The pattern matches the last two times the logistics delay exceeded three days." They can act on that in two minutes, not two hours.</p>',
        ],
        [
            'slug'        => 'reviews-to-revenue',
            'title'       => 'From reviews to revenue: why response timing matters.',
            'category'    => 'agents',
            'published_at'=> '2025-04-22 09:00:00',
            'read_time'   => 6,
            'excerpt'     => 'A reply to a 3-star review isn\'t just good manners  it\'s a 48-hour window that search and sentiment both watch.',
            'tags'        => 'Google Reviews, Reputation, Agents, Local SEO',
            'content'     => '<p>Most businesses treat Google reviews as a scoreboard  something to monitor, occasionally respond to, and largely accept as fate. That framing misses almost everything that matters.</p>

<p>A review is a conversation that happens in public. The business\'s response, or absence of one, is visible to everyone who reads it  not just the original reviewer. And the timing of that response affects two things that directly drive revenue: search ranking and first-impression sentiment.</p>

<h2>The 48-hour window</h2>
<p>Google\'s local ranking algorithm treats recency of activity as a freshness signal. A response within 48 hours tells the algorithm that the business is active and engaged. A response after a week, or no response at all, tells it the opposite.</p>
<p>This is separate from review score. A 3.8-average business that responds to every review within a day will frequently outrank a 4.2-average competitor that ignores them.</p>

<h2>What sentiment analysis adds</h2>
<p>Not all reviews are equal. A 3-star review that mentions a specific, fixable problem is a different signal than a 3-star review expressing vague dissatisfaction. The first is actionable  and a fast, specific response demonstrably shifts the reviewer\'s public rating in a substantial percentage of cases.</p>

<h2>Why automation changes the economics</h2>
<p>A human reading and responding to every review is expensive at volume. An AI agent that classifies sentiment, identifies the core complaint, drafts a context-aware response, and flags the handful of reviews that need a human touch  that changes the unit economics completely.</p>
<p>The bottleneck is no longer capacity. It is judgment. And that is a much better problem to have.</p>',
        ],
        [
            'slug'        => 'generative-ai-beyond-content',
            'title'       => 'Generative AI beyond content: what it means for operations.',
            'category'    => 'generative-ai',
            'published_at'=> '2025-05-10 09:00:00',
            'read_time'   => 7,
            'excerpt'     => 'Most teams still think of generative AI as a writing tool. The real opportunity is in the workflows it can redesign entirely.',
            'tags'        => 'Generative AI, Operations, Workflow, Enterprise',
            'content'     => '<p>When generative AI entered mainstream use, most organisations reached for it as a content accelerator. Blog posts written faster. Marketing copy in seconds. Customer support responses drafted automatically. All of this is real, and all of it is the surface.</p>

<p>The deeper shift  the one that changes organisational structure rather than just individual productivity  is generative AI applied to operations.</p>

<h2>The content frame is too narrow</h2>
<p>Content generation is a solved problem in the sense that every tool does it, and the marginal return from one tool versus another is diminishing. The more consequential question is: what processes in your organisation require generating structured outputs from unstructured inputs  and how many of those are still done entirely by hand?</p>

<h2>Three operational categories worth examining</h2>
<p><strong>Document processing:</strong> contracts, invoices, compliance reports, RFPs. Every one of these involves extracting structure from language. Generative AI can read, summarise, flag anomalies, and draft responses.</p>
<p><strong>Internal knowledge:</strong> the answer to most support tickets exists somewhere in your documentation. The problem is retrieval. A generative system that reads your knowledge base and answers in natural language eliminates the retrieval bottleneck.</p>
<p><strong>Decision support:</strong> the final frontier. Generating a draft recommendation, with supporting evidence, for a decision that would otherwise require a two-hour meeting.</p>

<h2>What to measure</h2>
<p>If you are evaluating generative AI for operations, the right question is not "how much faster can we produce content?" It is "which process in this organisation has the highest cost per structured output?" Start there.</p>',
        ],
        [
            'slug'        => 'prediction-models-in-production',
            'title'       => 'Prediction models in production: what actually matters.',
            'category'    => 'prediction',
            'published_at'=> '2025-05-28 09:00:00',
            'read_time'   => 8,
            'excerpt'     => 'Accuracy on a test set is the beginning of the conversation, not the end. Here\'s what separates a model in a notebook from one that earns trust.',
            'tags'        => 'Prediction, MLOps, Production, Machine Learning',
            'content'     => '<p>A prediction model that works in a notebook and a prediction model that earns operational trust are, in practice, different things entirely. The gap between them is not technical sophistication  it is a set of properties that have nothing to do with the model itself.</p>

<h2>Accuracy is table stakes</h2>
<p>Every model that makes it to a production discussion has already cleared the accuracy bar. The question at that point is not whether it predicts well on historical data. It is whether it will keep predicting well as conditions change, whether stakeholders will trust it enough to act on it, and whether it can explain its reasoning when asked.</p>

<h2>The three properties that actually determine success</h2>
<p><strong>Explainability:</strong> "The model says churn probability is 78%" is not actionable. "The model says churn probability is 78%, primarily because login frequency dropped 60% over the last 14 days and last support ticket was unresolved"  that is actionable. The prediction and the evidence for it need to travel together.</p>
<p><strong>Calibration:</strong> A model that says "78% probability" should be right roughly 78% of the time across a large sample. Models that are systematically overconfident or underconfident cause downstream decisions to miscalibrate. This is often more damaging than raw accuracy degradation.</p>
<p><strong>Monitoring:</strong> Production data drifts. The distribution your model was trained on is not the distribution it will see in six months. A model without a monitoring layer is a countdown timer.</p>

<h2>The organisational layer</h2>
<p>Beyond the technical properties, the hardest part is adoption. A model that gets ignored by the team it was built for has zero value regardless of its performance metrics. The path to adoption almost always runs through involving the end users in defining what the model should optimise for.</p>',
        ],
        [
            'slug'        => 'recommendation-systems-done-right',
            'title'       => 'Recommendation systems done right: less algorithm, more context.',
            'category'    => 'recommendation',
            'published_at'=> '2025-06-01 09:00:00',
            'read_time'   => 6,
            'excerpt'     => 'The failure mode of most recommendation systems isn\'t the model  it\'s the absence of context that would make the recommendation obvious to a person.',
            'tags'        => 'Recommendation, Personalisation, Context, AI',
            'content'     => '<p>Most recommendation systems fail the same way. Not because the algorithm is wrong, but because the algorithm is working on the wrong inputs.</p>

<p>The popular framing  "users who bought X also bought Y"  is a correlation engine. It finds patterns in historical behaviour. What it does not have is context: what the user is trying to accomplish right now, what constraints they are operating under, and what would constitute a genuinely useful suggestion versus an obvious one.</p>

<h2>The difference between pattern and context</h2>
<p>A pattern-based system recommends hiking boots to someone who bought a rain jacket, because the correlation is statistically strong. A context-aware system knows that the same person is planning a beach holiday and recommends sandals instead.</p>
<p>This is not a subtle distinction. It is the difference between a recommendation that feels like surveillance and one that feels like good advice.</p>

<h2>What context actually requires</h2>
<p>Context cannot be inferred from purchase history alone. It requires signals from multiple sources: current session behaviour, stated preferences, external data like calendar or location, and sometimes direct input from the user. Integrating these signals is the hard part  not the model.</p>

<h2>The feedback loop problem</h2>
<p>Every recommendation system that optimises for clicks will eventually recommend the same things to everyone, because clicks concentrate on a small number of popular items. The metric drives the system toward homogeneity. The alternative is to measure whether the recommendation was useful after the fact  a harder measurement that requires a longer feedback loop and a different conception of success.</p>',
        ],
        [
            'slug'        => 'data-analytics-without-analysts',
            'title'       => 'Data analytics without the analyst bottleneck.',
            'category'    => 'data-analytics',
            'published_at'=> '2025-06-04 09:00:00',
            'read_time'   => 5,
            'excerpt'     => 'The analytics bottleneck isn\'t a data problem or a tooling problem. It\'s a translation problem  between a business question and a query.',
            'tags'        => 'Data Analytics, Self-Serve, AI, Business Intelligence',
            'content'     => '<p>In most organisations, there are far more questions than there are people who can answer them with data. The ratio keeps getting worse as data volumes grow and the number of stakeholders with data-adjacent decisions multiplies.</p>

<p>The traditional response has been to hire more analysts, build better dashboards, and train business users on SQL. All three approaches have real limits.</p>

<h2>The translation problem</h2>
<p>The bottleneck is not technical. It is translation. A business user has a question: "Which customers are most likely to upgrade in the next 90 days?" An analyst translates that into a schema, a query, a result set, and a presentation. Each step takes time and introduces the possibility of misalignment between what was asked and what was answered.</p>

<h2>Where AI changes the equation</h2>
<p>Natural language interfaces for data remove most of the translation work. The business user asks the question in plain language. The system translates it to a query, executes it, and returns a result in language  not a table of numbers that requires further interpretation.</p>
<p>The analyst\'s role shifts from translation to something more valuable: defining what questions are worth asking, validating that the answers make sense, and identifying the implications that the system cannot see.</p>

<h2>What this requires technically</h2>
<p>A natural language analytics layer needs three things to work well: a schema the AI understands, a query validator that catches nonsensical results, and a feedback mechanism that improves translation quality over time. The first two are engineering. The third is a product discipline that most organisations skip.</p>',
        ],
        [
            'slug'        => 'agentic-ai-enterprise-deployment',
            'title'       => 'Deploying agentic AI in the enterprise: the questions that matter.',
            'category'    => 'agentic-ai',
            'published_at'=> '2025-06-05 09:00:00',
            'read_time'   => 7,
            'excerpt'     => 'Before you deploy an agent, you need to answer three questions that most teams skip: scope, supervision, and failure mode.',
            'tags'        => 'Agentic AI, Enterprise, Deployment, Risk',
            'content'     => '<p>Every enterprise AI project eventually reaches the same conversation: should we deploy this as a copilot that assists a human, or as an agent that acts autonomously? The answer depends less on capability than on trust  and trust is built through a process, not a launch.</p>

<h2>Scope: what can the agent touch?</h2>
<p>The first question is not "what can the agent do?" It is "what should the agent be allowed to do?" Every agentic deployment needs an explicit scope boundary: the systems it can read, the systems it can write to, the actions it can take without approval, and the actions that always require a human in the loop.</p>
<p>Starting narrow and expanding deliberately is not timidity  it is how you accumulate the evidence base that justifies expanding scope.</p>

<h2>Supervision: who watches the agent?</h2>
<p>An agent that acts autonomously still needs oversight. This means audit logs that are legible to non-technical stakeholders, exception reporting when the agent encounters something outside its training distribution, and a clear escalation path when the agent is uncertain.</p>
<p>The goal is not to watch every action  that defeats the purpose of automation. The goal is to be able to reconstruct what happened and why, and to catch systematic errors before they compound.</p>

<h2>Failure mode: what happens when it\'s wrong?</h2>
<p>Every agent will be wrong sometimes. The question is whether its failure modes are recoverable. An agent that drafts a recommendation and waits for approval fails gracefully. An agent that sends an email or modifies a database record without review fails in a way that may be irreversible.</p>
<p>Design for graceful failure first. Expand to autonomous action as trust is established. The timeline for that expansion is set by evidence, not enthusiasm.</p>',
        ],
    ];

    $ins = $pdo->prepare("INSERT IGNORE INTO posts
        (title, slug, content, excerpt, category_id, author_name, author_role,
         status, meta_title, meta_description, tags, read_time, published_at)
        VALUES
        (:title,:slug,:content,:excerpt,:cat,:aname,:arole,
         'published',:mtitle,:mdesc,:tags,:rt,:pubat)");

    foreach ($posts as $p) {
        $catId = $catIds[$p['category']] ?? null;
        if (!$catId) { $skipped++; continue; }

        $ins->execute([
            ':title'   => $p['title'],
            ':slug'    => $p['slug'],
            ':content' => $p['content'],
            ':excerpt' => $p['excerpt'],
            ':cat'     => $catId,
            ':aname'   => 'The CodimAI Team',
            ':arole'   => 'Research & Engineering',
            ':mtitle'  => $p['title'] . ' | CodimAI',
            ':mdesc'   => $p['excerpt'],
            ':tags'    => $p['tags'],
            ':rt'      => $p['read_time'],
            ':pubat'   => $p['published_at'],
        ]);
        $seeded++;
    }

    $steps[] = ['ok', 'Posts seeded', "$seeded posts inserted (INSERT IGNORE  safe to re-run)" . ($skipped ? ", $skipped skipped" : '')];
}

/* ── Step 6: Upload dir ─────────────────────────────────── */
if ($success) {
    $dir = __DIR__ . '/../uploads/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $ht = $dir . '.htaccess';
    if (!file_exists($ht)) file_put_contents($ht, "Options -Indexes\n");
    $steps[] = is_writable($dir)
        ? ['ok',   'Uploads dir', 'Writable at /blogs/backend/uploads/']
        : ['skip', 'Uploads dir', 'Not writable  chmod 755'];
}
?>

<div class="card">
  <div class="logo"><span class="logo-dot"></span> CodimAI Blog  Seed</div>
  <h1><?= $success ? 'Database ready.' : 'Seed failed.' ?></h1>
  <p><?= $success
    ? 'All test data has been inserted. You can now open the blog listing or log into the admin panel.'
    : 'One or more steps failed. Check credentials in <code>.env.local</code>.' ?></p>

  <?php foreach ($steps as [$status, $title, $detail]): ?>
    <div class="step">
      <div class="step-icon <?= $status ?>"><?= $status === 'ok' ? '✓' : ($status === 'skip' ? '~' : '✗') ?></div>
      <div class="step-text">
        <strong><?= htmlspecialchars($title) ?></strong>
        <span><?= htmlspecialchars($detail) ?></span>
      </div>
    </div>
  <?php endforeach; ?>

  <?php if ($success): ?>
    <div class="summary">
      <strong>DB:</strong> <?= htmlspecialchars($DB_NAME) ?> on <?= htmlspecialchars($DB_HOST) ?><br>
      <strong>Posts:</strong> <?= $seeded ?> published articles across 7 categories<br>
      <strong>Admin login:</strong> <?= htmlspecialchars($_ENV['ADMIN_EMAIL'] ?? 'admin@local.dev') ?> / <?= htmlspecialchars($_ENV['ADMIN_PASS'] ?? 'admin123') ?>
    </div>
    <a href="/blogs/" class="btn">View Blog →</a>
    <a href="/blogs/backend/admin/login.php" class="btn btn-outline">Admin Panel</a>
    <div class="warn">
      <strong>Dev only:</strong> Delete or protect <code>setup/seed.php</code> before deploying to production. It exposes credentials.
    </div>
  <?php else: ?>
    <a href="seed.php" class="btn">Retry</a>
  <?php endif; ?>
</div>

</body>
</html>
