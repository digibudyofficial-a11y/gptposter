# Chandigarh Dinbhar Poster Studio

A Hostinger-ready PHP 8.x web application for generating private newsroom posters (1080×1350) with auto-rotating advertisements and multiple layout presets.

## Features

- **Authentication** – Password-protected access backed by bcrypt hashes (`users.php`). Default account: `editor` / `newsroom123`.
- **Canvas designer** – Pure HTML5 canvas rendering driven by vanilla JavaScript with six poster layouts (Classic, Compact, Magazine, Overlay, Two-column, Two Photos).
- **Ad rotation** – Locked top/bottom ad slots that rotate through paired creatives after every successful export, persisted via filesystem state.
- **Fixed masthead** – Same-origin SVG masthead bundled with the repo to avoid CORS issues during exports while keeping the repo binary-free.
- **Hindi-friendly typography** – Interface and poster fonts prefer common Devanagari families; body copy is rendered with custom justification logic.
- **Exports & logging** – One-click PNG/JPG download buttons plus CSV logging of username, timestamp (IST), IP and layout for each export.
- **Footer automation** – Footer automatically shows site URL, India Standard Time stamp, and the signed-in user.
- **Hostinger compatible** – No database required; uses PHP sessions and filesystem storage only.

## Project structure

```
assets/            Masthead + ad slot SVG artwork (same-origin)
data/              Runtime files (ad index, export logs)
lib/ads.php        Helper functions for ad rotation persistence
index.php          Login screen
poster.php         Authenticated poster builder
log_export.php     Export logger + ad rotation endpoint
scripts.js         Canvas rendering + UI interactions
styles.css         Application styling
users.php          Bcrypt hashed credentials
```

## Setup

1. Deploy the repository to a PHP 8.x environment (e.g., Hostinger shared hosting).
2. Ensure the `data/` directory is writable by PHP for export logging and ad rotation.
3. Update `users.php` with newsroom-specific usernames and bcrypt hashes if needed.
4. Optionally replace the bundled masthead or ad creatives inside `assets/` with newsroom artwork. Provide SVG (or other text-based) assets with the same filenames to keep exports canvas-safe without adding binary files.
5. Visit the site, sign in with a configured user, and start designing posters.

## Usage notes

- Export buttons trigger both the canvas download and a server-side log entry. Ads rotate automatically after each logged export.
- Poster body copy is justified using a custom line-spacing algorithm to keep Hindi text neat.
- The secondary photo input is only used by the “Two Photos” layout; other layouts ignore it.
- All time stamps are generated in IST to match the footer requirement.

## Security

- Sessions protect authenticated routes; unauthenticated access to `poster.php` or `log_export.php` is blocked.
- Credentials are never stored in plaintext. To add users, generate a hash via `password_hash('new-password', PASSWORD_BCRYPT)` and update `users.php`.

## Development

- Run `php -l <file>` to lint PHP sources.
- Canvas logic lives in `scripts.js` and uses no external dependencies.
