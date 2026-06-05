<?php
/* ============================================================
   Minimal, dependency-free SMTP mailer.
   - Authenticated SMTP (AUTH LOGIN) over implicit SSL (port 465)
     or STARTTLS (port 587/25), driven by the SMTP_* config.
   - Sends multipart/alternative (plain + HTML).
   - Never throws to the caller: returns true/false and logs the
     reason on failure, so a mail problem can't break the request
     that triggered it (the lead is already persisted).
   Configure via config.php / .env: SMTP_HOST, SMTP_PORT,
   SMTP_USER, SMTP_PASS, plus MAIL_FROM / MAIL_FROM_NAME (optional).
   ============================================================ */

require_once __DIR__ . '/../config.php';

/**
 * Send an email. Returns true on success, false on failure (logged).
 *
 * @param string $toEmail     Recipient address.
 * @param string $toName      Recipient display name (may be empty).
 * @param string $subject     Subject line (UTF-8).
 * @param string $html        HTML body.
 * @param string $text        Plain-text alternative (auto-derived if empty).
 * @param string $replyEmail  Optional Reply-To address.
 * @param string $replyName   Optional Reply-To display name.
 */
function sendMail(
    string $toEmail,
    string $toName,
    string $subject,
    string $html,
    string $text = '',
    string $replyEmail = '',
    string $replyName = ''
): bool {
    $host = SMTP_HOST;
    $port = SMTP_PORT;
    $user = SMTP_USER;
    $pass = SMTP_PASS;

    if ($host === '' || $user === '' || $pass === '') {
        error_log('sendMail: SMTP not configured (missing host/user/pass)');
        return false;
    }
    if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        error_log('sendMail: invalid recipient ' . $toEmail);
        return false;
    }

    $fromEmail = defined('MAIL_FROM') && MAIL_FROM !== '' ? MAIL_FROM : $user;
    $fromName  = defined('MAIL_FROM_NAME') && MAIL_FROM_NAME !== '' ? MAIL_FROM_NAME : 'CodimAI';

    if ($text === '') {
        $text = trim(html_entity_decode(strip_tags(
            preg_replace('/<\s*br\s*\/?>/i', "\n", str_ireplace(['</p>', '</tr>', '</h1>', '</h2>'], "\n", $html))
        ), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    /* ── Build the MIME message ──────────────────────────────── */
    $boundary = 'cdm_' . bin2hex(random_bytes(12));
    $eol      = "\r\n";

    $headers  = 'From: ' . mimeName($fromName) . ' <' . $fromEmail . '>' . $eol;
    $headers .= 'To: ' . ($toName !== '' ? mimeName($toName) . ' ' : '') . '<' . $toEmail . '>' . $eol;
    if ($replyEmail !== '' && filter_var($replyEmail, FILTER_VALIDATE_EMAIL)) {
        $headers .= 'Reply-To: ' . ($replyName !== '' ? mimeName($replyName) . ' ' : '') . '<' . $replyEmail . '>' . $eol;
    }
    $headers .= 'Subject: ' . mimeName($subject) . $eol;
    $headers .= 'Date: ' . date('r') . $eol;
    $headers .= 'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . preg_replace('/^.*@/', '', $fromEmail) . '>' . $eol;
    $headers .= 'MIME-Version: 1.0' . $eol;
    $headers .= 'Content-Type: multipart/alternative; boundary="' . $boundary . '"' . $eol;

    $body  = '--' . $boundary . $eol;
    $body .= 'Content-Type: text/plain; charset=UTF-8' . $eol;
    $body .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
    $body .= $text . $eol . $eol;
    $body .= '--' . $boundary . $eol;
    $body .= 'Content-Type: text/html; charset=UTF-8' . $eol;
    $body .= 'Content-Transfer-Encoding: 8bit' . $eol . $eol;
    $body .= $html . $eol . $eol;
    $body .= '--' . $boundary . '--' . $eol;

    /* Dot-stuff lines beginning with "." per RFC 5321 */
    $message = $headers . $eol . $body;
    $message = preg_replace('/^\./m', '..', $message);

    /* ── Talk to the SMTP server ─────────────────────────────── */
    try {
        $implicitSsl = ($port === 465);
        $transport   = ($implicitSsl ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $ctx = stream_context_create(['ssl' => [
            'verify_peer'       => true,
            'verify_peer_name'  => true,
            'SNI_enabled'       => true,
        ]]);

        $fp = @stream_socket_client($transport, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
        if (!$fp) {
            error_log("sendMail: connect failed ($errno) $errstr");
            return false;
        }
        stream_set_timeout($fp, 15);

        smtpExpect($fp, [220]);
        smtpCmd($fp, 'EHLO ' . smtpHelo($fromEmail), [250]);

        if (!$implicitSsl) {
            smtpCmd($fp, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('STARTTLS negotiation failed');
            }
            smtpCmd($fp, 'EHLO ' . smtpHelo($fromEmail), [250]);
        }

        smtpCmd($fp, 'AUTH LOGIN', [334]);
        smtpCmd($fp, base64_encode($user), [334]);
        smtpCmd($fp, base64_encode($pass), [235]);

        smtpCmd($fp, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        smtpCmd($fp, 'RCPT TO:<' . $toEmail . '>', [250, 251]);
        smtpCmd($fp, 'DATA', [354]);
        smtpCmd($fp, $message . $eol . '.', [250]);
        smtpCmd($fp, 'QUIT', [221]);
        fclose($fp);
        return true;
    } catch (Throwable $e) {
        error_log('sendMail: ' . $e->getMessage());
        if (isset($fp) && is_resource($fp)) { @fclose($fp); }
        return false;
    }
}

/* ── SMTP helpers ───────────────────────────────────────────── */

function smtpRead($fp): string {
    $data = '';
    while (($line = fgets($fp, 515)) !== false) {
        $data .= $line;
        // A space in the 4th position marks the final line of a reply.
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $data;
}

function smtpExpect($fp, array $codes): string {
    $resp = smtpRead($fp);
    $code = (int) substr($resp, 0, 3);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('unexpected reply: ' . trim($resp));
    }
    return $resp;
}

function smtpCmd($fp, string $cmd, array $codes): string {
    fwrite($fp, $cmd . "\r\n");
    return smtpExpect($fp, $codes);
}

/** Derive a sensible HELO/EHLO hostname from the sender domain. */
function smtpHelo(string $fromEmail): string {
    $domain = preg_replace('/^.*@/', '', $fromEmail);
    return $domain !== '' ? $domain : 'localhost';
}

/** RFC 2047 encode a header value only when it contains non-ASCII. */
function mimeName(string $value): string {
    if (preg_match('/[^\x20-\x7E]/', $value)) {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }
    return $value;
}
