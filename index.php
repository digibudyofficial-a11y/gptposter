<?php
session_start();

if (isset($_SESSION['username'])) {
    header('Location: poster.php');
    exit;
}

$users = include __DIR__ . '/users.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username !== '' && isset($users[$username]) && password_verify($password, $users[$username])) {
        session_regenerate_id(true);
        $_SESSION['username'] = $username;
        header('Location: poster.php');
        exit;
    }

    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Poster Studio Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="auth-page">
    <main class="auth-card">
        <h1>Chandigarh Dinbhar Poster Studio</h1>
        <p class="auth-lead">Private newsroom tool for generating Hostinger-ready news posters.</p>
        <?php if ($error !== ''): ?>
            <div class="alert" role="alert"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>
        <form method="post" class="auth-form" autocomplete="off">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required autofocus>

            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>

            <button type="submit" class="primary-button">Sign in</button>
        </form>
    </main>
</body>
</html>
