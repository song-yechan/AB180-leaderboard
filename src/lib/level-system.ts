export const LEVELS = [
  { level: 1, name: "초보 트레이너", icon: "🎒", requiredXP: 0 },
  { level: 2, name: "첫 포획", icon: "🔴", requiredXP: 100_000 },
  { level: 3, name: "풀숲 탐험가", icon: "🌿", requiredXP: 500_000 },
  { level: 4, name: "첫 번째 뱃지", icon: "🥉", requiredXP: 1_000_000 },
  { level: 5, name: "두 번째 뱃지", icon: "🥈", requiredXP: 2_000_000 },
  { level: 6, name: "세 번째 뱃지", icon: "🥇", requiredXP: 4_000_000 },
  { level: 7, name: "네 번째 뱃지", icon: "🏅", requiredXP: 7_000_000 },
  { level: 8, name: "다섯 번째 뱃지", icon: "🎖️", requiredXP: 11_000_000 },
  { level: 9, name: "여섯 번째 뱃지", icon: "⭐", requiredXP: 16_000_000 },
  { level: 10, name: "일곱 번째 뱃지", icon: "🌟", requiredXP: 22_000_000 },
  { level: 11, name: "뱃지 컴플리트", icon: "💫", requiredXP: 29_000_000 },
  { level: 12, name: "리그 도전", icon: "✨", requiredXP: 37_000_000 },
  { level: 13, name: "사천왕 1", icon: "⚔️", requiredXP: 46_000_000 },
  { level: 14, name: "사천왕 2", icon: "🛡️", requiredXP: 57_000_000 },
  { level: 15, name: "사천왕 3", icon: "🔮", requiredXP: 70_000_000 },
  { level: 16, name: "사천왕 4", icon: "⚡", requiredXP: 85_000_000 },
  { level: 17, name: "챔피언", icon: "👑", requiredXP: 105_000_000 },
  { level: 18, name: "도감 마스터", icon: "📖", requiredXP: 130_000_000 },
  { level: 19, name: "전설의 트레이너", icon: "🌌", requiredXP: 170_000_000 },
  { level: 20, name: "포켓몬 마스터", icon: "🏆", requiredXP: 220_000_000 },
] as const;

export function calculateXP(totalTokens: number, role: string): number {
  const multiplier = role === "developer" ? 0.7 : 1.0;
  return Math.floor(totalTokens * multiplier);
}

export type LevelEntry = (typeof LEVELS)[number];

export function getLevel(xp: number) {
  let current: LevelEntry = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.requiredXP) current = level;
    else break;
  }
  const currentIndex = LEVELS.indexOf(current);
  const next: LevelEntry | null =
    currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
  const progress = next
    ? (xp - current.requiredXP) / (next.requiredXP - current.requiredXP)
    : 1;
  return { ...current, xp, progress, next };
}
