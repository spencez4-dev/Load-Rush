LOAD RUSH V7.3 — RECOVERY BUILD

FIXED
- Restored the missing ghost-vehicle child element that caused renderAll() to crash for users with historical race data.
- Restored the trophy element used by race celebrations.
- Restored race trophy, confetti, sounds, loot-box awards, hourly race counts, daily progress, XP, and load-log rendering.
- Restored the live hourly countdown and hour rollover behavior.
- Fixed dark-mode controls and made switch rendering tolerant of missing optional elements.
- Fixed the detention calculator losing focus every second; only clock text now refreshes.
- Preserved military-time input and +0130 calculation.

DATA RECOVERY
- Searches all known Load Rush/Pulse localStorage keys and selects the richest valid saved state.
- Recovers race-win totals and hourly race records from the load log when possible.
- Preserves explicit XP fields from older builds.
- Creates an automatic local backup before future saves.

INSTALL
Replace the repository root files with this package, commit, and refresh the installed PWA once.
