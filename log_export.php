<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input ?? '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit;
}

$design = isset($data['design']) ? (string) $data['design'] : '';
$format = isset($data['format']) ? (string) $data['format'] : '';

$allowedDesigns = ['classic', 'compact', 'magazine', 'overlay', 'two_column', 'two_photos'];
$allowedFormats = ['png', 'jpeg'];

if ($design === '' || !in_array($design, $allowedDesigns, true)) {
    http_response_code(422);
    echo json_encode(['error' => 'Unknown design']);
    exit;
}

if ($format === '' || !in_array($format, $allowedFormats, true)) {
    http_response_code(422);
    echo json_encode(['error' => 'Unknown export format']);
    exit;
}

require_once __DIR__ . '/lib/ads.php';

$exportDir = __DIR__ . '/data';
if (!is_dir($exportDir)) {
    mkdir($exportDir, 0775, true);
}

$logPath = $exportDir . '/exports.csv';
$needsHeader = !file_exists($logPath);

$record = [
    'timestamp' => (new DateTime('now', new DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s'),
    'username' => $_SESSION['username'],
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'design' => $design,
    'format' => $format,
];

$handle = fopen($logPath, 'a');
if ($handle === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to write log']);
    exit;
}

if (flock($handle, LOCK_EX)) {
    if ($needsHeader) {
        fputcsv($handle, array_keys($record));
    }
    fputcsv($handle, $record);
    fflush($handle);
    flock($handle, LOCK_UN);
}
fclose($handle);

try {
    $nextAds = advanceAdIndex();
} catch (RuntimeException $exception) {
    $nextAds = ['top' => '', 'bottom' => ''];
}

echo json_encode([
    'success' => true,
    'message' => 'Export logged. Ads rotated.',
    'nextAds' => $nextAds,
]);
