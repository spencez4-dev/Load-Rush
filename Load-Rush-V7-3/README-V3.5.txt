LOAD RUSH V3.5 — ACTUAL REMINDER BUG FIX

ROOT CAUSE
The reminder list called escapeHtml(reminder.text), but escapeHtml() did not exist.
The first reminder therefore caused renderReminders() to throw a JavaScript error.
Because the button renders the list before opening the dialog, it looked like the
Reminders button had stopped working.

FIXED
- Added the missing escapeHtml() helper.
- Reminder dialog now opens before the list is rendered.
- Existing reminder data is validated before display.
- Multiple reminders remain supported.
- Existing Freight Fate fix remains unchanged.

UPLOAD
Replace the files in the same GitHub repository and commit.

Open once with:
?v=real-reminder-fix-v5

Badge:
LOAD RUSH · V3.5
