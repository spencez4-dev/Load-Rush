# Load Rush — Time Zone Calculator Tab

This package adds a separate **Time Zone Calculator** tab to the current Load Rush app without changing any existing game or save-state logic.

## Install

1. Upload `timezone-calculator.js` to the root of your Load Rush GitHub repository.
2. Open `index.html`.
3. Find the existing line near the bottom:

```html
<script src="app.js?v=5.7.2" defer></script>
```

4. Put this line directly underneath it:

```html
<script src="timezone-calculator.js?v=1.0.0" defer></script>
```

The bottom of `index.html` should look like:

```html
<script src="app.js?v=5.7.2" defer></script>
<script src="timezone-calculator.js?v=1.0.0" defer></script>
</body>
</html>
```

5. Commit the changes. GitHub Pages should redeploy automatically.

## What it adds

- A **Time Zone Calculator** button in the Load Rush top navigation
- A separate full-page tab that preserves the existing header
- City search using Open-Meteo's free geocoding endpoint
- Live local clock with seconds
- IANA timezone name
- Current UTC offset, including daylight-saving changes
- Difference from the user's local time
- Recent city searches saved locally
- Responsive mobile layout
- Styling that follows Load Rush's existing light/dark theme

## Why this is an add-on file

The calculator is intentionally isolated from `app.js`. That means it does not alter Load Rush's load totals, XP, races, reminders, garage, settings, or saved localStorage state.
