<?php
session_start();

if (!isset($_SESSION['username'])) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/lib/ads.php';

$username = $_SESSION['username'];
$mastheadPath = 'assets/masthead.svg';
$currentAds = ['top' => '', 'bottom' => ''];

try {
    $currentAds = getCurrentAdPair();
} catch (RuntimeException $exception) {
    $currentAds = ['top' => '', 'bottom' => ''];
}

$designOptions = [
    'classic' => 'Classic',
    'compact' => 'Compact',
    'magazine' => 'Magazine',
    'overlay' => 'Overlay',
    'two_column' => 'Two-column',
    'two_photos' => 'Two Photos',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Poster Studio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="app-shell">
<header class="app-header">
    <div>
        <h1>Poster Studio</h1>
        <p>Generate share-ready 1080×1350 news posters with auto-rotating ads.</p>
    </div>
    <div class="user-badge">
        <span>Signed in as <strong><?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?></strong></span>
        <a class="logout-link" href="logout.php">Logout</a>
    </div>
</header>
<main class="app-main">
    <section class="control-panel" aria-label="Poster controls">
        <div class="field-group">
            <label for="designSelect">Design template</label>
            <select id="designSelect" name="design">
                <?php foreach ($designOptions as $value => $label): ?>
                    <option value="<?php echo htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($label, ENT_QUOTES, 'UTF-8'); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="field-group">
            <label for="headlineInput">Headline</label>
            <input type="text" id="headlineInput" maxlength="180" placeholder="मुख्य शीर्षक यहाँ लिखें">
        </div>
        <div class="field-group">
            <label for="summaryInput">Summary / kicker</label>
            <input type="text" id="summaryInput" maxlength="200" placeholder="मुख्य बिंदु">
        </div>
        <div class="field-group">
            <label for="bodyInput">Body copy</label>
            <textarea id="bodyInput" rows="8" placeholder="विवरण यहाँ लिखें"></textarea>
        </div>
        <div class="field-group">
            <label for="bylineInput">Reporter &amp; location</label>
            <input type="text" id="bylineInput" maxlength="120" placeholder="रिपोर्टर • स्थान">
        </div>
        <div class="field-group">
            <label for="primaryPhotoInput">Primary photo</label>
            <input type="file" id="primaryPhotoInput" accept="image/*">
        </div>
        <div class="field-group">
            <label for="secondaryPhotoInput">Secondary photo (Two Photos)</label>
            <input type="file" id="secondaryPhotoInput" accept="image/*">
        </div>
        <div class="field-pair">
            <div class="field-group">
                <label for="backgroundColorInput">Poster background</label>
                <input type="color" id="backgroundColorInput" value="#ffffff">
            </div>
            <div class="field-group">
                <label for="accentColorInput">Accent color</label>
                <input type="color" id="accentColorInput" value="#c62828">
            </div>
        </div>
        <div class="actions">
            <button type="button" class="primary-button export" data-format="png">Export PNG</button>
            <button type="button" class="secondary-button export" data-format="jpeg">Export JPG</button>
            <button type="button" class="ghost-button" id="resetButton">Reset</button>
        </div>
        <p class="status-text" id="statusText" role="status" aria-live="polite"></p>
        <div class="ad-preview" aria-live="polite">
            <h2>Ad slots</h2>
            <div class="ad-slot">
                <span>Top</span>
                <img id="topAdPreview" src="<?php echo htmlspecialchars($currentAds['top'], ENT_QUOTES, 'UTF-8'); ?>" alt="Top ad preview">
            </div>
            <div class="ad-slot">
                <span>Bottom</span>
                <img id="bottomAdPreview" src="<?php echo htmlspecialchars($currentAds['bottom'], ENT_QUOTES, 'UTF-8'); ?>" alt="Bottom ad preview">
            </div>
        </div>
    </section>
    <section class="preview-panel" aria-label="Poster preview">
        <canvas id="posterCanvas" width="1080" height="1350" role="img" aria-label="Poster preview"></canvas>
    </section>
</main>
<script>
window.posterConfig = {
    username: <?php echo json_encode($username, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>,
    masthead: <?php echo json_encode($mastheadPath, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>,
    ads: <?php echo json_encode($currentAds, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>,
    designs: <?php echo json_encode($designOptions, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>
};
</script>
<script src="scripts.js"></script>
</body>
</html>
