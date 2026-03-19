import { BADGE_TYPES } from "@/lib/constants";

export interface FallbackDailyUsage {
  date: string;
  cost: number;
  sessions: number;
}

export interface FallbackStreakEntry {
  date: string;
  cost: number;
  sessions: number;
}

export interface FallbackEarnedBadge {
  badge_type: string;
  earned_at: string;
}

export function generateFallbackDaily(userId: string): FallbackDailyUsage[] {
  const data: FallbackDailyUsage[] = [];
  const today = new Date();
  const seed = parseInt(userId, 10) || 1;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const val = ((seed * 17 + i * 31) % 40) + (i % 3 === 0 ? 20 : 10);
    data.push({
      date: dateStr,
      cost: Math.round(val * 3.5 * 100) / 100,
      sessions: Math.max(2, (val % 12) + 3),
    });
  }
  return data;
}

export function generateFallbackStreak(userId: string): FallbackStreakEntry[] {
  const data: FallbackStreakEntry[] = [];
  const today = new Date();
  const seed = parseInt(userId, 10) || 1;
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const val = ((seed * 13 + i * 7) % 10);
    const sessions = val > 3 ? val % 6 : 0;
    data.push({ date: dateStr, cost: sessions * 2.5, sessions });
  }
  return data;
}

export function getFallbackBadges(userId: string): FallbackEarnedBadge[] {
  const seed = parseInt(userId, 10) || 1;
  return BADGE_TYPES.filter((_, i) => (seed + i) % 3 !== 0).map((b) => ({
    badge_type: b.type,
    earned_at: new Date(Date.now() - (seed + 1) * 86400000 * 3).toISOString(),
  }));
}
