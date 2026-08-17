LOAD RUSH V7.26 — PRESTIGE CUTSCENE RUNTIME FIX

FIXED
- Prestige confirmation previously called a nonexistent save() function.
- That threw a ReferenceError before lrRunPrestigeCutscene() could execute.
- Replaced it with the app's real saveState() persistence function.
- Prestige state now saves, the UI refreshes, and the ~30 second cinematic is called normally.

BASE
- V7.25 custom-fit Super Crowns
- V7.24 prestige cinematic
