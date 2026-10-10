export const XP_CONFIG = {
  completedSession: 100,
  personalRecordBonus: 25,
  skillMasteryBonus: 50,
} as const;

export const RANKS = [
  { name: "Rookie", minXp: 0 },
  { name: "Bar Regular", minXp: 500 },
  { name: "Skill Hunter", minXp: 1500 },
  { name: "Specialist", minXp: 3500 },
  { name: "Elite", minXp: 7000 },
] as const;

export const ACCENT_THEMES = [
  { id: "lime", name: "Electric lime", rgb: "190, 242, 0", unlockXp: 0 },
  { id: "cyan", name: "Arctic cyan", rgb: "34, 211, 238", unlockXp: 500 },
  { id: "violet", name: "Ultraviolet", rgb: "167, 139, 250", unlockXp: 1500 },
  { id: "coral", name: "Heat coral", rgb: "251, 113, 133", unlockXp: 3500 },
] as const;

export type AccentThemeId = (typeof ACCENT_THEMES)[number]["id"];

export const STREAK_CONFIG = {
  daysPerFreeze: 7,
  maxHeldFreezes: 2,
} as const;

export const WEEKLY_CHALLENGE_CONFIG = {
  historyDays: 28,
  minimumRepTarget: 20,
  minimumHoldTargetSeconds: 120,
  repTargetMultiplier: 1.5,
  holdTargetMultiplier: 1.5,
} as const;
