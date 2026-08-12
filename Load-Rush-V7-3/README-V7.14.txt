LOAD RUSH V7.14 — PRESTIGE HARD SYNC

- Prestige no longer maintains/invents its own current level.
- Before Prestige, its meter reads directly from lifetimeLevel(), the exact same function used by the Lifetime XP card.
- The Prestige panel rerenders inside renderAll(), so it updates on the same frame as the main level display.
- Example: main card Level 72 => Prestige 72/100.
- At 100/100, Prestige becomes available.
- When Prestiging, the app stores that canonical lifetime level as the new cycle baseline.
- After Prestige, the meter starts a fresh 1-100 cycle based on levels earned since that baseline.
