LOAD RUSH — RACE LAYER FIX

FIXED
- Vehicle/character now renders above every premium landscape layer.
- Idle activity bubble remains attached to the vehicle and above the landscape.
- Freight Fate scene objects render on the foreground plane.
- Vehicle effects get dedicated foreground z-index values.
- Road remains visible above foreground landscape art.

CAUSE
Premium landscapes use z-index 0 through 8. The road had no z-index and the
vehicle used z-index 5, which allowed landscape-ground / particles to paint
over Bryler and attached effects.

This patch changes layering only. Scoring, XP, prestige, detention,
race calculations, and saved data are untouched.
