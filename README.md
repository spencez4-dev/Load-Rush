# Load Rush — V5.7.2 Clean Master

This is the cleaned source-of-truth build. The visible app is unchanged from V5.7.1, including the small truck smoke effect.

## Project files

- `index.html` — app structure
- `styles.css` — all styling and animations
- `app.js` — game logic, storage, analytics, and UI behavior
- `manifest.webmanifest` — PWA metadata
- `sw.js` — service worker and stale-cache cleanup
- `icon-192.png` and `icon-512.png` — app icons

## Cleanup performed

- Removed nested historical builds
- Removed old version-specific README files
- Removed macOS `__MACOSX` metadata
- Kept one canonical copy of every runtime file
- Updated cache-busting query strings to V5.7.2
- Preserved existing localStorage keys and saved-data compatibility
- Preserved the truck exhaust/smoke animation

Upload these files directly to the root of the GitHub Pages repository.
