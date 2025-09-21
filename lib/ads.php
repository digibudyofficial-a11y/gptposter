<?php
declare(strict_types=1);

/**
 * @return array<int, array{top: string, bottom: string}>
 */
function getAdPairs(): array
{
    $pairs = include __DIR__ . '/../data/ad_pairs.php';
    if (!is_array($pairs) || $pairs === []) {
        throw new RuntimeException('At least one ad pair must be configured.');
    }

    return $pairs;
}

function getAdIndexPath(): string
{
    return __DIR__ . '/../data/ad_index.json';
}

function ensureAdIndexFile(): void
{
    $path = getAdIndexPath();
    if (!file_exists($path)) {
        $directory = dirname($path);
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }
        file_put_contents($path, json_encode(['index' => 0], JSON_PRETTY_PRINT));
    }
}

function readAdIndex(): int
{
    $pairs = getAdPairs();
    $count = count($pairs);
    if ($count === 0) {
        return 0;
    }

    ensureAdIndexFile();
    $path = getAdIndexPath();
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        return 0;
    }

    try {
        if (!flock($handle, LOCK_SH)) {
            return 0;
        }
        rewind($handle);
        $contents = stream_get_contents($handle) ?: '';
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    $data = json_decode($contents, true);
    $index = is_array($data) && isset($data['index']) ? (int) $data['index'] : 0;

    if ($index < 0 || $index >= $count) {
        $index = 0;
    }

    return $index;
}

/**
 * @return array{top: string, bottom: string}
 */
function getCurrentAdPair(): array
{
    $pairs = getAdPairs();
    $index = readAdIndex();

    return $pairs[$index % count($pairs)];
}

/**
 * Advances the ad index and returns the next pair.
 *
 * @return array{top: string, bottom: string}
 */
function advanceAdIndex(): array
{
    $pairs = getAdPairs();
    $count = count($pairs);
    if ($count === 0) {
        return ['top' => '', 'bottom' => ''];
    }

    ensureAdIndexFile();
    $path = getAdIndexPath();
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        return $pairs[0];
    }

    $nextPair = $pairs[0];
    try {
        if (!flock($handle, LOCK_EX)) {
            return $nextPair;
        }
        rewind($handle);
        $contents = stream_get_contents($handle) ?: '';
        $data = json_decode($contents, true);
        $current = is_array($data) && isset($data['index']) ? (int) $data['index'] : 0;
        $next = ($current + 1) % $count;
        $nextPair = $pairs[$next];

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode(['index' => $next], JSON_PRETTY_PRINT));
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    return $nextPair;
}
