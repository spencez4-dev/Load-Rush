
'use strict';

const STORAGE_KEY = 'loadRushUltimateV1';
const LEGACY_KEYS = [
  'loadRushUltimateV1',
  'loadQuestStateV1',
  'pulseProState',
  'pulseCount',
  'loadRushState',
  'loadRushStateV1',
  'loadRushBackupV1',
  'loadRushAutoBackupV1'
];
const AUTO_BACKUP_KEY = 'loadRushAutoBackupV2';

const DEFAULTS = {
  log: [],
  dailyGoal: 150,
  hourlyGoal: 15,
  minutesPerUpdate: 5,
  raceWins: 0,
  completedHours: [],
  hourlyRaceAwards: {},
  selectedRig: 'starter-semi',
  selectedLandscape: 'alpine',
  theme: 'light',
  sound: true,
  soundStyle: 'orbit',
  particles: true,
  afternoonModeEnabled: true,
  fateEnabled: true,
  fateFrequency: 10,
  lastFateMilestone: 0,
  lastFateMilestoneDate: '',
  discoveredEvents: [],
  reminders: [],
  reminderAlarmEnabled: true,
  reminderAlarmWarningSeen: false,
  brandTitle: 'Wayfinder Logistics',
  seenUnlocks: [],
  ownedRigs: ['starter-semi'],
  crateTokens: 0,
  openedCrates: 0,
  rigLoadCounts: {},
  bonusXP: 0,
  lastRecapDate: ''
};

const RIGS = [
  { id: 'starter-semi', icon: '🚛', name: 'Starter Semi', type: 'SEMI', rarity: 'COMMON', weight: 30, reward: 'Classic violet road glow', accent: '#7458ff', rule: 'Unlocked from the start', unlocked: () => true },
  { id: 'box-truck', icon: '🚚', name: 'Box Truck Blitz', type: 'BOX TRUCK', rarity: 'COMMON', weight: 24, reward: 'Amber cargo pulse', accent: '#f59e0b', rule: 'Reach Level 5', unlocked: () => lifetimeLevel() >= 5 },
  { id: 'pickup', icon: '🛻', name: 'Mud Runner', type: 'PICKUP', rarity: 'COMMON', weight: 21, reward: 'Dusty trail', accent: '#92400e', rule: 'Build a 10-update combo', unlocked: () => comboStats().best >= 10 },
  { id: 'tractor', icon: '🚜', name: 'Field Hauler', type: 'HEAVY', rarity: 'UNCOMMON', weight: 16, reward: 'Fresh-cut green trail', accent: '#65a30d', rule: 'Reach Level 12', unlocked: () => lifetimeLevel() >= 12 },
  { id: 'delivery-van', icon: '🚐', name: 'Last Mile Legend', type: 'VAN', rarity: 'UNCOMMON', weight: 15, reward: 'Blue delivery streak', accent: '#2563eb', rule: 'Earn 1,000 Lifetime XP', unlocked: () => lifetimeXP() >= 1000 },
  { id: 'taxi', icon: '🚕', name: 'Yellow Jacket', type: 'CITY', rarity: 'UNCOMMON', weight: 14, reward: 'Golden road trail', accent: '#eab308', rule: 'Complete 5 hourly quests', unlocked: () => state.raceWins >= 5 },
  { id: 'fire-engine', icon: '🚒', name: 'Code Red', type: 'HEAVY', rarity: 'RARE', weight: 9, reward: 'Emergency flare trail', accent: '#dc2626', rule: 'Reach Level 25', unlocked: () => lifetimeLevel() >= 25 },
  { id: 'ambulance', icon: '🚑', name: 'Priority Freight', type: 'EXPRESS', rarity: 'RARE', weight: 8, reward: 'Pulse-light glow', accent: '#ef4444', rule: 'Complete 15 hourly quests', unlocked: () => state.raceWins >= 15 },
  { id: 'interceptor', icon: '🚓', name: 'Interceptor', type: 'PURSUIT', rarity: 'RARE', weight: 7, reward: 'Blue-red pursuit trail', accent: '#3b82f6', rule: 'Earn 3,500 Lifetime XP', unlocked: () => lifetimeXP() >= 3500 },
  { id: 'bus', icon: '🚌', name: 'People Mover', type: 'HEAVY', rarity: 'EPIC', weight: 4.5, reward: 'Confetti lane trail', accent: '#8b5cf6', rule: 'Reach Level 50', unlocked: () => lifetimeLevel() >= 50 },
  { id: 'trolley', icon: '🚎', name: 'City Circuit', type: 'TRANSIT', rarity: 'EPIC', weight: 4, reward: 'Electric wire shimmer', accent: '#14b8a6', rule: 'Complete 35 hourly quests', unlocked: () => state.raceWins >= 35 },
  { id: 'race-truck', icon: '🏎️', name: 'Redline Freight', type: 'RACE', rarity: 'EPIC', weight: 3.5, reward: 'Red speed streak', accent: '#ef4444', rule: 'Build a 25-update combo', unlocked: () => comboStats().best >= 25 },
  { id: 'construction', icon: '🏗️', name: 'Heavy Lift', type: 'CONSTRUCTION', rarity: 'EPIC', weight: 3, reward: 'Industrial gold sparks', accent: '#f59e0b', rule: 'Earn 8,000 Lifetime XP', unlocked: () => lifetimeXP() >= 8000 },
  { id: 'rocket', icon: '🚀', name: 'Rocket Hauler', type: 'MYTHIC', rarity: 'LEGENDARY', weight: 1.5, reward: 'Rocket flame boost', accent: '#f97316', rule: 'Reach Level 80', unlocked: () => lifetimeLevel() >= 80 },
  { id: 'ufo', icon: '🛸', name: 'Alien Dispatch', type: 'MYTHIC', rarity: 'MYTHIC', weight: .6, reward: 'Cosmic neon wake', accent: '#22d3ee', rule: 'Complete 75 hourly quests', unlocked: () => state.raceWins >= 75 },
  { id: 'crown', icon: '👑', name: 'King Freight', type: 'ROYAL', rarity: 'MYTHIC', weight: .35, reward: 'Royal rainbow wake', accent: '#fbbf24', rule: 'Reach Level 125', unlocked: () => lifetimeLevel() >= 125 },
  { id: 'sherm', icon: '🦑', name: 'Sherm', type: 'GARAGE ICON', rarity: 'BOUSE', weight: 2.2, reward: 'Ink-cloud violet trail', accent: '#7c3aed', rule: 'Reach Level 40', unlocked: () => lifetimeLevel() >= 40 },
  { id: 'shaun-white', icon: '🏂', name: 'Shaun White', type: 'GARAGE ICON', rarity: 'BAG', weight: 1.8, reward: 'Powder-white speed trail', accent: '#e5e7eb', rule: 'Complete 45 races', unlocked: () => state.raceWins >= 45 },
  { id: 'slotted-trotter', icon: '🏌️', name: 'Slotted Trotter', type: 'GARAGE ICON', rarity: 'TOUR STICK', weight: 1.25, reward: 'Fairway-green tracer', accent: '#16a34a', rule: 'Build a 40-update combo', unlocked: () => comboStats().best >= 40 },
  { id: 'vinny', icon: '🐳', name: 'Vinny', type: 'GARAGE ICON', rarity: 'VINES', weight: .9, reward: 'Deep-blue ocean wake', accent: '#0284c7', rule: 'Earn 12,000 Lifetime XP', unlocked: () => lifetimeXP() >= 12000 },
  { id: 'fromelts-boat', icon: '🚤', name: "Fromelt's Boat", type: 'GARAGE ICON', rarity: 'POWERS LAKE', weight: .55, reward: 'Lake-spray aqua trail', accent: '#0891b2', rule: 'Complete 100 races', unlocked: () => state.raceWins >= 100 },
  { id: 'slopes', icon: '⛷️', name: 'Slopes', type: 'LOOT EXCLUSIVE', rarity: 'POWDER', weight: .55, reward: 'Ski-jump trick animation on every +', accent: '#dbeafe', rule: 'Loot box exclusive', unlocked: () => false },
  { id: 'grrr', icon: '🐅', name: 'GRRR', type: 'LOOT EXCLUSIVE', rarity: 'PREDATOR', weight: .42, reward: 'Tiger lunge attack on every +', accent: '#f97316', rule: 'Loot box exclusive', unlocked: () => false },
  { id: 'otter', icon: '🦦', name: 'Otter', type: 'LOOT EXCLUSIVE', rarity: 'SPLASH', weight: .65, reward: 'Water-swim chaos on every +', accent: '#38bdf8', rule: 'Loot box exclusive', unlocked: () => false },
  { id: 'prestige-zebra', icon: '🦓', name: 'The Zebra', type: 'PRESTIGE', rarity: 'PRESTIGE VII', weight: 0, reward: 'Black-and-white prestige streak', accent: '#f8fafc', rule: 'Reach Prestige 7', unlocked: () => lrPrestigeRank() >= 7 },
  { id: 'byler', icon: '🏄‍♂️', name: 'Bryler', type: 'SURF TRUCK', rarity: 'SURF SIDE', weight: .02, reward: 'Ocean-wave road shimmer', accent: '#06b6d4', rule: 'Reach Level 250 + complete 250 hourly quests', unlocked: () => lifetimeLevel() >= 250 && state.raceWins >= 250 }
];



const LANDSCAPES = [
  { id: 'alpine', name: 'Alpine Route', icon: '🏔️', rarity: 'SIGNATURE', accent: '#5ca66f', goal: 0, description: 'A polished mountain corridor built for the Hourly Quest.' }
];

function selectedLandscape() {
  if (state.selectedLandscape !== 'alpine') state.selectedLandscape = 'alpine';
  return LANDSCAPES[0];
}

function isLandscapeUnlocked(landscape) {
  return state.raceWins >= landscape.goal;
}

function applyLandscape() {
  const world = $('roadWorld');
  const landscape = selectedLandscape();
  if (!world) return;
  world.dataset.landscape = landscape.id;
  world.setAttribute('aria-label', `Hourly quest race through ${landscape.name}`);
  document.documentElement.style.setProperty('--landscape-accent', landscape.accent);
}

const FATE_EVENTS = [
  {
    id: 'nitro',
    name: 'Nitro Boost',
    icon: '🔥',
    rarity: 'COMMON',
    weight: 24,
    description: 'The rig hits the boost and briefly exits the known universe.',
    sceneClass: 'fate-nitro'
  },
  {
    id: 'rain',
    name: 'Thunder Run',
    icon: '🌧️',
    rarity: 'COMMON',
    weight: 18,
    description: 'A dramatic storm rolls in. Dispatch continues anyway.',
    worldClass: 'fate-rain'
  },
  {
    id: 'cones',
    name: 'Cone Slalom',
    icon: '🚧',
    rarity: 'COMMON',
    weight: 17,
    description: 'Construction cones appear. Your driver becomes weirdly athletic.',
    objects: ['🚧','🚧','🚧','🚧']
  },
  {
    id: 'ducks',
    name: 'Duck Crossing',
    icon: '🦆',
    rarity: 'COMMON',
    weight: 15,
    description: 'A family of ducks claims right of way. The rig respectfully waits.',
    objects: ['🦆','🦆','🦆','🦆','🦆']
  },
  {
    id: 'speedtrap',
    name: 'Speed Trap',
    icon: '🚓',
    rarity: 'RARE',
    weight: 9,
    description: 'The rig gets pulled over, then immediately waved through for excellent paperwork.',
    objects: ['🚓','🚨']
  },
  {
    id: 'ufo',
    name: 'UFO Abduction',
    icon: '🛸',
    rarity: 'RARE',
    weight: 7,
    description: 'Aliens borrow the rig for research and return it with a full tank.',
    sceneClass: 'fate-abduct',
    objects: ['🛸']
  },
  {
    id: 'tornado',
    name: 'Freight Tornado',
    icon: '🌪️',
    rarity: 'RARE',
    weight: 5,
    description: 'The truck spins twice, lands perfectly, and refuses to elaborate.',
    sceneClass: 'fate-spin',
    objects: ['🌪️']
  },
  {
    id: 'dino',
    name: 'Dino Chase',
    icon: '🦖',
    rarity: 'EPIC',
    weight: 2.5,
    description: 'A T-Rex joins the route. The rig finds another gear.',
    sceneClass: 'fate-nitro',
    objects: ['🦖']
  },
  {
    id: 'rainbow',
    name: 'Rainbow Road',
    icon: '🌈',
    rarity: 'EPIC',
    weight: 1.8,
    description: 'The highway enters arcade mode for five glorious seconds.',
    worldClass: 'fate-rainbow',
    objects: ['⭐','🌈','⭐']
  },
  {
    id: 'ceo',
    name: 'CEO Visit',
    icon: '☎️',
    rarity: 'LEGENDARY',
    weight: .7,
    description: 'A mysterious executive calls only to say: “Outstanding work.”',
    objects: ['☎️','👔','✨']
  },
  {
    id: 'classified-convoy',
    name: 'Classified Convoy',
    icon: '🕶️',
    rarity: 'PRESTIGE',
    weight: 2.4,
    prestigeMin: 4,
    description: 'Unmarked vehicles appear. Nobody asks questions.',
    sceneClass: 'fate-nitro',
    objects: ['🚓','🕶️','🚙','🚨']
  },
  {
    id: 'reality-tear',
    name: 'Reality Tear',
    icon: '🌀',
    rarity: 'PRESTIGE',
    weight: 1.6,
    prestigeMin: 6,
    description: 'Dispatch accidentally opens a hole in spacetime.',
    worldClass: 'fate-rainbow',
    sceneClass: 'fate-spin',
    objects: ['🌀','✨','🌀','⚡']
  },
  {
    id: 'meteor-freight',
    name: 'Meteor Freight',
    icon: '☄️',
    rarity: 'COSMIC',
    weight: 1.1,
    prestigeMin: 9,
    description: 'The freight lane is now technically in outer space.',
    worldClass: 'fate-rainbow',
    sceneClass: 'fate-nitro',
    objects: ['☄️','🌠','☄️','✨','🌠']
  },
  {
    id: 'immortal-run',
    name: 'Immortal Run',
    icon: '♾️',
    rarity: 'IMMORTAL',
    weight: .55,
    prestigeMin: 10,
    description: 'The road has accepted that you cannot be stopped.',
    worldClass: 'fate-rainbow',
    sceneClass: 'fate-nitro',
    objects: ['♾️','🔥','🌈','⚡','♾️']
  }
];


const $ = id => document.getElementById(id);

function stateRichness(candidate) {
  if (!candidate || typeof candidate !== 'object') return -1;
  const log = Array.isArray(candidate.log) ? candidate.log : [];
  const positiveLog = log.reduce((sum, entry) => sum + Math.max(0, Number(entry?.delta) || 0), 0);
  const explicitXP = Math.max(0, Number(candidate.lifetimeXP) || Number(candidate.totalXP) || Number(candidate.xp) || 0);
  const wins = Math.max(0, Number(candidate.raceWins) || Number(candidate.totalRaceWins) || 0);
  const crates = Math.max(0, Number(candidate.crateTokens) || 0);
  return (log.length * 1000) + positiveLog + explicitXP + (wins * 100) + (crates * 10);
}

function parseStoredCandidate(key, raw) {
  if (!raw) return null;
  try {
    if (key === 'pulseCount') {
      const count = Number(raw) || 0;
      return {
        ...DEFAULTS,
        log: count > 0
          ? Array.from({ length: count }, (_, index) => ({
              delta: 1,
              time: Date.now() - index * 1000,
              xp: 1
            }))
          : []
      };
    }
    return migrateLegacyState(JSON.parse(raw));
  } catch (error) {
    console.warn(`Could not read stored Load Rush state from ${key}:`, error);
    return null;
  }
}

function readStoredState() {
  const candidates = [];
  const seen = new Set();
  const keys = [...LEGACY_KEYS, AUTO_BACKUP_KEY];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && /load.?rush|load.?quest|pulse/i.test(key)) keys.push(key);
  }

  for (const key of keys) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const parsed = parseStoredCandidate(key, localStorage.getItem(key));
    if (parsed) candidates.push({ key, state: parsed, score: stateRichness(parsed) });
  }

  if (!candidates.length) return { ...DEFAULTS };
  candidates.sort((a, b) => b.score - a.score);
  const recovered = candidates[0];
  if (recovered.key !== STORAGE_KEY) {
    console.info(`Recovered Load Rush progress from ${recovered.key}.`);
  }
  return recovered.state;
}

function migrateLegacyState(legacy) {
  const log = Array.isArray(legacy.log)
    ? legacy.log
        .filter(entry => entry && Number.isFinite(Number(entry.delta)) && Number.isFinite(Number(entry.time)))
        .map(entry => ({
          delta: Number(entry.delta),
          time: Number(entry.time),
          xp: Number.isFinite(Number(entry.xp)) ? Number(entry.xp) : Number(entry.delta)
        }))
    : [];

  const explicitXP = Math.max(0, Number(legacy.lifetimeXP) || Number(legacy.totalXP) || Number(legacy.xp) || 0);
  const logXP = log.reduce((sum, entry) => sum + Math.max(0, Number(entry.xp) || Number(entry.delta) || 0), 0);

  return {
    ...DEFAULTS,
    ...legacy,
    log,
    selectedRig:
      legacy.selectedRig ||
      legacy.selectedVehicle ||
      legacy.selectedHorse ||
      DEFAULTS.selectedRig,
    dailyGoal: Number(legacy.dailyGoal) || DEFAULTS.dailyGoal,
    hourlyGoal: Number(legacy.hourlyGoal) || DEFAULTS.hourlyGoal,
    minutesPerUpdate: Number(legacy.minutesPerUpdate) || DEFAULTS.minutesPerUpdate,
    raceWins: Math.max(0, Number(legacy.raceWins) || Number(legacy.totalRaceWins) || 0),
    bonusXP: Math.max(Number(legacy.bonusXP) || 0, explicitXP - logXP),
    hourlyRaceAwards: legacy.hourlyRaceAwards && typeof legacy.hourlyRaceAwards === 'object' ? legacy.hourlyRaceAwards : {},
    completedHours: Array.isArray(legacy.completedHours)
      ? legacy.completedHours
      : Array.isArray(legacy.completedRaceHours)
        ? legacy.completedRaceHours
        : []
  };
}

const state = {
  ...DEFAULTS,
  ...readStoredState()
};

let audioContext = null;
let previousHourKey = currentHourKey();
let previousDayKey = todayKey();
let hourlyClockInterval = null;
let toastTimer = null;
let activeChartPeriod = 'shift';
let currentSummaryDate = todayKey();
let pendingFateMilestone = null;
let activeFateTimeout = null;
let activeReminderId = null;
let pendingReminderDraft = null;
let alarmAudioContext = null;
let alarmOscillators = [];
let alarmPulseTimer = null;

function reconcileProgressFromLog() {
  if (!Array.isArray(state.log) || state.log.length === 0) return;
  const byHour = {};
  for (const entry of state.log) {
    const time = Number(entry?.time);
    const delta = Number(entry?.delta);
    if (!Number.isFinite(time) || !Number.isFinite(delta)) continue;
    const key = currentHourKey(new Date(time));
    byHour[key] = (byHour[key] || 0) + delta;
  }

  const awards = state.hourlyRaceAwards && typeof state.hourlyRaceAwards === 'object'
    ? { ...state.hourlyRaceAwards }
    : {};
  let reconstructedWins = 0;
  for (const [key, total] of Object.entries(byHour)) {
    const wins = Math.max(0, Math.floor(Math.max(0, total) / Math.max(1, Number(state.hourlyGoal) || DEFAULTS.hourlyGoal)));
    awards[key] = Math.max(Number(awards[key]) || 0, wins);
    reconstructedWins += wins;
  }

  state.hourlyRaceAwards = awards;
  state.raceWins = Math.max(Number(state.raceWins) || 0, reconstructedWins);
}

function saveState() {
  const clean = {
    ...state,
    log: Array.isArray(state.log) ? state.log.slice(0, 3000) : [],
    completedHours: Array.isArray(state.completedHours) ? state.completedHours.slice(-500) : [],
    hourlyRaceAwards: state.hourlyRaceAwards && typeof state.hourlyRaceAwards === 'object' ? state.hourlyRaceAwards : {}
  };

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) localStorage.setItem(AUTO_BACKUP_KEY, existing);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (error) {
    console.error('Could not save Load Rush progress:', error);
  }
}



function renderBrandTitle() {
  const brandTitle = $('brandTitle');
  if (!brandTitle) return;

  const value = String(state.brandTitle || 'Wayfinder Logistics').trim() || 'Wayfinder Logistics';
  brandTitle.textContent = value;
  document.title = value;
}

function editBrandTitle() {
  const current = String(state.brandTitle || 'Wayfinder Logistics');
  const next = window.prompt('Change the heading text:', current);

  if (next === null) return;

  const cleaned = next.trim().slice(0, 48);
  state.brandTitle = cleaned || 'Wayfinder Logistics';
  saveState();
  renderBrandTitle();
  showToast('Heading updated');
}

function todayKey(date = new Date()) {
  return date.toDateString();
}

function currentHourKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
}

function todaysEntries() {
  const key = todayKey();
  return state.log.filter(entry => todayKey(new Date(entry.time)) === key);
}

function netTotal(entries) {
  return entries.reduce((sum, entry) => sum + entry.delta, 0);
}

function todayNetLoads() {
  return Math.max(0, netTotal(todaysEntries()));
}

function hourNetLoads(date = new Date()) {
  const key = currentHourKey(date);
  const entries = state.log.filter(entry => currentHourKey(new Date(entry.time)) === key);
  return Math.max(0, netTotal(entries));
}

function lifetimeXP() {
  const trackedXP = state.log.reduce((sum, entry) => {
    const fallback = Number(entry.delta) || 0;
    const value = Number.isFinite(Number(entry.xp)) ? Number(entry.xp) : fallback;
    return sum + value;
  }, 0);
  return Math.max(0, trackedXP + (Number(state.bonusXP) || 0));
}

// Faster early progression that still stretches into a meaningful endgame.
// Level 50 is roughly 4,080 XP; Level 100 is roughly 15,700 XP.
function levelStartXP(level) {
  const completedLevels = Math.max(0, Number(level) - 1);
  return Math.round((10 * completedLevels) + (1.5 * completedLevels * completedLevels));
}

function lifetimeLevel() {
  const xp = lifetimeXP();
  let low = 1;
  let high = 2;
  while (levelStartXP(high) <= xp) high *= 2;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (levelStartXP(middle) <= xp) low = middle;
    else high = middle;
  }
  return low;
}

function currentLevelDetails() {
  const level = lifetimeLevel();
  const xp = lifetimeXP();
  const start = levelStartXP(level);
  const next = levelStartXP(level + 1);
  const earned = Math.max(0, xp - start);
  const needed = Math.max(1, next - start);
  return { level, earned, needed, percent: Math.min(100, (earned / needed) * 100) };
}

function currentLevelProgress() {
  return currentLevelDetails().percent;
}

function hourlyTotalsToday() {
  const totals = {};

  for (const entry of todaysEntries()) {
    const key = currentHourKey(new Date(entry.time));
    totals[key] = (totals[key] || 0) + entry.delta;
  }

  return totals;
}

function bestHour() {
  const values = Object.values(hourlyTotalsToday()).map(value => Math.max(0, value));
  return Math.max(0, ...values);
}

function hourlyStreak() {
  let streak = 0;
  const now = new Date();

  for (let index = 0; index < 24; index += 1) {
    const date = new Date(now);
    date.setHours(now.getHours() - index, 0, 0, 0);

    const count = hourNetLoads(date);

    if (count >= state.hourlyGoal) {
      streak += 1;
    } else if (index === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function comboStats(now = Date.now()) {
  if (Number(state.afternoonFrenzyUntil || 0) > now) {
    return { current: 10, best: Math.max(10, Number(state.bestCombo || 0)), multiplier: 10, remainingMs: state.afternoonFrenzyUntil - now, afternoonFrenzy: true };
  }

  const windowMs = 3 * 60 * 1000;
  const entries = todaysEntries().slice().sort((a, b) => a.time - b.time);
  let current = 0;
  let best = 0;
  let lastPositiveTime = 0;

  for (const entry of entries) {
    if (entry.delta <= 0) {
      current = 0;
      lastPositiveTime = 0;
      continue;
    }

    if (lastPositiveTime && entry.time - lastPositiveTime <= windowMs) {
      current += 1;
    } else {
      current = 1;
    }

    lastPositiveTime = entry.time;
    best = Math.max(best, current);
  }

  const active = lastPositiveTime && now - lastPositiveTime <= windowMs;
  const remainingMs = active ? Math.max(0, windowMs - (now - lastPositiveTime)) : 0;
  return {
    current: active ? current : 0,
    best,
    remainingMs,
    multiplier: current >= 10 ? 5 : current >= 5 ? 3 : current >= 3 ? 2 : current > 0 ? 1 : 0
  };
}

function renderComboMeter() {
  const meter = $('comboMeter');
  if (!meter) return;

  const stats = comboStats();
  const seconds = Math.ceil(stats.remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  const timeLabel = `${minutes}:${String(remainder).padStart(2, '0')}`;
  const fill = stats.remainingMs > 0 ? (stats.remainingMs / (3 * 60 * 1000)) * 100 : 0;

  $('comboValue').textContent = stats.current ? `${stats.current}x` : '0x';
  $('comboLabel').textContent = stats.current >= 10 ? 'FREIGHT FRENZY' : stats.current >= 5 ? 'HOT STREAK' : stats.current >= 3 ? 'COMBO ACTIVE' : stats.current ? 'CHAIN STARTED' : 'COMBO READY';
  $('comboHint').textContent = stats.current
    ? `${timeLabel} to keep it alive · ${stats.multiplier}× Lifetime XP`
    : `Add another load within 3:00 to build a streak · best today ${stats.best}x`;
  $('comboFill').style.width = `${fill}%`;
  meter.dataset.tier = stats.multiplier >= 5 ? '5' : stats.multiplier >= 3 ? '3' : stats.multiplier >= 2 ? '2' : '1';
}

function bestGhostHour(now = new Date()) {
  const currentKey = currentHourKey(now);
  const buckets = new Map();

  for (const entry of state.log) {
    const date = new Date(entry.time);
    const key = currentHourKey(date);
    if (key === currentKey) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }

  let best = null;
  for (const [key, entries] of buckets) {
    const total = Math.max(0, netTotal(entries));
    if (!best || total > best.total) best = { key, entries, total };
  }

  if (!best || best.total <= 0) return null;

  const elapsed = now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const sorted = best.entries.slice().sort((a, b) => a.time - b.time);

  // Build cumulative checkpoints from the best historical hour. The ghost then
  // interpolates between checkpoints so it continuously cruises instead of
  // appearing frozen and jumping only when an old load timestamp is crossed.
  const checkpoints = [{ second: 0, count: 0 }];
  let cumulative = 0;

  for (const entry of sorted) {
    const date = new Date(entry.time);
    const second = date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
    cumulative = Math.max(0, cumulative + entry.delta);
    checkpoints.push({ second, count: cumulative });
  }

  // Hold the final historical score through the end of the hour.
  checkpoints.push({ second: 3600, count: Math.max(0, cumulative) });

  let ghostCount = checkpoints[checkpoints.length - 1].count;
  for (let index = 1; index < checkpoints.length; index += 1) {
    const previous = checkpoints[index - 1];
    const next = checkpoints[index];
    if (elapsed <= next.second) {
      const span = Math.max(0.001, next.second - previous.second);
      const phase = Math.max(0, Math.min(1, (elapsed - previous.second) / span));
      // Smoothstep creates a natural acceleration and coast into each checkpoint.
      const eased = phase * phase * (3 - 2 * phase);
      ghostCount = previous.count + (next.count - previous.count) * eased;
      break;
    }
  }

  return { count: ghostCount, total: best.total, key: best.key };
}

function renderGhostTruck() {
  const ghost = $('ghostVehicle');
  if (!ghost) return;

  const data = bestGhostHour();
  if (!data) {
    ghost.hidden = true;
    return;
  }

  const progress = Math.min(100, (data.count / Math.max(1, state.hourlyGoal)) * 100);
  ghost.hidden = false;
  ghost.style.right = `${progress}%`;
  const ghostIcon = $('ghostVehicleIcon');
  if (ghostIcon) ghostIcon.textContent = selectedRig().icon;
  ghost.title = `Best-hour ghost: ${data.count.toFixed(1)} loads at this point (${data.total} total)`;
}


const SUPER_LOAD_GOAL = 1000;

function rigLoadCount(rigId) {
  return Math.max(0, Number(state.rigLoadCounts?.[rigId]) || 0);
}

function isSuperRig(rigId) {
  return rigLoadCount(rigId) >= SUPER_LOAD_GOAL;
}

function superRigProgress(rigId) {
  return Math.min(SUPER_LOAD_GOAL, rigLoadCount(rigId));
}

// V7.28 — Super rigs use a permanent Rainbow Road-style aura instead of crowns.
// Keeping this purely cosmetic means all mastery/progression behavior stays unchanged.
function rigIconMarkup(rig, context='race') {
  const superActive = isSuperRig(rig.id);
  const superClass = superActive ? ' is-super' : '';
  return `<span class="rig-emoji-composite ${context}${superClass}" data-rig-id="${escapeHtml(rig.id)}" aria-label="${escapeHtml(rig.name)}"><span class="rig-emoji-base">${rig.icon}</span></span>`;
}

function ownedRigIds() { const owned = new Set(Array.isArray(state.ownedRigs) ? state.ownedRigs : ['starter-semi']); owned.add('starter-semi'); return [...owned]; }
function isRigOwned(rigId) { const rig = RIGS.find(item => item.id === rigId); return Boolean(rig && (ownedRigIds().includes(rigId) || rig.unlocked())); }
function unlockedRigIds() { return RIGS.filter(rig => isRigOwned(rig.id)).map(rig => rig.id); }
function initializeUnlockTracking() { state.ownedRigs = ownedRigIds(); if (!Number.isFinite(Number(state.crateTokens))) state.crateTokens = 0; if (!Number.isFinite(Number(state.bonusXP))) state.bonusXP = 0; if (!Number.isFinite(Number(state.openedCrates))) state.openedCrates = 0; if (!Array.isArray(state.seenUnlocks) || state.seenUnlocks.length === 0) state.seenUnlocks = unlockedRigIds(); if (!isRigOwned(state.selectedRig)) state.selectedRig = 'starter-semi'; saveState(); }
function announceNewUnlocks() { const seen = new Set(Array.isArray(state.seenUnlocks) ? state.seenUnlocks : []); const fresh = RIGS.filter(rig => rig.unlocked() && !seen.has(rig.id)); if (!fresh.length) return; fresh.forEach(rig => seen.add(rig.id)); state.seenUnlocks = [...seen]; saveState(); const rig = fresh[fresh.length - 1]; flashMegaMessage(rig.id === 'byler' ? 'SURF SIDE: BYLER!' : `NEW TRUCK: ${rig.name.toUpperCase()}!`); showToast(`${rig.rarity} gameplay unlock · ${rig.reward}`); }
function weightedCrateRig() {
  const locked = RIGS.filter(rig => !isRigOwned(rig.id));
  if (!locked.length) return null;
  const total = locked.reduce((sum, rig) => sum + rig.weight, 0);
  let roll = Math.random() * total;
  for (const rig of locked) {
    roll -= rig.weight;
    if (roll <= 0) return rig;
  }
  return locked[locked.length - 1];
}


function lrRollBulkCrate() {
  state.crateTokens = Math.max(0, (Number(state.crateTokens) || 0) - 1);
  state.openedCrates = (state.openedCrates || 0) + 1;

  const locked = RIGS.filter(rig => !isRigOwned(rig.id));
  const rigChance = lrPrestigeRank() >= 8 ? .25 : .16;
  const rig = locked.length && Math.random() < rigChance ? weightedCrateRig() : null;

  if (rig) {
    state.ownedRigs = [...new Set([...ownedRigIds(), rig.id])];
    state.seenUnlocks = [...new Set([...(state.seenUnlocks || []), rig.id])];
    return { type:'rig', icon:rig.icon, title:rig.name, detail:`${rig.rarity} · ${rig.reward}`, rig };
  }

  const roll=Math.random();
  if(roll<.48){
    const xp=[35,50,75][Math.floor(Math.random()*3)];
    state.bonusXP=(Number(state.bonusXP)||0)+xp;
    return {type:'xp',icon:'⚡',title:`+${xp} XP`,detail:'XP Cache',xp};
  }
  if(roll<.70){
    state.bonusXP=(Number(state.bonusXP)||0)+125;
    return {type:'xp',icon:'💎',title:'+125 XP',detail:'Epic XP',xp:125};
  }
  if(roll<.86){
    state.crateTokens=(Number(state.crateTokens)||0)+1;
    return {type:'box',icon:'🔁',title:'+1 Loot Box',detail:'Free Reroll',boxes:1};
  }
  if(roll<.96){
    state.crateTokens=(Number(state.crateTokens)||0)+2;
    return {type:'box',icon:'🎁',title:'+2 Loot Boxes',detail:'Double Drop',boxes:2};
  }
  state.bonusXP=(Number(state.bonusXP)||0)+300;
  return {type:'xp',icon:'🌟',title:'+300 XP',detail:'MYTHIC Mega XP',xp:300};
}

function lrOpenAllCrates(){
  const starting=Math.max(0,Number(state.crateTokens)||0);
  if(starting<1){showToast('No loot boxes ready');return;}

  // "Open All" means the boxes you have right now. Any refunded/bonus boxes
  // won in this batch remain in the garage afterward instead of causing an infinite loop.
  const results=[];
  for(let i=0;i<starting;i++) results.push(lrRollBulkCrate());

  saveState();
  renderAll();
  closeDialog($('garageDialog'));

  const xp=results.reduce((n,r)=>n+(r.xp||0),0);
  const characters=results.filter(r=>r.type==='rig');
  const bonusBoxes=Math.max(0,Number(state.crateTokens)||0);

  $('crateAllResultsTitle').textContent=`${starting} box${starting===1?'':'es'} opened.`;
  $('crateAllHero').textContent=characters.length?'🔥':'🎁';
  $('crateAllSummary').innerHTML=`
    <div><span>BOXES OPENED</span><strong>${starting}</strong></div>
    <div><span>XP WON</span><strong>+${xp}</strong></div>
    <div><span>NEW RIDES</span><strong>${characters.length}</strong></div>
    <div><span>BOXES WON BACK</span><strong>${bonusBoxes}</strong></div>
  `;
  $('crateAllResultsGrid').innerHTML=results.map((r,i)=>`
    <article class="crate-all-result ${r.type==='rig'?'character-drop':''}">
      <span class="crate-all-number">#${i+1}</span>
      <div class="crate-all-icon">${r.icon}</div>
      <strong>${escapeHtml(r.title)}</strong>
      <small>${escapeHtml(r.detail)}</small>
    </article>
  `).join('');

  openDialog($('crateAllResultsDialog'));
  if(state.sound) playTone('plus',characters.length>0||xp>=300);
  particleBurst($('crateAllHero'),Math.min(160,50+starting*4),2);
}

function openTruckCrate() {
  if ((state.crateTokens || 0) < 1) {
    showToast('No loot boxes ready — complete a race to earn one');
    return;
  }

  closeDialog($('garageDialog'));
  openDialog($('crateRevealDialog'));

  const stage = $('crateRevealStage');
  const icon = $('crateRevealIcon');
  const rarity = $('crateRevealRarity');
  const title = $('crateRevealTitle');
  const description = $('crateRevealDescription');
  const continueButton = $('closeCrateRevealBtn');

  stage.classList.remove('revealed', 'jackpot');
  stage.classList.add('opening');
  icon.textContent = '🎁';
  rarity.textContent = 'OPENING';
  title.textContent = 'The crate is shaking...';
  description.textContent = 'Truck, XP, refund, jackpot... who knows.';
  continueButton.disabled = true;

  state.crateTokens -= 1;
  state.openedCrates = (state.openedCrates || 0) + 1;
  saveState();
  renderAll();

  setTimeout(() => {
    // Character drops are meaningful now, especially the three loot exclusives.
    const locked = RIGS.filter(rig => !isRigOwned(rig.id));
    const rigChance = lrPrestigeRank() >= 8 ? .25 : .16;
  const rig = locked.length && Math.random() < rigChance ? weightedCrateRig() : null;

    stage.classList.remove('opening');
    stage.classList.add('revealed');

    if (rig) {
      state.ownedRigs = [...new Set([...ownedRigIds(), rig.id])];
      state.seenUnlocks = [...new Set([...(state.seenUnlocks || []), rig.id])];
      saveState();
      renderAll();

      stage.classList.add('jackpot');
      icon.innerHTML = rigIconMarkup(rig, 'crate');
      rarity.textContent = rig.rarity;
      title.textContent = rig.id === 'byler' ? 'SURF SIDE: BRYLER!' : `${rig.name.toUpperCase()} UNLOCKED!`;
      description.textContent = `${rig.reward} · Added to your garage.`;
      particleBurst(stage, 110, 2.3);
      playTone('plus', true);
    } else {
      const roll = Math.random();

      if (roll < .48) {
        const xpReward = [35,50,75][Math.floor(Math.random()*3)];
        state.bonusXP = (Number(state.bonusXP) || 0) + xpReward;
        icon.textContent = '⚡';
        rarity.textContent = 'XP CACHE';
        title.textContent = `+${xpReward} Lifetime XP`;
        description.textContent = 'Straight into the level meter.';
        particleBurst(stage, 55, 1.5);
        playTone('plus', xpReward >= 75);
      } else if (roll < .70) {
        const xpReward = 125;
        state.bonusXP = (Number(state.bonusXP) || 0) + xpReward;
        stage.classList.add('jackpot');
        icon.textContent = '💎';
        rarity.textContent = 'EPIC XP';
        title.textContent = '+125 Lifetime XP';
        description.textContent = 'Now THAT is a box.';
        particleBurst(stage, 90, 2);
        playTone('plus', true);
      } else if (roll < .86) {
        state.crateTokens = (Number(state.crateTokens) || 0) + 1;
        icon.textContent = '🔁';
        rarity.textContent = 'FREE REROLL';
        title.textContent = 'LOOT BOX REFUNDED';
        description.textContent = 'You got the box back. Run it again.';
        particleBurst(stage, 55, 1.5);
        playTone('plus', false);
      } else if (roll < .96) {
        state.crateTokens = (Number(state.crateTokens) || 0) + 2;
        stage.classList.add('jackpot');
        icon.textContent = '🎁';
        rarity.textContent = 'DOUBLE DROP';
        title.textContent = '+2 LOOT BOXES';
        description.textContent = 'The box reproduced. Logistics miracle.';
        particleBurst(stage, 95, 2.1);
        playTone('plus', true);
      } else {
        const xpReward = 300;
        state.bonusXP = (Number(state.bonusXP) || 0) + xpReward;
        stage.classList.add('jackpot');
        icon.textContent = '🌟';
        rarity.textContent = 'MYTHIC';
        title.textContent = 'MEGA XP JACKPOT';
        description.textContent = '+300 Lifetime XP. Absolute heater.';
        particleBurst(stage, 140, 2.8);
        playTone('plus', true);
      }

      saveState();
      renderAll();
      announceNewUnlocks();
    }

    continueButton.disabled = false;
  }, 1350);
}

function selectedRig() {
  const candidate = RIGS.find(rig => rig.id === state.selectedRig);

  if (candidate && isRigOwned(candidate.id)) {
    return candidate;
  }

  state.selectedRig = DEFAULTS.selectedRig;
  return RIGS[0];
}

function secondsUntilNextHour() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return Math.max(0, Math.ceil((next - now) / 1000));
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return hours > 0
    ? `${hours}h ${remainder}m`
    : `${remainder} min`;
}

function renderAll() {
  if (state.lastFateMilestoneDate && state.lastFateMilestoneDate !== todayKey()) {
    state.lastFateMilestone = 0;
    state.lastFateMilestoneDate = todayKey();
    saveState();
  }
  const today = todayNetLoads();
  const hour = hourNetLoads();
  const lifetime = lifetimeXP();
  const level = lifetimeLevel();
  const levelDetails = currentLevelDetails();
  const levelProgress = levelDetails.percent;
  const completedRacesThisHour = Math.floor(hour / Math.max(1, state.hourlyGoal));
  const currentRaceLoads = hour % Math.max(1, state.hourlyGoal);
  const hourlyProgress = (currentRaceLoads / Math.max(1, state.hourlyGoal)) * 100;
  const dailyProgress = Math.min(100, Math.round((today / Math.max(1, state.dailyGoal)) * 100));
  const rig = selectedRig();
  if (!isLandscapeUnlocked(selectedLandscape())) state.selectedLandscape = 'alpine';
  applyLandscape();

  $('mainCount').textContent = today;
  $('workMetric').textContent = formatDuration(today * state.minutesPerUpdate);
  $('bestHourMetric').textContent = `${bestHour()} loads`;
  $('streakMetric').textContent = hourlyStreak();
  renderComboMeter();

  $('hourlyGoalLabel').textContent = state.hourlyGoal;
  $('raceProgressText').textContent = `${currentRaceLoads} / ${state.hourlyGoal}`;
  $('raceFill').style.width = `${hourlyProgress}%`;
  $('vehicle').style.right = `${3 + (hourlyProgress * 0.91)}%`;
  $('vehicle').innerHTML = rigIconMarkup(rig, 'race');
  $('vehicle').classList.remove('finished');
  document.documentElement.style.setProperty('--rig-accent', rig.accent || 'var(--accent)');
  document.documentElement.dataset.rigRarity = (rig.rarity || 'COMMON').toLowerCase();
  renderGhostTruck();

  const loadsLeftInRace = state.hourlyGoal - currentRaceLoads;
  const raceLabel = `${completedRacesThisHour} ${completedRacesThisHour === 1 ? 'race' : 'races'} completed this hour`;
  if (currentRaceLoads >= Math.ceil(state.hourlyGoal * .75)) {
    $('raceMessage').textContent = `${loadsLeftInRace} loads left — final lap · ${raceLabel}.`;
  } else if (currentRaceLoads >= Math.ceil(state.hourlyGoal * .4)) {
    $('raceMessage').textContent = `${loadsLeftInRace} loads left — gaining fast · ${raceLabel}.`;
  } else if (currentRaceLoads > 0) {
    $('raceMessage').textContent = `${loadsLeftInRace} loads left — engines warming · ${raceLabel}.`;
  } else if (completedRacesThisHour > 0) {
    $('raceMessage').textContent = `New race started · ${raceLabel}.`;
  } else {
    $('raceMessage').textContent = 'Green flag. Beat the Clock.';
  }

  $('xpValue').textContent = lifetime;
  $('xpBar').style.width = `${levelProgress}%`;
  $('levelLabel').textContent = `Level ${level} · ${Math.floor(levelDetails.earned)} / ${levelDetails.needed} XP to next level`;
  lrRenderPrestige();

  $('goalRing').style.setProperty('--goal-pct', dailyProgress);
  $('goalPercent').textContent = `${dailyProgress}%`;
  $('goalText').textContent = `${today} / ${state.dailyGoal}`;

  $('raceWinsValue').textContent = state.raceWins;
  $('activeRigLabel').textContent = `Driving: ${rig.name}${isSuperRig(rig.id) ? ' 🌈 SUPER' : ` · ${superRigProgress(rig.id)}/${SUPER_LOAD_GOAL} to Super`}`;

  $('dailyGoalInput').value = state.dailyGoal;
  $('hourlyGoalInput').value = state.hourlyGoal;
  $('minutesInput').value = state.minutesPerUpdate;
  $('soundStyleSelect').value = state.soundStyle || 'engine';
  $('fateFrequencySelect').value = String(state.fateFrequency || 10);

  applyTheme();
  renderLog();
  renderGarage();
}

function renderLog() {
  const list = $('logList');

  if (state.log.length === 0) {
    list.innerHTML = '<div class="empty-state">No load updates yet. The road is open.</div>';
    return;
  }

  let running = 0;
  const chronological = [...state.log].reverse();
  const runningByTime = new Map();

  for (const entry of chronological) {
    running = Math.max(0, running + entry.delta);
    runningByTime.set(entry.time, running);
  }

  list.innerHTML = state.log
    .slice(0, 120)
    .map(entry => {
      const value = runningByTime.get(entry.time) ?? 0;
      const positive = entry.delta > 0;

      return `
        <div class="log-entry">
          <div class="delta ${positive ? 'plus' : 'minus'}">${positive ? '+1' : '−1'}</div>
          <div>Net board: ${value}</div>
          <time class="log-time">${formatTime(entry.time)}</time>
        </div>
      `;
    })
    .join('');
}

function renderGarage() {
  const unlocked = RIGS.filter(rig => isRigOwned(rig.id)); const active = selectedRig();
  if ($('garageUnlocked')) $('garageUnlocked').textContent = `${unlocked.length} / ${RIGS.length} trucks`;
  if ($('garageCrateCount')) $('garageCrateCount').textContent = state.crateTokens || 0;
  if ($('garageCrateBtn')) $('garageCrateBtn').disabled = (state.crateTokens || 0) < 1;
  if ($('garageOpenAllBtn')) $('garageOpenAllBtn').disabled = (state.crateTokens || 0) < 1;
  $('garageGrid').innerHTML = RIGS.map(rig => { const isUnlocked = isRigOwned(rig.id); const isSelected = active.id === rig.id; const rarityClass = rig.rarity.toLowerCase().replace(/\s+/g, '-'); return `<button class="rig-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}" type="button" data-rig-id="${rig.id}" ${isUnlocked ? '' : 'disabled'}><span class="rig-card-top"><span class="rig-icon">${rigIconMarkup(rig, 'garage')}</span><span class="rig-rarity rarity-${rarityClass}">${isSuperRig(rig.id) ? '🌈 SUPER' : rig.rarity}</span></span><span class="rig-name">${rig.name}</span><span class="rig-type">${rig.type}</span><span class="rig-reward">${isUnlocked ? `✦ ${rig.reward}` : `🔒 ${rig.rule}`}</span><span class="rig-super-progress ${isSuperRig(rig.id) ? 'complete' : ''}"><span><i style="width:${Math.min(100,(superRigProgress(rig.id)/SUPER_LOAD_GOAL)*100)}%"></i></span><b>${isSuperRig(rig.id) ? 'SUPER UNLOCKED' : `${superRigProgress(rig.id)} / ${SUPER_LOAD_GOAL} loads to Super`}</b></span><span class="rig-rule">${isSelected ? 'Equipped' : isUnlocked ? 'Tap to equip' : 'Locked — earn it through the listed achievement'}</span></button>`; }).join('');
  document.querySelectorAll('[data-rig-id]').forEach(button => button.addEventListener('click', () => { const rig = RIGS.find(item => item.id === button.dataset.rigId); if (!rig || !isRigOwned(rig.id)) return; state.selectedRig = rig.id; saveState(); renderAll(); renderGarage(); showToast(`${rig.name} equipped`); }));

  const landscapeGrid = $('landscapeGrid');
  if (landscapeGrid) {
    landscapeGrid.innerHTML = LANDSCAPES.map(landscape => {
      const unlockedLandscape = isLandscapeUnlocked(landscape);
      const selected = state.selectedLandscape === landscape.id;
      const progress = landscape.goal === 0 ? 100 : Math.min(100, (state.raceWins / landscape.goal) * 100);
      const progressLabel = landscape.goal === 0 ? 'Available from the start' : `${Math.min(state.raceWins, landscape.goal)} / ${landscape.goal} hourly quests`;
      return `<button class="landscape-card landscape-${landscape.id} ${unlockedLandscape ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}" type="button" data-landscape-id="${landscape.id}" ${unlockedLandscape ? '' : 'disabled'}>
        <span class="landscape-preview" aria-hidden="true"><span class="preview-atmosphere"></span><span class="preview-horizon"></span><span class="preview-detail"></span><span class="preview-road"></span></span>
        <span class="landscape-copy"><span class="landscape-title-row"><strong>${landscape.icon} ${landscape.name}</strong><span class="landscape-rarity">${landscape.rarity}</span></span><span class="landscape-description">${landscape.description}</span><span class="landscape-progress"><span style="width:${progress}%"></span></span><span class="landscape-status">${selected ? '✓ Active landscape' : unlockedLandscape ? 'Tap to equip' : `🔒 ${progressLabel}`}</span></span>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-landscape-id]').forEach(button => button.addEventListener('click', () => {
      const landscape = LANDSCAPES.find(item => item.id === button.dataset.landscapeId);
      if (!landscape || !isLandscapeUnlocked(landscape)) return;
      state.selectedLandscape = landscape.id;
      saveState();
      applyLandscape();
      renderGarage();
      showToast(`${landscape.name} equipped`);
    }));
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', state.theme === 'dark' ? '#111326' : '#efe9ff');

  const themeButton = $('themeBtn');
  if (themeButton) themeButton.textContent = state.theme === 'dark' ? '☀' : '☾';

  updateSwitch('soundToggle', state.sound);
  updateSwitch('reminderAlarmToggle', state.reminderAlarmEnabled !== false);
  updateSwitch('particlesToggle', state.particles);
  updateSwitch('afternoonModeToggle', state.afternoonModeEnabled !== false);
  updateSwitch('fateToggle', state.fateEnabled);
}

function updateSwitch(id, enabled) {
  const element = $(id);
  if (!element) return;
  element.classList.toggle('on', Boolean(enabled));
  element.setAttribute('aria-checked', String(Boolean(enabled)));
}

function animateCount(delta) {
  const count = $('mainCount');

  count.classList.remove('bump', 'drop');
  void count.offsetWidth;
  count.classList.add(delta > 0 ? 'bump' : 'drop');

  if (delta > 0) {
    const plus = $('plusBtn');
    plus.classList.remove('flash');
    void plus.offsetWidth;
    plus.classList.add('flash');
  }
}

async function ensureGameAudio() {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  } catch (error) {
    console.warn('Load Rush audio unavailable:', error);
    return null;
  }
}

function createOscillator(frequency, type, start, duration, volume = .06) {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);

  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);

  return oscillator;
}

function playTone(kind = 'plus', special = false, forcePreview = false) {
  if (!state.sound && !forcePreview) {
    return;
  }

  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  const now = audioContext.currentTime;
  const style = state.soundStyle || 'engine';

  if (special) {
    // Race wins, loot rewards, rare Freight Fate events, etc.
    const notes = style === 'orbit' ? [420, 620, 820] : [660, 810, 960];
    [0, .07, .15].forEach((offset, index) => {
      createOscillator(notes[index], 'sine', now + offset, style === 'orbit' ? .10 : .17, style === 'orbit' ? .06 : .085);
    });
    return;
  }

  if (style === 'orbit') {
    // ORBIT RUN sound pack: short, soft sine beeps that scale cleanly with the action.
    // Kept intentionally tiny so rapid load entry stays satisfying instead of noisy.
    const clickCombo = kind === 'plus' ? Math.max(1, comboStats().current || 1) : 1;
    const ladder = [245, 275, 310, 345, 390, 440, 495, 555];
    const frequency = kind === 'plus' ? ladder[Math.min(clickCombo - 1, ladder.length - 1)] : 165;
    createOscillator(frequency, 'sine', now, .055, .038);

    if (kind === 'plus') {
      createOscillator(frequency * 1.35, 'sine', now + .028, .045, .018);
    }
    return;
  }

  if (style === 'engine') {
    const oscillator = createOscillator(kind === 'plus' ? 135 : 105, 'sawtooth', now, .18, .045);
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === 'plus' ? 280 : 72,
      now + .16
    );
    return;
  }

  if (style === 'arcade') {
    const first = kind === 'plus' ? 520 : 260;
    const second = kind === 'plus' ? 780 : 180;
    createOscillator(first, 'square', now, .08, .04);
    createOscillator(second, 'square', now + .07, .09, .035);
    return;
  }

  if (style === 'chime') {
    const base = kind === 'plus' ? 640 : 360;
    createOscillator(base, 'sine', now, .20, .06);
    createOscillator(base * 1.5, 'sine', now + .035, .22, .035);
    return;
  }

  createOscillator(kind === 'plus' ? 720 : 330, 'triangle', now, .07, .05);
}

function particleBurst(source, amount = 14, scale = 1) {
  if (!state.particles) {
    return;
  }

  const rect = source.getBoundingClientRect();

  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement('i');

    particle.className = 'particle';
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.width = `${(5 + Math.random() * 6) * scale}px`;
    particle.style.height = `${(6 + Math.random() * 10) * scale}px`;
    particle.style.setProperty('--x', `${(Math.random() - .5) * 230 * scale}px`);
    particle.style.setProperty('--y', `${(-35 - Math.random() * 160) * scale}px`);
    particle.style.setProperty('--r', `${Math.random() * 900 - 450}deg`);

    if (index % 3 === 1) {
      particle.style.background = 'var(--accent-2)';
    }

    if (index % 3 === 2) {
      particle.style.background = '#ffc450';
    }

    $('fxLayer').appendChild(particle);
    setTimeout(() => particle.remove(), 1350);
  }
}

function flashMegaMessage(text) {
  const message = $('megaMessage');

  message.textContent = text;
  message.classList.remove('show');
  void message.offsetWidth;
  message.classList.add('show');
}

function celebrateRace() {
  const trophy = $('trophy');

  if (trophy) {
    trophy.classList.remove('show');
    void trophy.offsetWidth;
    trophy.classList.add('show');
  }

  flashMegaMessage('CHECKERED FLAG!');
  particleBurst($('vehicle'), 110, 2.6);

  [0, 90, 180, 280].forEach(delay => {
    setTimeout(() => playTone('plus', true), delay);
  });
}

function maybeAwardRace() {
  const hourKey = currentHourKey();
  const completedRaces = Math.floor(hourNetLoads() / Math.max(1, state.hourlyGoal));

  if (!state.hourlyRaceAwards || typeof state.hourlyRaceAwards !== 'object') {
    state.hourlyRaceAwards = {};
  }

  const alreadyAwarded = Math.max(0, Number(state.hourlyRaceAwards[hourKey]) || 0);
  const newWins = Math.max(0, completedRaces - alreadyAwarded);

  if (newWins < 1) return;

  state.hourlyRaceAwards[hourKey] = completedRaces;
  state.raceWins += newWins;
  const royalBonus = lrPrestigeRank() >= 5 ? newWins : 0;
  state.crateTokens = (state.crateTokens || 0) + newWins + royalBonus;

  // Keep only recent hour records so local storage never grows forever.
  const recentKeys = Object.keys(state.hourlyRaceAwards).sort().slice(-72);
  state.hourlyRaceAwards = Object.fromEntries(recentKeys.map(key => [key, state.hourlyRaceAwards[key]]));
  saveState();
  renderAll();

  celebrateRace();
  showToast(`${newWins} race${newWins === 1 ? '' : 's'} complete · +${newWins + royalBonus} loot box${newWins + royalBonus === 1 ? '' : 'es'}${royalBonus ? ' (Freight Royalty bonus)' : ''} · ${state.raceWins} total wins`);
}




function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function defaultReminderDate() {
  return todayKey();
}

function defaultReminderTime() {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function reminderTimestamp(reminder) {
  return new Date(`${reminder.date}T${reminder.time}:00`).getTime();
}

function reminderDateLabel(reminder) {
  const date = new Date(`${reminder.date}T${reminder.time}:00`);
  const today = todayKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  let prefix = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  if (reminder.date === today) prefix = 'Today';
  if (reminder.date === tomorrowKey) prefix = 'Tomorrow';

  return `${prefix} at ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  })}`;
}

function pendingReminders() {
  return (state.reminders || [])
    .filter(reminder => !reminder.dismissed)
    .sort((a, b) => reminderTimestamp(a) - reminderTimestamp(b));
}


function showReminderTab(tabName) {
  const showingList = tabName === 'list';

  $('reminderListPanel').hidden = !showingList;
  $('reminderFormPanel').hidden = showingList;

  $('viewRemindersTab').classList.toggle('active', showingList);
  $('newReminderTab').classList.toggle('active', !showingList);

  $('viewRemindersTab').setAttribute('aria-selected', String(showingList));
  $('newReminderTab').setAttribute('aria-selected', String(!showingList));

  if (!showingList) {
    setTimeout(() => $('reminderTextInput').focus(), 80);
  }
}

function renderReminders() {
  const reminders = pendingReminders().filter(reminder =>
    reminder &&
    typeof reminder.text === 'string' &&
    typeof reminder.date === 'string' &&
    typeof reminder.time === 'string'
  );
  const now = Date.now();

  $('reminderCountLabel').textContent = `${reminders.length} reminder${reminders.length === 1 ? '' : 's'}`;
  $('reminderBadge').textContent = String(reminders.length);
  $('reminderBadge').hidden = reminders.length === 0;

  if (!reminders.length) {
    $('reminderList').innerHTML = `
      <div class="reminder-empty">
        Nothing scheduled. Add something before your brain decides it was never important.
      </div>
    `;
    return;
  }

  $('reminderList').innerHTML = reminders.map(reminder => {
    const overdue = reminderTimestamp(reminder) <= now;

    return `
      <div class="reminder-item ${overdue ? 'overdue' : ''}">
        <div class="reminder-clock">${overdue ? '🚨' : '⏰'}</div>
        <div class="reminder-item-copy">
          <strong>${escapeHtml(reminder.text)}</strong>
          <span>${reminderDateLabel(reminder)}${overdue ? ' · DUE NOW' : ''}</span>
        </div>
        <button class="reminder-delete-button" data-reminder-delete="${escapeHtml(reminder.id || '')}" type="button">Delete</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('[data-reminder-delete]').forEach(button => {
    button.addEventListener('click', () => {
      state.reminders = state.reminders.filter(reminder => reminder.id !== button.dataset.reminderDelete);
      saveState();
      renderReminders();
      showToast('Reminder deleted');
    });
  });
}

function getReminderDraft() {
  const text = $('reminderTextInput').value.trim();
  const date = $('reminderDateInput').value;
  const time = $('reminderTimeInput').value;

  if (!text) {
    showToast('Enter what you need to remember');
    $('reminderTextInput').focus();
    return null;
  }

  if (!date || !time) {
    showToast('Choose a date and time');
    return null;
  }

  const timestamp = new Date(`${date}T${time}:00`).getTime();

  if (!Number.isFinite(timestamp)) {
    showToast('That date or time is invalid');
    return null;
  }

  return { text, date, time };
}

function saveReminderDraft(draft) {
  const button = $('addReminderBtn');
  button.disabled = true;
  button.textContent = 'Adding...';

  try {
    if (!Array.isArray(state.reminders)) {
      state.reminders = [];
    }

    const id = (
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === 'function'
    )
      ? globalThis.crypto.randomUUID()
      : `reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    state.reminders.push({
      id,
      text: draft.text,
      date: draft.date,
      time: draft.time,
      createdAt: new Date().toISOString(),
      fired: false,
      dismissed: false
    });

    saveState();
    renderReminders();
    showReminderTab('list');

    $('reminderTextInput').value = '';
    $('reminderDateInput').value = defaultReminderDate();
    $('reminderTimeInput').value = defaultReminderTime();

    showToast('Reminder armed');
  } catch (error) {
    console.error('Could not add reminder:', error);
    showToast('Could not save that reminder');
  } finally {
    button.disabled = false;
    button.textContent = 'Add reminder';
  }
}

function addReminder() {
  const button = $('addReminderBtn');

  if (button.disabled) {
    return;
  }

  const draft = getReminderDraft();
  if (!draft) return;

  if (state.reminderAlarmEnabled !== false && !state.reminderAlarmWarningSeen) {
    pendingReminderDraft = draft;
    openDialog($('reminderAlarmWarningDialog'));
    return;
  }

  saveReminderDraft(draft);
}

async function requestReminderNotifications() {
  if ('Notification' in window && Notification.permission === 'granted') {
    showToast('System notifications are already enabled');
    return;
  }

  if (!('Notification' in window)) {
    showToast('This browser does not support system notifications');
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      showToast('System notifications enabled');
      $('enableNotificationsBtn').textContent = 'Notifications enabled';
      $('enableNotificationsBtn').disabled = false;
    } else {
      showToast('Notifications were not enabled');
    }
  } catch {
    showToast('Could not enable notifications');
  }
}

function sendSystemReminder(reminder) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification('🚨 LOAD RUSH REMINDER', {
      body: reminder.text,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: `load-rush-reminder-${reminder.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // The in-app alarm still runs even if the browser blocks this.
  }
}

function startReminderSiren() {
  stopReminderSiren();

  try {
    alarmAudioContext = new (window.AudioContext || window.webkitAudioContext)();

    const gain = alarmAudioContext.createGain();
    gain.gain.value = .16;
    gain.connect(alarmAudioContext.destination);

    const createTone = (frequency, type) => {
      const oscillator = alarmAudioContext.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      alarmOscillators.push(oscillator);
    };

    createTone(720, 'square');
    createTone(960, 'sawtooth');

    let high = false;
    alarmPulseTimer = setInterval(() => {
      if (!alarmAudioContext) return;

      high = !high;
      const time = alarmAudioContext.currentTime;
      alarmOscillators[0]?.frequency.setValueAtTime(high ? 880 : 620, time);
      alarmOscillators[1]?.frequency.setValueAtTime(high ? 1180 : 810, time);
    }, 360);
  } catch {
    // Visual alarm and vibration remain available.
  }
}

function stopReminderSiren() {
  clearInterval(alarmPulseTimer);
  alarmPulseTimer = null;

  alarmOscillators.forEach(oscillator => {
    try { oscillator.stop(); } catch {}
  });

  alarmOscillators = [];

  if (alarmAudioContext) {
    try { alarmAudioContext.close(); } catch {}
    alarmAudioContext = null;
  }
}

function triggerReminderAlarm(reminder) {
  if (activeReminderId) {
    return;
  }

  activeReminderId = reminder.id;
  reminder.fired = true;
  reminder.dismissed = false;
  saveState();
  renderReminders();

  $('alarmReminderText').textContent = reminder.text;
  $('alarmReminderTime').textContent = new Date(`${reminder.date}T${reminder.time}:00`)
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  $('reminderAlarm').hidden = false;
  document.body.classList.add('alarm-active');

  if (state.reminderAlarmEnabled !== false) {
    startReminderSiren();
  }
  sendSystemReminder(reminder);

  if (state.reminderAlarmEnabled !== false && 'vibrate' in navigator) {
    navigator.vibrate([500, 180, 500, 180, 900, 250, 900]);
  }

  document.title = `🚨 ${reminder.text}`;

  try {
    window.focus();
  } catch {}
}

function dismissReminderAlarm() {
  const reminder = state.reminders.find(item => item.id === activeReminderId);

  if (reminder) {
    reminder.dismissed = true;
  }

  saveState();
  activeReminderId = null;
  $('reminderAlarm').hidden = true;
  document.body.classList.remove('alarm-active');
  document.title = state.brandTitle || 'Wayfinder Logistics';
  stopReminderSiren();

  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }

  renderReminders();
  showToast('Reminder dismissed');
}

function checkReminders() {
  if (activeReminderId) {
    return;
  }

  const now = Date.now();
  const due = pendingReminders().find(reminder => {
    const timestamp = reminderTimestamp(reminder);

    // Re-fire an overdue reminder after a reload if it was never dismissed.
    return timestamp <= now && (!reminder.fired || !reminder.dismissed);
  });

  if (due) {
    triggerReminderAlarm(due);
  }
}

function weightedFateRoll() {
  const prestige = lrPrestigeRank();
  const available = FATE_EVENTS.filter(event => prestige >= Number(event.prestigeMin || 0));
  const total = available.reduce((sum, event) => sum + event.weight, 0);
  let roll = Math.random() * total;

  for (const event of available) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }

  return available[0] || FATE_EVENTS[0];
}

function shouldPromptFate() {
  if (!state.fateEnabled) {
    return false;
  }

  const today = todayKey();
  const frequency = Math.max(1, Number(state.fateFrequency) || 10);
  const loads = todayNetLoads();

  // Reset the remembered milestone when a new day begins.
  if (state.lastFateMilestoneDate !== today) {
    state.lastFateMilestoneDate = today;
    state.lastFateMilestone = 0;
    saveState();
  }

  if (loads <= 0 || loads % frequency !== 0) {
    return false;
  }

  return loads > Number(state.lastFateMilestone || 0);
}

function promptFreightFate() {
  const loads = todayNetLoads();

  pendingFateMilestone = loads;
  state.lastFateMilestone = loads;
  state.lastFateMilestoneDate = todayKey();
  saveState();

  $('fatePromptTitle').textContent = `${loads} loads tracked!`;
  openDialog($('fatePromptDialog'));
  particleBurst($('mainCount'), 38, 1.3);
  flashMegaMessage(`${loads} LOADS!`);
}

function clearFateScene() {
  clearTimeout(activeFateTimeout);
  activeFateTimeout = null;

  const world = document.querySelector('.road-world');
  const vehicle = $('vehicle');

  world.classList.remove('fate-rain', 'fate-rainbow');
  vehicle.classList.remove('fate-nitro', 'fate-spin', 'fate-abduct', 'fate-bounce');
  $('fateScene').replaceChildren();
}

function placeFateObjects(event) {
  const layer = $('fateScene');

  if (!event.objects?.length) {
    return;
  }

  event.objects.forEach((object, index) => {
    const element = document.createElement('span');
    element.className = 'fate-object';
    element.textContent = object;
    element.style.left = `${14 + (index * 68 / Math.max(1, event.objects.length - 1))}%`;
    element.style.top = `${20 + (index % 2) * 45}%`;
    layer.appendChild(element);
  });
}

function runFateScene(event) {
  clearFateScene();

  const world = document.querySelector('.road-world');
  const vehicle = $('vehicle');
  const layer = $('fateScene');

  if (event.worldClass) {
    world.classList.add(event.worldClass);
  }

  if (event.sceneClass) {
    vehicle.classList.add(event.sceneClass);
  }

  placeFateObjects(event);

  const banner = document.createElement('div');
  banner.className = 'fate-banner';
  banner.textContent = `${event.icon} ${event.name}`;
  layer.appendChild(banner);

  if (event.id === 'ducks' || event.id === 'cones' || event.id === 'speedtrap') {
    vehicle.classList.add('fate-bounce');
  }

  if (event.rarity === 'EPIC' || event.rarity === 'LEGENDARY') {
    particleBurst($('vehicle'), event.rarity === 'LEGENDARY' ? 100 : 65, 2);
  }

  activeFateTimeout = setTimeout(clearFateScene, 5000);
}

function rollFreightFate() {
  closeDialog($('fatePromptDialog'));

  const layer = $('fateScene');
  clearFateScene();

  const rolling = document.createElement('div');
  rolling.className = 'fate-track-roll';
  rolling.textContent = '🎲';
  layer.appendChild(rolling);
  flashMegaMessage('FREIGHT FATE...');

  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  let faceIndex = 0;
  const diceInterval = setInterval(() => {
    rolling.textContent = faces[faceIndex % faces.length];
    faceIndex += 1;
  }, 110);

  setTimeout(() => {
    clearInterval(diceInterval);
    rolling.remove();
    const event = weightedFateRoll();

    if (!state.discoveredEvents.includes(event.id)) {
      state.discoveredEvents.push(event.id);
      saveState();
      showToast(`New Fate event discovered: ${event.name}`);
    } else {
      showToast(`${event.rarity} Freight Fate · ${event.name}`);
    }

    runFateScene(event);
    flashMegaMessage(`${event.icon} ${event.name.toUpperCase()}!`);
    playTone('plus', event.rarity === 'EPIC' || event.rarity === 'LEGENDARY');
    pendingFateMilestone = null;
  }, 1500);
}

function skipFreightFate() {
  closeDialog($('fatePromptDialog'));
  pendingFateMilestone = null;
  showToast('Freight Fate skipped');
}

function showTruckSmoke() {
  const road = document.querySelector('.road');
  const vehicle = $('vehicle');
  if (!road || !vehicle) return;

  const puff = document.createElement('span');
  puff.className = 'truck-trail-puff';
  const vehicleRect = vehicle.getBoundingClientRect();
  const roadRect = road.getBoundingClientRect();
  puff.style.left = `${Math.max(8, vehicleRect.left - roadRect.left + 8)}px`;
  puff.style.top = `${Math.max(8, vehicleRect.top - roadRect.top + vehicleRect.height * .62)}px`;
  road.appendChild(puff);
  setTimeout(() => puff.remove(), 650);
}


// V7.6 — Bryler's equipped-only Surf Side power. Purely visual/audio.
function triggerBrylerPower() {
  if (selectedRig().id !== 'byler') return;
  const road = document.querySelector('.road');
  const vehicle = $('vehicle');
  if (!road || !vehicle) return;

  vehicle.classList.remove('bryler-surf-power');
  void vehicle.offsetWidth;
  vehicle.classList.add('bryler-surf-power');
  setTimeout(() => vehicle.classList.remove('bryler-surf-power'), 760);

  const wave = document.createElement('div');
  wave.className = 'bryler-wave';
  road.appendChild(wave);
  setTimeout(() => wave.remove(), 850);

  const splashChars = ['💧','🫧','✦','🌊'];
  const vr = vehicle.getBoundingClientRect();
  const rr = road.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const splash = document.createElement('span');
    splash.className = 'bryler-splash';
    splash.textContent = splashChars[Math.floor(Math.random()*splashChars.length)];
    splash.style.left = `${vr.left - rr.left + vr.width*.45}px`;
    splash.style.top = `${vr.top - rr.top + vr.height*.6}px`;
    splash.style.setProperty('--bx', `${-45 + Math.random()*90}px`);
    splash.style.setProperty('--by', `${-35 - Math.random()*55}px`);
    splash.style.animationDelay = `${Math.random()*70}ms`;
    road.appendChild(splash);
    setTimeout(() => splash.remove(), 900);
  }

  const tag = document.createElement('span');
  tag.className = 'bryler-power-tag';
  tag.textContent = Math.random() < .5 ? 'SURF SIDE ⚡' : 'BRYLER BOOST 🌊';
  tag.style.left = `${Math.max(42, vr.left - rr.left + vr.width/2)}px`;
  tag.style.top = `${Math.max(8, vr.top - rr.top - 18)}px`;
  road.appendChild(tag);
  setTimeout(() => tag.remove(), 800);

  if (state.sound) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      [[330,0],[440,.045],[660,.09]].forEach(([freq,offset],idx) => {
        const o=audioContext.createOscillator(), g=audioContext.createGain();
        o.type = idx === 2 ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(freq, now+offset);
        g.gain.setValueAtTime(.0001, now+offset);
        g.gain.exponentialRampToValueAtTime(idx===2?.027:.018, now+offset+.012);
        g.gain.exponentialRampToValueAtTime(.0001, now+offset+.16);
        o.connect(g).connect(audioContext.destination);
        o.start(now+offset); o.stop(now+offset+.18);
      });
    } catch {}
  }
}


// V7.19 — loot-character equipped powers. Cosmetic only.
function lrCharacterTag(text, className='lr-character-tag') {
  const road=document.querySelector('.road'), vehicle=$('vehicle');
  if(!road||!vehicle)return;
  const vr=vehicle.getBoundingClientRect(), rr=road.getBoundingClientRect();
  const tag=document.createElement('span');
  tag.className=className;
  tag.textContent=text;
  tag.style.left=`${vr.left-rr.left+vr.width/2}px`;
  tag.style.top=`${Math.max(2,vr.top-rr.top-18)}px`;
  road.appendChild(tag);
  setTimeout(()=>tag.remove(),900);
}

function triggerSlopesPower(){
  if(selectedRig().id!=='slopes')return;
  const road=document.querySelector('.road'),v=$('vehicle');if(!road||!v)return;
  v.classList.remove('slopes-trick');void v.offsetWidth;v.classList.add('slopes-trick');
  setTimeout(()=>v.classList.remove('slopes-trick'),850);

  const ramp=document.createElement('div');
  ramp.className='slopes-ramp';
  ramp.textContent='🏔️';
  road.appendChild(ramp);
  setTimeout(()=>ramp.remove(),900);

  ['❄️','❄️','✨','❄️','💨'].forEach((c,i)=>{
    const p=document.createElement('span');p.className='slopes-snow';p.textContent=c;
    p.style.setProperty('--sx',`${-55+Math.random()*110}px`);
    p.style.setProperty('--sy',`${-30-Math.random()*75}px`);
    p.style.animationDelay=`${i*35}ms`;road.appendChild(p);setTimeout(()=>p.remove(),900);
  });
  lrCharacterTag(Math.random()<.5?'YARD SALE? NEVER. ⛷️':'SEND THE CLIFF ❄️');
}

function triggerGrrrPower(){
  if(selectedRig().id!=='grrr')return;
  const road=document.querySelector('.road'),v=$('vehicle');if(!road||!v)return;
  v.classList.remove('grrr-lunge');void v.offsetWidth;v.classList.add('grrr-lunge');
  setTimeout(()=>v.classList.remove('grrr-lunge'),650);

  const slash=document.createElement('div');slash.className='grrr-slash';slash.textContent='💥';
  road.appendChild(slash);setTimeout(()=>slash.remove(),650);
  lrCharacterTag(Math.random()<.5?'GRRRRRR 🐅':'PREDATOR MODE');
}

function triggerOtterPower(){
  if(selectedRig().id!=='otter')return;
  const road=document.querySelector('.road'),v=$('vehicle');if(!road||!v)return;
  v.classList.remove('otter-swim');void v.offsetWidth;v.classList.add('otter-swim');
  setTimeout(()=>v.classList.remove('otter-swim'),1000);

  const water=document.createElement('div');water.className='otter-water';road.appendChild(water);
  setTimeout(()=>water.remove(),1050);

  ['💧','🫧','🌊','🫧','💧','🫧'].forEach((c,i)=>{
    const p=document.createElement('span');p.className='otter-bubble';p.textContent=c;
    p.style.left=`${20+Math.random()*65}%`;p.style.animationDelay=`${i*55}ms`;
    road.appendChild(p);setTimeout(()=>p.remove(),1100);
  });
  lrCharacterTag(Math.random()<.5?'OTTERLY LOCKED IN 🦦':'SPLASH ZONE');
}

function triggerLootCharacterPower(){
  triggerSlopesPower();
  triggerGrrrPower();
  triggerOtterPower();
}

function addLoad(delta) {
  const oldLevel = lifetimeLevel();
  const entry = { delta, time: Date.now(), xp: delta };
  state.log.unshift(entry);
  const plusMessages = ['Load secured.','Driver updated.','Another one on the board.','Dispatch magic.','Momentum acquired.']; const minusMessages = ['Load removed from every score.','All metrics corrected.','Board, XP, race, and time corrected.']; const choices = delta > 0 ? plusMessages : minusMessages; $('statusLine').textContent = choices[Math.floor(Math.random() * choices.length)];
  if (delta > 0) {
    const combo = comboStats();
    const prestigeMultiplier = lrPrestigeXpMultiplier();
    entry.xp = Math.max(1, (combo.multiplier || 1) * prestigeMultiplier);
  }
  if (delta > 0) {
    const activeRigId = selectedRig().id;
    state.rigLoadCounts ||= {};
    const before = rigLoadCount(activeRigId);
    state.rigLoadCounts[activeRigId] = before + 1;

    if (before < SUPER_LOAD_GOAL && state.rigLoadCounts[activeRigId] >= SUPER_LOAD_GOAL) {
      const mastered = selectedRig();
      setTimeout(() => {
        flashMegaMessage(`🌈 SUPER ${mastered.name.toUpperCase()}!`);
        showToast(`${mastered.name} mastered · 1,000 loads`);
        particleBurst($('vehicle'), 130, 2.5);
        playTone('plus', true);
      }, 80);
    }
  }
  const newLevel = lifetimeLevel();
  if (delta > 0 && newLevel > oldLevel) {
    showToast(`Level ${newLevel}! Keep hauling toward the next truck.`);
  }
  saveState(); renderAll(); animateCount(delta); playTone(delta > 0 ? 'plus' : 'minus'); if (delta > 0) { showTruckSmoke(); triggerBrylerPower(); triggerLootCharacterPower(); lrMaybePrestigeRoadReward(); }
  if (delta > 0) { const combo = comboStats(); particleBurst($('plusBtn'), combo.current >= 10 ? 70 : combo.current >= 5 ? 45 : undefined, combo.current >= 5 ? 1.8 : undefined); if (combo.current === 3) showToast('Combo active · 2× XP'); if (combo.current === 5) flashMegaMessage('HOT STREAK · 3× XP!'); if (combo.current === 10) flashMegaMessage('FREIGHT FRENZY · 5× XP!'); maybeAwardRace(); announceNewUnlocks(); if (todayNetLoads() === state.dailyGoal) { flashMegaMessage('SHIFT GOAL CRUSHED!'); particleBurst($('mainCount'), 100, 2.4); showToast('Daily load goal complete'); } if (shouldPromptFate()) setTimeout(promptFreightFate, 350); } else showToast('Subtracted from every live metric');
}

function undoLast() {
  if (state.log.length === 0) {
    showToast('Nothing to undo');
    return;
  }

  state.log.shift();
  saveState();
  renderAll();
  showToast('Last update removed');
}

function exportBackup() {
  const blob = new Blob(
    [JSON.stringify(state, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `load-rush-backup-${new Date().toISOString().slice(0,10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
  showToast('Backup exported');
}

function showToast(text) {
  const toast = $('toast');

  toast.textContent = text;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function tickClock() {
  const countdownElement = $('countdown');

  if (!countdownElement) {
    return;
  }

  const key = currentHourKey();
  const day = todayKey();

  if (day !== previousDayKey) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    previousDayKey = day;
    state.lastRecapDate = day;
    saveState();
    renderAll();
    showDaySummary(yesterday);
  }

  if (key !== previousHourKey) {
    previousHourKey = key;
    renderAll();
    showToast('New hour. Back to the starting line.');
  }

  const remaining = secondsUntilNextHour();
  countdownElement.textContent = formatCountdown(remaining);
  countdownElement.dataset.secondsRemaining = String(remaining);
  renderComboMeter();
  renderGhostTruck();
}

function startHourlyClock() {
  if (hourlyClockInterval) {
    clearInterval(hourlyClockInterval);
  }

  tickClock();
  hourlyClockInterval = setInterval(tickClock, 1000);

  window.addEventListener('focus', tickClock);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      tickClock();
    }
  });
}


function dateAtStart(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function netForDate(date) {
  const key = todayKey(date);
  return Math.max(0, netTotal(state.log.filter(entry => todayKey(new Date(entry.time)) === key)));
}

function netForRange(start, end) {
  return Math.max(0, netTotal(state.log.filter(entry => {
    const time = new Date(entry.time);
    return time >= start && time < end;
  })));
}

function positiveUpdates() {
  return state.log
    .filter(entry => Number(entry.delta) > 0 && Number.isFinite(Number(entry.time)))
    .map(entry => ({ ...entry, date: new Date(entry.time) }))
    .sort((a, b) => a.time - b.time);
}

function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function isInsideWorkShift(date) {
  if (!isWeekday(date)) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= 7 * 60 && minutes < 15 * 60 + 30;
}

function formatMinutesCompact(value) {
  if (!Number.isFinite(value)) return '—';
  if (value < 1) return `${Math.max(1, Math.round(value * 60))} sec`;
  if (value < 60) return `${Math.round(value)} min`;
  const hours = Math.floor(value / 60);
  const mins = Math.round(value % 60);
  return `${hours}h ${mins}m`;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function shiftSlots() {
  return [
    { label: '7–8', start: 420, end: 480 },
    { label: '8–9', start: 480, end: 540 },
    { label: '9–10', start: 540, end: 600 },
    { label: '10–11', start: 600, end: 660 },
    { label: '11–12', start: 660, end: 720 },
    { label: '12–1', start: 720, end: 780 },
    { label: '1–2', start: 780, end: 840 },
    { label: '2–3', start: 840, end: 900 },
    { label: '3–3:30', start: 900, end: 930 }
  ];
}

function workdayAnalytics() {
  const updates = positiveUpdates().filter(entry => isInsideWorkShift(entry.date));
  const days = new Set(updates.map(entry => todayKey(entry.date)));
  const dayCount = Math.max(1, days.size);
  const rows = shiftSlots().map(slot => {
    const count = updates.filter(entry => {
      const mins = entry.date.getHours() * 60 + entry.date.getMinutes();
      return mins >= slot.start && mins < slot.end;
    }).length;
    return { label: slot.label, value: count, average: count / dayCount };
  });
  return { rows, total: updates.length, dayCount };
}

function updateGapAnalytics() {
  const updates = positiveUpdates().filter(entry => isInsideWorkShift(entry.date));
  const gaps = [];
  for (let index = 1; index < updates.length; index += 1) {
    const current = updates[index];
    const previous = updates[index - 1];
    if (todayKey(current.date) !== todayKey(previous.date)) continue;
    const minutes = (current.time - previous.time) / 60000;
    if (minutes > 0 && minutes <= 180) gaps.push(minutes);
  }
  const buckets = [
    { label: '<1 min', min: 0, max: 1 },
    { label: '1–3', min: 1, max: 3 },
    { label: '3–5', min: 3, max: 5 },
    { label: '5–10', min: 5, max: 10 },
    { label: '10–20', min: 10, max: 20 },
    { label: '20+ min', min: 20, max: Infinity }
  ];
  const rows = buckets.map(bucket => ({
    label: bucket.label,
    value: gaps.filter(gap => gap >= bucket.min && gap < bucket.max).length
  }));
  return {
    rows,
    gaps,
    average: gaps.length ? gaps.reduce((sum, value) => sum + value, 0) / gaps.length : 0,
    median: median(gaps),
    fastest: gaps.length ? Math.min(...gaps) : 0,
    slowest: gaps.length ? Math.max(...gaps) : 0
  };
}

function trendAnalytics() {
  const now = new Date();
  const rows = [];
  for (let index = 13; index >= 0; index -= 1) {
    const date = dateAtStart(now);
    date.setDate(date.getDate() - index);
    rows.push({
      label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date),
      value: netForDate(date),
      weekday: isWeekday(date)
    });
  }
  return rows;
}

function weekdayAnalytics() {
  const updates = positiveUpdates().filter(entry => isInsideWorkShift(entry.date));
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return names.map((label, index) => {
    const day = index + 1;
    const matching = updates.filter(entry => entry.date.getDay() === day);
    const dates = new Set(matching.map(entry => todayKey(entry.date)));
    return { label, value: dates.size ? matching.length / dates.size : 0, raw: matching.length };
  });
}

function detectSessions(date = new Date()) {
  const key = todayKey(date);
  const entries = positiveUpdates().filter(entry => todayKey(entry.date) === key && isInsideWorkShift(entry.date));
  if (!entries.length) return [];
  const sessions = [];
  let active = { start: entries[0].date, end: entries[0].date, count: 1 };
  entries.slice(1).forEach(entry => {
    const gap = (entry.date - active.end) / 60000;
    if (gap <= 20) {
      active.end = entry.date;
      active.count += 1;
    } else {
      sessions.push(active);
      active = { start: entry.date, end: entry.date, count: 1 };
    }
  });
  sessions.push(active);
  return sessions.sort((a, b) => b.count - a.count);
}

function renderSessions() {
  const container = $('sessionList');
  const sessions = detectSessions();
  if (!sessions.length) {
    container.innerHTML = '<div class="analytics-empty">No work sessions recorded today yet.</div>';
    return;
  }
  const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  container.innerHTML = sessions.slice(0, 3).map((session, index) => `
    <div class="session-row">
      <span>${index === 0 ? '🔥' : '•'} ${formatter.format(session.start)}–${formatter.format(session.end)}</span>
      <strong>${session.count} loads</strong>
    </div>
  `).join('');
}

function renderBarChart(svg, rows, options = {}) {
  const width = 760;
  const height = 320;
  const left = 52;
  const right = 20;
  const top = 24;
  const bottom = 58;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(options.minimumMax || 5, ...rows.map(row => row.value));
  const gap = 12;
  const barWidth = Math.max(18, (plotWidth - gap * (rows.length - 1)) / rows.length);
  let markup = '';
  for (let step = 0; step <= 4; step += 1) {
    const y = top + plotHeight / 4 * step;
    const value = maxValue - maxValue / 4 * step;
    markup += `<line class="chart-grid-line" x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"></line>`;
    markup += `<text class="chart-axis-label" x="${left-10}" y="${y+4}" text-anchor="end">${options.decimals ? value.toFixed(1) : Math.round(value)}</text>`;
  }
  rows.forEach((row, index) => {
    const x = left + index * (barWidth + gap);
    const barHeight = maxValue ? row.value / maxValue * plotHeight : 0;
    const y = top + plotHeight - barHeight;
    markup += `<rect class="analytics-bar" x="${x}" y="${y}" width="${barWidth}" height="${Math.max(2, barHeight)}" rx="8"></rect>`;
    markup += `<text class="chart-value-label" x="${x + barWidth/2}" y="${Math.max(top + 12, y - 8)}" text-anchor="middle">${options.decimals ? row.value.toFixed(1) : Math.round(row.value)}</text>`;
    markup += `<text class="chart-axis-label" x="${x + barWidth/2}" y="${height-25}" text-anchor="middle">${row.label}</text>`;
  });
  svg.innerHTML = markup;
}

function renderLineChart(svg, rows) {
  const width = 760;
  const height = 320;
  const left = 52;
  const right = 20;
  const top = 24;
  const bottom = 58;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(5, ...rows.map(row => row.value));
  const pointGap = rows.length > 1 ? plotWidth / (rows.length - 1) : plotWidth;
  const points = rows.map((row, index) => ({
    ...row,
    x: left + index * pointGap,
    y: top + plotHeight - row.value / maxValue * plotHeight
  }));
  let markup = '';
  for (let step = 0; step <= 4; step += 1) {
    const y = top + plotHeight / 4 * step;
    const value = Math.round(maxValue - maxValue / 4 * step);
    markup += `<line class="chart-grid-line" x1="${left}" y1="${y}" x2="${width-right}" y2="${y}"></line>`;
    markup += `<text class="chart-axis-label" x="${left-10}" y="${y+4}" text-anchor="end">${value}</text>`;
  }
  const linePoints = points.map(point => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${left},${top+plotHeight} ${linePoints} ${width-right},${top+plotHeight}`;
  markup += `<polygon class="chart-area" points="${areaPoints}"></polygon>`;
  markup += `<polyline class="chart-line" points="${linePoints}"></polyline>`;
  points.forEach((point, index) => {
    markup += `<circle class="chart-dot" cx="${point.x}" cy="${point.y}" r="5"></circle>`;
    if (index % 2 === 0 || index === points.length - 1) {
      markup += `<text class="chart-axis-label" x="${point.x}" y="${height-25}" text-anchor="middle">${point.label}</text>`;
    }
  });
  svg.innerHTML = markup;
}

function setInsightMetric(index, label, value) {
  const ids = ['Total', 'Average', 'Best', 'Extra'];
  $(`chart${ids[index]}Label`).textContent = label;
  $(`chart${ids[index]}`).textContent = value;
}

function renderInsights(period = activeChartPeriod) {
  activeChartPeriod = period;
  document.querySelectorAll('.period-tab').forEach(button => {
    button.classList.toggle('active', button.dataset.period === period);
  });

  const svg = $('insightsChart');
  let narrative = '';

  if (period === 'shift') {
    const data = workdayAnalytics();
    const rows = data.rows.map(row => ({ label: row.label, value: row.average }));
    const strongest = rows.reduce((best, row) => row.value > best.value ? row : best, rows[0]);
    const nonZero = rows.filter(row => row.value > 0);
    const weakest = nonZero.length ? nonZero.reduce((low, row) => row.value < low.value ? row : low, nonZero[0]) : null;
    setInsightMetric(0, 'Shift loads', data.total);
    setInsightMetric(1, 'Avg per workday', data.dayCount ? (data.total / data.dayCount).toFixed(1) : '0');
    setInsightMetric(2, 'Strongest hour', strongest && strongest.value ? strongest.label : '—');
    setInsightMetric(3, 'Weakest active hour', weakest ? weakest.label : '—');
    renderBarChart(svg, rows, { decimals: true, minimumMax: 2 });
    $('chartCaption').textContent = `Average loads by work-hour across ${data.dayCount} recorded workday${data.dayCount === 1 ? '' : 's'} (7:00 AM–3:30 PM).`;
    narrative = strongest && strongest.value
      ? `Your strongest window is ${strongest.label}. ${weakest ? `Your lightest active window is ${weakest.label}.` : ''} Use this to protect your peak hours and spot where follow-ups tend to stall.`
      : 'Not enough shift history yet. Once you log a few workdays, this will identify your strongest and weakest windows.';
  } else if (period === 'pace') {
    const data = updateGapAnalytics();
    setInsightMetric(0, 'Measured gaps', data.gaps.length);
    setInsightMetric(1, 'Average gap', formatMinutesCompact(data.average));
    setInsightMetric(2, 'Typical gap', formatMinutesCompact(data.median));
    setInsightMetric(3, 'Longest gap', formatMinutesCompact(data.slowest));
    renderBarChart(svg, data.rows, { minimumMax: 3 });
    $('chartCaption').textContent = 'Time between positive load updates during the same workday; overnight gaps and gaps over 3 hours are excluded.';
    narrative = data.gaps.length
      ? `Your typical update arrives every ${formatMinutesCompact(data.median)}. ${data.average > data.median * 1.5 ? 'A few long pauses are pulling the average upward.' : 'Your pace is fairly consistent.'}`
      : 'Track several loads during a shift to unlock pace analysis.';
  } else if (period === 'trend') {
    const rows = trendAnalytics();
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    const workRows = rows.filter(row => row.weekday);
    const best = rows.reduce((winner, row) => row.value > winner.value ? row : winner, rows[0]);
    const firstHalf = rows.slice(0, 7).reduce((sum, row) => sum + row.value, 0);
    const secondHalf = rows.slice(7).reduce((sum, row) => sum + row.value, 0);
    const change = firstHalf ? Math.round((secondHalf - firstHalf) / firstHalf * 100) : 0;
    setInsightMetric(0, '14-day loads', total);
    setInsightMetric(1, 'Avg workday', workRows.length ? (workRows.reduce((sum,row)=>sum+row.value,0)/workRows.length).toFixed(1) : '0');
    setInsightMetric(2, 'Best day', best.value ? best.label : '—');
    setInsightMetric(3, 'Week-over-week', firstHalf ? `${change >= 0 ? '+' : ''}${change}%` : '—');
    renderLineChart(svg, rows);
    $('chartCaption').textContent = 'Net loads recorded each day across the last two weeks.';
    narrative = firstHalf
      ? `Your latest seven days are ${Math.abs(change)}% ${change >= 0 ? 'ahead of' : 'behind'} the prior seven. ${best.value ? `${best.label} was the strongest day with ${best.value} loads.` : ''}`
      : 'Two weeks of history will unlock a meaningful trend comparison.';
  } else {
    const rows = weekdayAnalytics();
    const strongest = rows.reduce((best, row) => row.value > best.value ? row : best, rows[0]);
    const weakest = rows.filter(row => row.value > 0).reduce((low, row) => !low || row.value < low.value ? row : low, null);
    setInsightMetric(0, 'Weekday loads', rows.reduce((sum,row)=>sum+row.raw,0));
    setInsightMetric(1, 'Best weekday avg', strongest.value.toFixed(1));
    setInsightMetric(2, 'Strongest day', strongest.value ? strongest.label : '—');
    setInsightMetric(3, 'Weakest day', weakest ? weakest.label : '—');
    renderBarChart(svg, rows, { decimals: true, minimumMax: 2 });
    $('chartCaption').textContent = 'Average loads per recorded Monday–Friday shift.';
    narrative = strongest.value
      ? `${strongest.label} is currently your strongest weekday. ${weakest ? `${weakest.label} is the softest.` : ''} This becomes more reliable as more weeks accumulate.`
      : 'Log at least one full workweek to compare weekdays.';
  }

  $('analyticsNarrative').textContent = narrative;
  renderSessions();
}

function hourlyTotalsForDate(date) {
  const key = todayKey(date);
  const totals = Array.from({ length: 24 }, () => 0);

  state.log.forEach(entry => {
    const entryDate = new Date(entry.time);
    if (todayKey(entryDate) !== key) return;
    totals[entryDate.getHours()] += entry.delta;
  });

  return totals.map(value => Math.max(0, value));
}

function showDaySummary(date = new Date()) {
  const selected = dateAtStart(date);
  currentSummaryDate = todayKey(selected);
  const loads = netForDate(selected);
  const hours = hourlyTotalsForDate(selected);
  const best = Math.max(0, ...hours);
  const goalPercent = Math.min(100, Math.round((loads / Math.max(1, state.dailyGoal)) * 100));

  $('summaryDate').textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(selected);

  $('summaryLoads').textContent = loads;
  $('summaryWork').textContent = formatDuration(loads * state.minutesPerUpdate);
  $('summaryBestHour').textContent = `${best} loads`;
  $('summaryGoal').textContent = `${goalPercent}%`;
  const dayXp = state.log.filter(entry => todayKey(new Date(entry.time)) === todayKey(selected)).reduce((sum, entry) => sum + (Number(entry.xp) || Number(entry.delta) || 0), 0);
  $('summaryXp').textContent = `${Math.max(0, dayXp)} XP`;

  if (loads >= state.dailyGoal) {
    $('summaryVerdict').textContent = 'Day won. Goal crushed. The board never stood a chance.';
  } else if (goalPercent >= 75) {
    $('summaryVerdict').textContent = 'Strong shift. You kept the freight moving.';
  } else if (loads > 0) {
    $('summaryVerdict').textContent = 'Progress banked. Tomorrow gets another lap.';
  } else {
    $('summaryVerdict').textContent = 'No tracked loads for this day.';
  }

  const maxHour = Math.max(1, best);
  $('summaryHourlyBars').innerHTML = hours.map((value, hour) => {
    const height = Math.max(3, Math.round((value / maxHour) * 90));
    return `<div class="recap-hour-bar" style="height:${height}px" title="${hour}:00 — ${value} loads"></div>`;
  }).join('');

  openDialog($('summaryDialog'));
}

function maybeShowAutomaticRecap() {
  const today = todayKey();

  if (state.lastRecapDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (netForDate(yesterday) > 0) {
    state.lastRecapDate = today;
    saveState();
    showDaySummary(yesterday);
  }
}

function copySummary() {
  const date = $('summaryDate').textContent;
  const text = [
    `Win the Day Recap — ${date}`,
    `${$('summaryLoads').textContent} net loads tracked`,
    `Estimated work: ${$('summaryWork').textContent}`,
    `Best hour: ${$('summaryBestHour').textContent}`,
    `Goal: ${$('summaryGoal').textContent}`,
    `XP earned: ${$('summaryXp').textContent}`
  ].join('\n');

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Recap copied'))
      .catch(() => showToast('Could not copy recap'));
  } else {
    showToast('Copy unavailable in this browser');
  }
}


function bindReminderEventsSafely() {
  if (document.documentElement.dataset.reminderEventsBound === 'true') {
    return;
  }

  document.documentElement.dataset.reminderEventsBound = 'true';

  document.addEventListener('click', event => {
    const remindersButton = event.target.closest('#remindersBtn');
    if (remindersButton) {
      event.preventDefault();
      event.stopPropagation();

      const addButton = $('addReminderBtn');
      if (addButton) {
        addButton.disabled = false;
        addButton.textContent = 'Add reminder';
      }

      openDialog($('remindersDialog'));
      showReminderTab('list');
      renderReminders();
      return;
    }

    if (event.target.closest('#viewRemindersTab')) {
      showReminderTab('list');
      return;
    }

    if (event.target.closest('#newReminderTab')) {
      showReminderTab('form');
      return;
    }

    if (event.target.closest('#closeRemindersBtn') || event.target.closest('#closeRemindersX')) {
      closeDialog($('remindersDialog'));
      return;
    }

    if (event.target.closest('#addReminderBtn')) {
      addReminder();
      return;
    }

    if (event.target.closest('#enableNotificationsBtn')) {
      requestReminderNotifications();
      return;
    }

    if (event.target.closest('#dismissAlarmBtn')) {
      dismissReminderAlarm();
      return;
    }
  });

  const textInput = $('reminderTextInput');
  if (textInput && !textInput.dataset.bound) {
    textInput.dataset.bound = 'true';
    textInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        addReminder();
      }
    });
  }
}


// V7.7 — ROCKET HOLD Easter egg. Hold + to arm the booster; release fires
// the equipped rig into orbit and detonates a giant cartoon blast. Visual/audio only.
let plusHoldTimer = null, plusHoldRevving = false, plusHoldOscillator = null, plusHoldGain = null;

function rocketBurstParticles(vehicle) {
  if (!vehicle) return;
  const rect = vehicle.getBoundingClientRect();
  const chars = ['🔥','✨','💥','⚡','•'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'rocket-debris';
    p.textContent = chars[Math.floor(Math.random()*chars.length)];
    p.style.left = `${rect.left + rect.width/2}px`;
    p.style.top = `${rect.top + rect.height/2}px`;
    p.style.setProperty('--rx', `${(Math.random()-.5)*320}px`);
    p.style.setProperty('--ry', `${-80 + Math.random()*260}px`);
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 950);
  }
}

function makeRocketExplosion(vehicle) {
  if (!vehicle) return;
  const rect = vehicle.getBoundingClientRect();
  const boom = document.createElement('div');
  boom.className = 'rocket-explosion';
  boom.style.left = `${rect.left + rect.width/2}px`;
  boom.style.top = `${rect.top + rect.height/2}px`;
  boom.innerHTML = `<div class="boom-core">💥</div><div class="boom-ring"></div><div class="boom-word">KABOOM</div>`;
  document.body.appendChild(boom);
  rocketBurstParticles(vehicle);
  setTimeout(()=>boom.remove(), 1050);
}

function startPlusHold(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  clearTimeout(plusHoldTimer);
  plusHoldRevving = false;

  plusHoldTimer = setTimeout(() => {
    plusHoldRevving = true;
    const plus = $('plusBtn');
    const vehicle = document.querySelector('.road-world .vehicle');
    plus.classList.add('rocket-armed');
    if (vehicle) vehicle.classList.add('rocket-arming');

    // escalating exhaust while the button remains held
    showTruckSmoke();
    setTimeout(showTruckSmoke, 120);
    setTimeout(showTruckSmoke, 240);
    setTimeout(showTruckSmoke, 360);

    if (state.sound) {
      try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        plusHoldOscillator = audioContext.createOscillator();
        plusHoldGain = audioContext.createGain();
        plusHoldOscillator.type = 'sawtooth';
        plusHoldOscillator.frequency.setValueAtTime(58, now);
        plusHoldOscillator.frequency.exponentialRampToValueAtTime(210, now + .9);
        plusHoldGain.gain.setValueAtTime(.0001, now);
        plusHoldGain.gain.exponentialRampToValueAtTime(.035, now + .06);
        plusHoldOscillator.connect(plusHoldGain).connect(audioContext.destination);
        plusHoldOscillator.start(now);
      } catch {}
    }
  }, 700);
}

function endPlusHold() {
  clearTimeout(plusHoldTimer);
  plusHoldTimer = null;

  const plus = $('plusBtn');
  const vehicle = document.querySelector('.road-world .vehicle');
  plus.classList.remove('rocket-armed');
  if (vehicle) vehicle.classList.remove('rocket-arming');

  if (plusHoldOscillator && plusHoldGain && audioContext) {
    try {
      const now = audioContext.currentTime;
      plusHoldOscillator.frequency.exponentialRampToValueAtTime(520, now + .16);
      plusHoldGain.gain.exponentialRampToValueAtTime(.0001, now + .22);
      plusHoldOscillator.stop(now + .24);
    } catch {}
  }
  plusHoldOscillator = null;
  plusHoldGain = null;

  if (plusHoldRevving && vehicle) {
    // Temporarily clone the rig for the launch so the real race-position element
    // never loses its normal transform/progress logic.
    const rect = vehicle.getBoundingClientRect();
    const clone = vehicle.cloneNode(true);
    clone.className = 'rocket-launch-clone';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    document.body.appendChild(clone);

    vehicle.style.visibility = 'hidden';
    plus.classList.add('rocket-release');
    document.body.classList.add('rocket-screen-rumble');

    // Rocket flame attached to the clone.
    const flame = document.createElement('div');
    flame.className = 'rocket-flame';
    flame.textContent = '🔥';
    clone.appendChild(flame);

    if (state.sound) {
      try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        createOscillator(150, 'sawtooth', now, .18, .045);
        createOscillator(290, 'square', now + .10, .13, .025);
      } catch {}
    }

    setTimeout(() => {
      makeRocketExplosion(clone);
      clone.classList.add('rocket-detonated');
      if (state.sound) {
        try {
          const now = audioContext.currentTime;
          createOscillator(72, 'sawtooth', now, .24, .06);
          createOscillator(48, 'square', now, .20, .035);
        } catch {}
      }
    }, 520);

    setTimeout(() => {
      clone.remove();
      vehicle.style.visibility = '';
      vehicle.classList.add('rocket-return');
      setTimeout(()=>vehicle.classList.remove('rocket-return'), 500);
    }, 920);

    setTimeout(() => {
      plus.classList.remove('rocket-release');
      document.body.classList.remove('rocket-screen-rumble');
    }, 1000);
  }

  plusHoldRevving = false;
}


// V7.17 — automatic 12:30 PM Afternoon Mode, now toggleable and substantially less serious.
let lrAfternoonLoop;
const lrAfternoonLines=[
  'SEND IT','YEAHAH','ANOTHER ONE','LOCK IT IN','ABSOLUTELY','FIRE ME UP',
  'SWING THE CHEESE','LET IT EAT','CLOCKED IN, CHECKED OUT','FREIGHT BE DAMNED',
  'WE BALL','TREMENDOUS WORK, PROBABLY','BANG THE DRUM','CERTIFIED AFTERNOON'
];
const lrRoadLines=[
  'PROFESSIONALISM OPTIONAL','THE ROAD IS NOW UNSUPERVISED',
  'AFTERNOON OPERATIONS: QUESTIONABLE','CORPORATE SAID NOTHING ABOUT THIS',
  'HR HAS LEFT THE CHAT','PRODUCTIVITY, BUT MAKE IT SILLY',
  'NO MANAGERIAL OVERSIGHT DETECTED','THIS SHIFT HAS VIBES NOW'
];
const lrIncidentNames=[
  ['🕺','DISPATCH DISCO'],['🦆','DUCKS HAVE TAKEN CONTROL'],['🌮','TACTICAL TACO BREAK'],
  ['🪩','MANDATORY BOOGIE'],['🧀','CHEESE HAS BEEN SWUNG'],['🧃','JUICE BOX EMERGENCY'],
  ['🫡','SALUTE THE AFTERNOON'],['🛸','UNEXPLAINED MANAGEMENT VISIT']
];

function lrAfternoonClockReady(){
  const d=new Date();
  return d.getHours()*60+d.getMinutes()>=750;
}
function lrAfternoonNow(){
  return state.afternoonModeEnabled !== false && lrAfternoonClockReady();
}

function lrRemoveAfternoonExtras(){
  document.body.classList.remove('lr-afternoon','lr-afternoon-disco');
  document.getElementById('lrAfternoonBadge')?.remove();
  document.querySelectorAll('.lr-afternoon-floater,.lr-afternoon-incident,.lr-road-sign').forEach(el=>el.remove());
}

function lrApplyAfternoon(){
  const on=lrAfternoonNow();
  document.body.classList.toggle('lr-afternoon',on);
  let b=document.getElementById('lrAfternoonBadge');
  if(on&&!b){
    b=document.createElement('button');
    b.id='lrAfternoonBadge';
    b.className='lr-afternoon-badge';
    b.type='button';
    b.title='Open Settings to toggle Afternoon Mode';
    b.innerHTML='<span>😎</span><div><b>AFTERNOON MODE</b><small>professionalism has expired</small></div>';
    b.addEventListener('click',()=>openDialog($('settingsDialog')));
    document.body.appendChild(b);
  } else if(!on&&b) b.remove();
}

function lrAfternoonRain(chars=['🧀','✨','😎','📦']){
  for(let i=0;i<16;i++){
    const e=document.createElement('div');
    e.className='lr-afternoon-floater';
    e.textContent=chars[Math.floor(Math.random()*chars.length)];
    e.style.left=(5+Math.random()*90)+'vw';
    e.style.setProperty('--drift',`${(Math.random()-.5)*150}px`);
    e.style.animationDelay=(Math.random()*.18)+'s';
    document.body.appendChild(e);
    setTimeout(()=>e.remove(),1900);
  }
}


function lrAfternoonFrenzy(){
  if(!lrAfternoonNow())return;
  state.afternoonFrenzyUntil=Date.now()+8000;
  document.body.classList.add('lr-afternoon-frenzy');
  renderAll();

  const scream=document.createElement('div');
  scream.className='lr-load-rush-scream';
  scream.innerHTML='<small>10× COMBO ENGAGED</small><strong>LOAD RUSH!</strong><span>🌈⚡📦⚡🌈</span>';
  document.body.appendChild(scream);
  requestAnimationFrame(()=>scream.classList.add('show'));
  lrAfternoonRain(['🌈','⚡','📦','🔥','😎','✨','🚛']);

  if(state.sound){
    ensureGameAudio().then(()=>{
      try{
        const now=audioContext.currentTime;
        [[110,0],[165,.05],[220,.10],[330,.18],[440,.26],[660,.34]].forEach(([f,o],i)=>{
          const osc=audioContext.createOscillator(),g=audioContext.createGain();
          osc.type=i<3?'sawtooth':'square';
          osc.frequency.setValueAtTime(f,now+o);
          g.gain.setValueAtTime(.0001,now+o);
          g.gain.exponentialRampToValueAtTime(i<3?.09:.055,now+o+.015);
          g.gain.exponentialRampToValueAtTime(.0001,now+o+.20);
          osc.connect(g).connect(audioContext.destination);osc.start(now+o);osc.stop(now+o+.22);
        });
      }catch{}
    });
  }
  setTimeout(()=>scream.classList.add('pulse'),420);
  setTimeout(()=>scream.remove(),3400);
  setTimeout(()=>{
    document.body.classList.remove('lr-afternoon-frenzy');
    state.afternoonFrenzyUntil=0;
    renderAll();
  },8200);
}

function lrAfternoonIncident(){
  if(!lrAfternoonNow())return;
  const [icon,name]=lrIncidentNames[Math.floor(Math.random()*lrIncidentNames.length)];
  const card=document.createElement('div');
  card.className='lr-afternoon-incident';
  card.innerHTML=`<span>${icon}</span><div><small>AFTERNOON INCIDENT</small><b>${name}</b></div>`;
  document.body.appendChild(card);
  requestAnimationFrame(()=>card.classList.add('show'));
  lrAfternoonRain([icon,'✨','😎','🧀']);
  document.body.classList.add('lr-afternoon-disco');
  lrAfternoonFrenzy();
  setTimeout(()=>document.body.classList.remove('lr-afternoon-disco'),4200);
  setTimeout(()=>card.remove(),2200);
  if(state.sound) playTone('plus',true);
}

function lrAfternoonClick(){
  if(!lrAfternoonNow())return;
  const btn=$('plusBtn'),r=btn.getBoundingClientRect(),p=document.createElement('div');
  p.className='lr-afternoon-pop';
  p.textContent=lrAfternoonLines[Math.floor(Math.random()*lrAfternoonLines.length)];
  p.style.left=(r.left+r.width/2)+'px';
  p.style.top=r.top+'px';
  document.body.appendChild(p);
  setTimeout(()=>p.remove(),900);

  if(Math.random()<.20){
    const road=document.querySelector('.road-world');
    if(road){
      const s=document.createElement('div');
      s.className='lr-road-sign';
      s.textContent=lrRoadLines[Math.floor(Math.random()*lrRoadLines.length)];
      road.appendChild(s);
      setTimeout(()=>s.remove(),2700);
    }
  }

  if(Math.random()<.28){
    const v=document.querySelector('.road-world .vehicle');
    if(v){
      v.classList.remove('lr-afternoon-hop');
      void v.offsetWidth;
      v.classList.add('lr-afternoon-hop');
      setTimeout(()=>v.classList.remove('lr-afternoon-hop'),520);
    }
  }

  // Rare full-screen nonsense. Cosmetic only.
  if(Math.random()<.045) lrAfternoonIncident();
}

function lrInitQuirks(){
  if(state.afternoonModeEnabled==null) state.afternoonModeEnabled=true;
  lrApplyAfternoon();
  lrAfternoonLoop=setInterval(lrApplyAfternoon,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)lrApplyAfternoon()});
}

// V7.13 — Prestige every 100 levels.

function lrCurrentLevel(){
  // HARD SYNC: this is the exact same canonical level source used by the main XP card.
  return lifetimeLevel();
}

function lrPrestigeCycleLevel(){
  const lifetime = lifetimeLevel();
  const baseline = Number(state.prestigeLevelBaseline || 0);
  // Before first prestige, mirror the actual lifetime level exactly.
  if (lrPrestigeRank() === 0) return Math.min(100, lifetime);
  // After prestiging, count levels gained since the prestige moment.
  return Math.min(100, Math.max(1, lifetime - baseline + 1));
}

function lrPrestigeRank(){return Math.max(0,Number(state.prestige||0))}
function lrPrestigeXpMultiplier(){return Math.max(1,lrPrestigeRank()+1)}
function lrCanPrestige(){return lrPrestigeCycleLevel()>=100}
const LR_PRESTIGE_REWARDS = [
  null,
  {name:'Rebirth Aura', desc:'Permanent violet prestige aura around the game world.'},
  {name:'Overdrive', desc:'Every 10th load triggers a free Nitro Boost road burst.'},
  {name:'Weather Machine', desc:'Random automatic Thunder Run weather can strike while logging loads.'},
  {name:'Classified Road Events', desc:'Unlocks secret Prestige road events, including Classified Convoy.'},
  {name:'Freight Royalty', desc:'Every completed Hourly Quest awards +1 extra loot box.'},
  {name:'Reality Failure', desc:'Unlocks Reality Tear events and periodic reality-glitch road chaos.'},
  {name:'The Zebra', desc:'Permanently unlocks The Zebra 🦓 in the Garage.'},
  {name:'Lucky Freight', desc:'Loot-box character jackpot chance increases from 16% to 25%.'},
  {name:'Cosmic Dispatch', desc:'Unlocks Meteor Freight and automatic cosmic road events.'},
  {name:'Immortal', desc:'Permanent Immortal rainbow aura plus legendary Immortal Run events.'}
];
function lrPrestigeReward(rank){return LR_PRESTIGE_REWARDS[Math.min(10,Math.max(1,Number(rank)||1))]}
function lrPrestigeRewardName(rank){return lrPrestigeReward(rank).name}
function lrPrestigeRewardDescription(rank){return lrPrestigeReward(rank).desc}
function lrPrestigeLoadNumber(){return Math.max(0,todayNetLoads())}
function lrRunPrestigeAutoEvent(event){
  if(!event || document.querySelector('.lr-prestige-ceremony')) return;
  runFateScene(event);
  flashMegaMessage(`${event.icon} ${event.name.toUpperCase()}!`);
  showToast(`${event.rarity} · ${event.name}`);
}
function lrMaybePrestigeRoadReward(){
  const p=lrPrestigeRank(), loads=lrPrestigeLoadNumber();
  if(p < 2 || loads <= 0) return;
  // P2 Overdrive: deterministic every 10 loads.
  if(p >= 2 && loads % 10 === 0){
    const nitro=FATE_EVENTS.find(e=>e.id==='nitro');
    if(nitro) setTimeout(()=>lrRunPrestigeAutoEvent(nitro),180);
    return;
  }
  // P3 Weather Machine: occasional automatic storm.
  if(p >= 3 && Math.random() < .035){
    const rain=FATE_EVENTS.find(e=>e.id==='rain');
    if(rain) setTimeout(()=>lrRunPrestigeAutoEvent(rain),180);
    return;
  }
  // P4 secret events, P6 reality tears, P9 cosmic events, P10 immortal runs.
  let pool=[];
  if(p>=4) pool.push('classified-convoy');
  if(p>=6) pool.push('reality-tear');
  if(p>=9) pool.push('meteor-freight');
  if(p>=10) pool.push('immortal-run');
  const chance=p>=10?.03:p>=9?.022:p>=6?.016:p>=4?.012:0;
  if(pool.length && Math.random()<chance){
    const id=pool[Math.floor(Math.random()*pool.length)];
    const event=FATE_EVENTS.find(e=>e.id===id);
    if(event) setTimeout(()=>lrRunPrestigeAutoEvent(event),180);
  }
}
function lrRenderPrestige(){
 let box=document.getElementById('lrPrestigeBox'),host=document.querySelector('#garageView,.garage-view,[data-view="garage"],.garage-section')||document.querySelector('main');if(!host)return;
 if(!box){box=document.createElement('section');box.id='lrPrestigeBox';box.className='lr-prestige-box';host.appendChild(box)}
 const p=lrPrestigeRank(),ready=lrCanPrestige();
 const currentReward=p?lrPrestigeRewardDescription(p):'Reach Level 100 to unlock your first permanent Prestige perk.';
 const nextRank=Math.min(10,p+1);
 box.innerHTML=`<div class="lr-prestige-head"><div><span>CAREER PRESTIGE</span><h3>${p?`P${p} • ${lrPrestigeRewardName(p)}`:'Prestige awaits'}</h3></div><div class="lr-prestige-emblem">${p?`P${p}`:'♛'}</div></div><p>${currentReward}</p><div class="lr-prestige-xp-boost">⚡ Permanent XP Boost: <strong>${lrPrestigeXpMultiplier()}×</strong></div><div class="lr-prestige-progress"><i style="width:${lrPrestigeCycleLevel()}%"></i></div><div class="lr-prestige-foot"><b>Level ${lrPrestigeCycleLevel()}/100</b><span>${p>=10?'ALL PRESTIGE REWARDS UNLOCKED':`Next: ${lrPrestigeRewardName(nextRank)} — ${lrPrestigeRewardDescription(nextRank)}`}</span></div><button id="lrPrestigeBtn" class="lr-prestige-btn" ${ready?'':'disabled'}>${ready?'PRESTIGE NOW':'REACH LEVEL 100'}</button>`;
 const btn=document.getElementById('lrPrestigeBtn');if(btn&&ready)btn.onclick=lrDoPrestige;
 document.body.classList.toggle('lr-prestige-aura',p>=1);
 document.body.classList.toggle('lr-prestige-immortal',p>=10);
}
function lrRunPrestigeCutscene(rank,reward){
  const old=document.querySelector('.lr-prestige-ceremony');
  if(old) old.remove();

  const ov=document.createElement('div');
  ov.className='lr-prestige-ceremony';
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-label',`Prestige ${rank} unlocked`);
  ov.innerHTML=`
    <div class="lr-pc-stars" aria-hidden="true"></div>
    <div class="lr-pc-shake" aria-hidden="true"></div>
    <div class="lr-pc-confetti" aria-hidden="true"></div>
    <div class="lr-pc-road" aria-hidden="true"><div class="lr-pc-rig">${escapeHtml((selectedRig()||RIGS[0]||{}).icon||'🚚')}</div></div>
    <section class="lr-pc-stage lr-pc-stage-1">
      <small>THE LAST 100 LEVELS</small>
      <strong>100 LEVELS.</strong>
      <span>YOU ACTUALLY DID IT.</span>
    </section>
    <section class="lr-pc-stage lr-pc-stage-2">
      <small>RUN COMPLETE</small>
      <strong>PRESTIGE ${rank}</strong>
      <span>LOAD RUSH.</span>
    </section>
    <section class="lr-pc-stage lr-pc-stage-3">
      <div class="lr-pc-emblem">P${rank}</div>
      <small>PERMANENT UPGRADE ACQUIRED</small>
      <strong>${reward.toUpperCase()}</strong>
      <span>⚡ ${rank+1}× XP — FOREVER</span>
    </section>
    <section class="lr-pc-stage lr-pc-stage-4">
      <small>CAREER MILESTONE</small>
      <strong>PRESTIGE ${rank}</strong>
      <span>${reward} · ${rank+1}× XP · HISTORY PRESERVED</span>
    </section>
    <section class="lr-pc-stage lr-pc-stage-5">
      <small>REBIRTH COMPLETE</small>
      <strong>LEVEL RESET: 1</strong>
      <span>THE GRIND CONTINUES.</span>
    </section>
    <button class="lr-pc-skip" type="button" aria-label="Skip prestige cutscene">SKIP</button>`;
  document.body.appendChild(ov);

  const timers=[];
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const showStage=n=>{
    ov.dataset.stage=String(n);
    ov.querySelectorAll('.lr-pc-stage').forEach((el,i)=>el.classList.toggle('active',i===n-1));
  };
  const finish=()=>{
    timers.forEach(clearTimeout);
    ov.classList.add('ending');
    setTimeout(()=>ov.remove(),650);
  };

  requestAnimationFrame(()=>ov.classList.add('show'));
  showStage(1);
  later(()=>ov.classList.add('chaos'),5000);
  later(()=>showStage(2),5200);
  later(()=>showStage(3),12000);
  later(()=>ov.classList.remove('chaos'),16000);
  later(()=>showStage(4),20000);
  later(()=>showStage(5),27000);
  later(finish,30000);

  const skip=ov.querySelector('.lr-pc-skip');
  later(()=>skip.classList.add('available'),7000);
  skip.addEventListener('click',finish,{once:true});
}

function lrDoPrestige(){
 if(!lrCanPrestige())return;const next=lrPrestigeRank()+1,reward=lrPrestigeRewardName(next);
 if(!confirm(`PRESTIGE ${next}?\n\nYour current level resets to 1. Lifetime stats, races, garage unlocks and history stay intact.\n\nUnlock: ${reward}`))return;
 state.prestige=next;
 state.prestigeLevelBaseline=lifetimeLevel();
 state.lastPrestigeCutsceneRank=next;
 if('levelXp'in state)state.levelXp=0;
 // V7.26 FIX: this app persists through saveState(), not save().
 // The old save() call threw a ReferenceError and stopped execution before the cinematic.
 saveState();
 try{render()}catch{}
 lrRenderPrestige();
 lrRunPrestigeCutscene(next,reward);
}
function lrInitPrestige(){
  if(state.prestige==null) state.prestige=0;
  // Migration for anyone who already prestiged before baseline tracking existed.
  if(lrPrestigeRank()>0 && !Number.isFinite(Number(state.prestigeLevelBaseline))){
    state.prestigeLevelBaseline=lifetimeLevel();
    saveState();
  }
  lrRenderPrestige();
  document.addEventListener('click',()=>setTimeout(lrRenderPrestige,80));
}

function bindEvents() {
  $('plusBtn').addEventListener('click', async () => {
    if (state.sound) await ensureGameAudio();
    addLoad(1);
    lrAfternoonClick();
  });
  $('plusBtn').addEventListener('pointerdown', startPlusHold);
  $('plusBtn').addEventListener('pointerup', endPlusHold);
  $('plusBtn').addEventListener('pointercancel', endPlusHold);
  $('plusBtn').addEventListener('pointerleave', event => { if (event.buttons) endPlusHold(); });
  $('minusBtn').addEventListener('click', () => addLoad(-1));
  $('undoBtn').addEventListener('click', undoLast);
  $('exportBtn').addEventListener('click', exportBackup);

  $('insightsBtn').addEventListener('click', () => {
    renderInsights(activeChartPeriod);
    openDialog($('insightsDialog'));
  });

  $('summaryBtn').addEventListener('click', () => showDaySummary(new Date()));

  $('closeInsightsBtn').addEventListener('click', () => closeDialog($('insightsDialog')));
  $('closeInsightsX').addEventListener('click', () => closeDialog($('insightsDialog')));

  document.querySelectorAll('.period-tab').forEach(button => {
    button.addEventListener('click', () => renderInsights(button.dataset.period));
  });

  $('closeSummaryBtn').addEventListener('click', () => closeDialog($('summaryDialog')));
  $('closeSummaryX').addEventListener('click', () => closeDialog($('summaryDialog')));
  $('shareSummaryBtn').addEventListener('click', copySummary);

  $('themeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    renderAll();
  });

  $('garageBtn').addEventListener('click', () => {
    renderGarage();
    openDialog($('garageDialog'));
  });

  if ($('garageCrateBtn')) $('garageCrateBtn').addEventListener('click', openTruckCrate);
  $('garageOpenAllBtn').addEventListener('click', lrOpenAllCrates);
  $('closeCrateAllResultsBtn').addEventListener('click', () => { closeDialog($('crateAllResultsDialog')); openDialog($('garageDialog')); });
  $('closeCrateAllResultsX').addEventListener('click', () => { closeDialog($('crateAllResultsDialog')); openDialog($('garageDialog')); });

  $('rollFateBtn').addEventListener('click', rollFreightFate);
  $('skipFateBtn').addEventListener('click', skipFreightFate);
  if ($('closeFateResultBtn')) $('closeFateResultBtn').addEventListener('click', () => closeDialog($('fateResultDialog')));
  $('closeCrateRevealBtn').addEventListener('click', () => {
    closeDialog($('crateRevealDialog'));
    renderGarage();
    openDialog($('garageDialog'));
  });

  $('closeGarageBtn').addEventListener('click', () => closeDialog($('garageDialog')));
  $('closeGarageX').addEventListener('click', () => closeDialog($('garageDialog')));

  $('settingsBtn').addEventListener('click', () => openDialog($('settingsDialog')));
  $('closeSettingsX').addEventListener('click', () => closeDialog($('settingsDialog')));

  $('saveSettingsBtn').addEventListener('click', () => {
    state.dailyGoal = Math.max(1, Number($('dailyGoalInput').value) || DEFAULTS.dailyGoal);
    state.hourlyGoal = Math.max(1, Number($('hourlyGoalInput').value) || DEFAULTS.hourlyGoal);
    state.minutesPerUpdate = Math.max(1, Number($('minutesInput').value) || DEFAULTS.minutesPerUpdate);
    state.soundStyle = $('soundStyleSelect').value || 'engine';
    state.fateFrequency = Math.max(1, Number($('fateFrequencySelect').value) || 10);

    saveState();
    renderAll();
    closeDialog($('settingsDialog'));
    showToast('Settings saved');
  });

  $('soundToggle').addEventListener('click', async () => {
    state.sound = !state.sound;
    saveState();
    applyTheme();

    if (state.sound) {
      await ensureGameAudio();
      playTone('plus', false, true);
      showToast('Sound on');
    } else {
      showToast('Sound muted');
    }
  });

  $('reminderAlarmToggle').addEventListener('click', () => {
    state.reminderAlarmEnabled = state.reminderAlarmEnabled === false;
    saveState();
    applyTheme();
    showToast(state.reminderAlarmEnabled ? 'Reminder alarm enabled' : 'Reminder alarm muted');
  });

  $('cancelReminderWarningBtn').addEventListener('click', () => {
    pendingReminderDraft = null;
    closeDialog($('reminderAlarmWarningDialog'));
  });

  $('confirmReminderWarningBtn').addEventListener('click', () => {
    const draft = pendingReminderDraft;
    pendingReminderDraft = null;
    state.reminderAlarmWarningSeen = true;
    saveState();
    closeDialog($('reminderAlarmWarningDialog'));
    if (draft) saveReminderDraft(draft);
  });

  $('soundStyleSelect').addEventListener('change', () => {
    state.soundStyle = $('soundStyleSelect').value;
    saveState();
  });

  $('previewSoundBtn').addEventListener('click', async () => {
    state.soundStyle = $('soundStyleSelect').value;
    await ensureGameAudio();
    playTone('plus', false, true);
  });

  $('particlesToggle').addEventListener('click', () => {
    state.particles = !state.particles;
    saveState();
    applyTheme();
  });

  $('afternoonModeToggle').addEventListener('click', () => {
    state.afternoonModeEnabled = state.afternoonModeEnabled === false;
    saveState();
    applyTheme();
    if (state.afternoonModeEnabled) {
      lrApplyAfternoon();
      showToast(lrAfternoonClockReady() ? 'Afternoon Mode unleashed' : 'Afternoon Mode armed for 12:30');
    } else {
      lrRemoveAfternoonExtras();
      showToast('Afternoon Mode off');
    }
  });

  $('fateToggle').addEventListener('click', () => {
    state.fateEnabled = !state.fateEnabled;
    saveState();
    applyTheme();
  });

  $('fateFrequencySelect').addEventListener('change', () => {
    state.fateFrequency = Math.max(1, Number($('fateFrequencySelect').value) || 10);
    saveState();
  });

  $('importBtn').addEventListener('click', () => $('importInput').click());

  $('importInput').addEventListener('change', async event => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imported = JSON.parse(await file.text());
      const migrated = migrateLegacyState(imported);

      Object.assign(state, DEFAULTS, migrated);
      saveState();
      renderAll();
      closeDialog($('settingsDialog'));
      showToast('Backup imported');
    } catch (error) {
      console.error(error);
      alert('That backup file could not be read.');
    }

    event.target.value = '';
  });

  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all Load Rush data? This cannot be undone.')) {
      return;
    }

    Object.assign(state, {
      ...DEFAULTS,
      log: [],
      completedHours: []
    });

    saveState();
    renderAll();
    closeDialog($('settingsDialog'));
    showToast('Load Rush reset');
  });

  document.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=' || event.key === 'ArrowUp') {
      addLoad(1);
    }

    if (event.key === '-' || event.key === '_' || event.key === 'ArrowDown') {
      addLoad(-1);
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undoLast();
    }

    if (event.key === 'Escape') {
      if ($('garageDialog').open) {
        closeDialog($('garageDialog'));
      }

      if ($('settingsDialog').open) {
        closeDialog($('settingsDialog'));
      }

      if ($('insightsDialog').open) {
        closeDialog($('insightsDialog'));
      }

      if ($('summaryDialog').open) {
        closeDialog($('summaryDialog'));
      }

      if ($('fatePromptDialog').open) {
        skipFreightFate();
      }

      if ($('fateResultDialog').open) {
        closeDialog($('fateResultDialog'));
      }

      if ($('crateRevealDialog').open) {
        closeDialog($('crateRevealDialog'));
      }

      if ($('remindersDialog').open) {
        closeDialog($('remindersDialog'));
      }
    }
  });
}


async function clearLegacyAppCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.toLowerCase().includes('load-rush'))
          .map(name => caches.delete(name))
      );
    }
  } catch (error) {
    console.warn('Legacy cache cleanup skipped:', error);
  }
}

async function registerServiceWorker() {
  // Disabled in V3.6 while clearing stale GitHub Pages/PWA caches.
  // This prevents old app.js versions from being mixed with new HTML.
  await clearLegacyAppCaches();
}

async function initialize() {
  await clearLegacyAppCaches();
  state.log = Array.isArray(state.log) ? state.log : [];
  state.completedHours = Array.isArray(state.completedHours) ? state.completedHours : [];
  state.hourlyRaceAwards = state.hourlyRaceAwards && typeof state.hourlyRaceAwards === 'object' ? state.hourlyRaceAwards : {};
  state.raceWins = Math.max(0, Number(state.raceWins) || 0);
  state.crateTokens = Math.max(0, Number(state.crateTokens) || 0);
  state.rigLoadCounts = state.rigLoadCounts && typeof state.rigLoadCounts === 'object' ? state.rigLoadCounts : {};
  state.bonusXP = Math.max(0, Number(state.bonusXP) || 0);
  reconcileProgressFromLog();
  state.reminders = Array.isArray(state.reminders) ? state.reminders : [];
  state.reminderAlarmEnabled = state.reminderAlarmEnabled !== false;
  state.reminderAlarmWarningSeen = state.reminderAlarmWarningSeen === true;
  state.seenUnlocks = Array.isArray(state.seenUnlocks) ? state.seenUnlocks : [];
  initializeUnlockTracking();
  bindEvents();
  lrInitQuirks();
  lrInitPrestige();
  bindReminderEventsSafely();

  const brandTitle = $('brandTitle');
  if (brandTitle) {
    brandTitle.addEventListener('click', editBrandTitle);
    brandTitle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        editBrandTitle();
      }
    });
    brandTitle.setAttribute('tabindex', '0');
    brandTitle.setAttribute('role', 'button');
    brandTitle.setAttribute('aria-label', 'Change heading text');
  }

  const remindersButton = $('remindersBtn');
  if (remindersButton) {
    remindersButton.onclick = event => {
      event.preventDefault();
      event.stopPropagation();

      const addButton = $('addReminderBtn');
      if (addButton) {
        addButton.disabled = false;
        addButton.textContent = 'Add reminder';
      }

      openDialog($('remindersDialog'));
      showReminderTab('list');
      renderReminders();
    };
  }

  $('reminderDateInput').value = defaultReminderDate();
  $('reminderTimeInput').value = defaultReminderTime();

  if ('Notification' in window && Notification.permission === 'granted') {
    $('enableNotificationsBtn').textContent = 'Notifications enabled';
    $('enableNotificationsBtn').disabled = true;
  }

  renderBrandTitle();
  renderAll();
  renderReminders();
  startHourlyClock();
  checkReminders();
  setInterval(checkReminders, 1000);
  setTimeout(maybeShowAutomaticRecap, 600);
  registerServiceWorker();
}

initialize().catch(error => {
  console.error('Initialization failed:', error);
});
