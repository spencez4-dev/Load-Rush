LOAD RUSH V3.6 — CONSOLIDATED DEBUG

WHY THIS BUILD EXISTS
Repeated GitHub Pages updates can leave an older service worker controlling the page.
That can mix a new index.html with an old app.js and make apparently unrelated features
stop working after each patch.

FIXED
- Rebuilt the hourly countdown as an isolated timer.
- Updates four times per second using the actual current time.
- Immediately corrects itself when the tab regains focus.
- Immediately corrects itself when returning from a background tab.
- New-hour reset remains intact.
- Reminder fix remains intact.
- Freight Fate daily milestone fix remains intact.

CACHE RESET
- Unregisters prior service workers.
- Deletes old Load Rush browser caches.
- Disables offline caching in this debug build.
- Adds unique version strings to app.js and styles.css.

UPLOAD
Replace every existing repository file with the files in this ZIP.
Commit the changes.

Then open:
?v=consolidated-debug-36

You may see one automatic refresh while the old service worker releases control.
After that, the badge should say:
LOAD RUSH · V3.6

Do not create a new repository unless this clean-cache build still fails.
