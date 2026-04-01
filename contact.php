<?php
declare(strict_types=1);

// Ensure clean JSON output (no warnings/notices breaking response)
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

// Honeypot anti-spam: bots often fill hidden fields
$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
  respond(200, ['ok' => true]);
}

$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($email === '' || $message === '') {
  respond(400, ['ok' => false, 'error' => 'Missing fields']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['ok' => false, 'error' => 'Invalid email']);
}

// Basic length limits
if (mb_strlen($email) > 254 || mb_strlen($message) > 5000) {
  respond(400, ['ok' => false, 'error' => 'Payload too large']);
}

// IMPORTANT: set your private recipient email here.
// This file runs on the server, so the address won't be visible in page source.
$to = 'ptraczewski@yahoo.com';

$site = ($_SERVER['HTTP_HOST'] ?? 'kaktusy-i-sukulenty.com');
$subject = 'Formularz kontaktowy — ' . $site;

$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$body = "Od: {$email}\n";
if ($ip !== '') $body .= "IP: {$ip}\n";
if ($ua !== '') $body .= "UA: {$ua}\n";
$body .= "\nWiadomość:\n{$message}\n";

// Headers: set From to a domain-like sender to improve deliverability on some hosts.
// Reply-To points to the user's email so you can reply directly.
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$fromDomain = preg_replace('/[^a-z0-9\.\-]/i', '', (string)$site);
$fromDomain = $fromDomain !== '' ? $fromDomain : 'kaktusy-i-sukulenty.com';
$headers[] = 'From: Formularz kontaktowy <no-reply@' . $fromDomain . '>';
$headers[] = 'Reply-To: ' . $email;

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));
if (!$ok) {
  respond(500, ['ok' => false, 'error' => 'Mail send failed']);
}

respond(200, ['ok' => true]);
