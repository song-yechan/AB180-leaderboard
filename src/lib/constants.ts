export const BADGE_TYPES = [
  // ── 시작 (Getting Started) ──
  { type: "first_step", icon: "👣", label: "First Step", description: "첫 세션 완료" },
  { type: "hello_world", icon: "👋", label: "Hello World", description: "첫 로그인" },
  { type: "setup_done", icon: "⚙️", label: "Setup Done", description: "CLI 설정 완료" },

  // ── 세션 (Sessions) ──
  { type: "session_10", icon: "🔟", label: "Ten Timer", description: "10세션 달성" },
  { type: "session_50", icon: "🎯", label: "Half Century", description: "50세션 달성" },
  { type: "century", icon: "💯", label: "Century", description: "100세션 달성" },
  { type: "session_500", icon: "🏅", label: "Power User", description: "500세션 달성" },
  { type: "session_1000", icon: "🏆", label: "Legendary", description: "1,000세션 달성" },

  // ── 비용 (Cost Milestones) ──
  { type: "one_dollar", icon: "🪙", label: "$1 Club", description: "누적 $1 돌파" },
  { type: "ten_dollar", icon: "💵", label: "$10 Club", description: "누적 $10 돌파" },
  { type: "fifty_dollar", icon: "💰", label: "$50 Club", description: "누적 $50 돌파" },
  { type: "hundred_dollar", icon: "💎", label: "$100 Club", description: "누적 $100 돌파" },
  { type: "five_hundred_dollar", icon: "👑", label: "$500 Club", description: "누적 $500 돌파" },
  { type: "thousand_dollar", icon: "🌟", label: "$1K Club", description: "누적 $1,000 돌파" },

  // ── 스트릭 (Streaks) ──
  { type: "streak_3", icon: "🔥", label: "On Fire", description: "3일 연속 사용" },
  { type: "week_warrior", icon: "⚔️", label: "Week Warrior", description: "7일 연속 사용" },
  { type: "streak_14", icon: "🛡️", label: "Fortnight", description: "14일 연속 사용" },
  { type: "streak_21", icon: "⭐", label: "Three Weeks", description: "21일 연속 사용" },
  { type: "month_master", icon: "🏰", label: "Month Master", description: "30일 연속 사용" },
  { type: "streak_60", icon: "🌋", label: "Iron Will", description: "60일 연속 사용" },
  { type: "streak_90", icon: "🗻", label: "Unbreakable", description: "90일 연속 사용" },

  // ── 코드 (Code) ──
  { type: "code_pusher", icon: "📦", label: "Code Pusher", description: "첫 커밋" },
  { type: "commit_10", icon: "🔧", label: "Wrench Master", description: "10커밋 달성" },
  { type: "commit_50", icon: "🔨", label: "Hammer Time", description: "50커밋 달성" },
  { type: "commit_100", icon: "⚒️", label: "Blacksmith", description: "100커밋 달성" },
  { type: "pr_hero", icon: "🦸", label: "PR Hero", description: "첫 PR 생성" },
  { type: "pr_10", icon: "🎪", label: "PR Machine", description: "10 PR 달성" },

  // ── 시간대 (Time-based) ──
  { type: "early_bird", icon: "🐤", label: "Early Bird", description: "오전 6시 이전 세션" },
  { type: "night_owl", icon: "🦉", label: "Night Owl", description: "자정 이후 세션" },
  { type: "weekend_warrior", icon: "🎮", label: "Weekend Warrior", description: "주말 세션 완료" },

  // ── 특별 (Special) ──
  { type: "skill_maker", icon: "🛠️", label: "Skill Maker", description: "첫 스킬 제작" },
  { type: "big_session", icon: "🐋", label: "Whale Session", description: "단일 세션 $5+ 사용" },
  { type: "mega_session", icon: "🌊", label: "Mega Session", description: "단일 세션 $20+ 사용" },
  { type: "multi_model", icon: "🎭", label: "Model Mixer", description: "3개 이상 모델 사용" },
  { type: "speed_demon", icon: "⚡", label: "Speed Demon", description: "하루 10세션 이상" },

  // ── 소셜 (Social) ──
  { type: "top_3", icon: "🥇", label: "Podium", description: "리더보드 Top 3 달성" },
  { type: "top_10", icon: "🎖️", label: "Top 10", description: "리더보드 Top 10 달성" },
  { type: "first_compare", icon: "🔍", label: "Rival Check", description: "첫 유저 비교" },

  // ── 캠프 (Camp) ──
  { type: "camp_graduate", icon: "🎓", label: "Graduate", description: "AI Camp 전 과정 수료" },
  { type: "camp_day1", icon: "📘", label: "Day 1 Complete", description: "Day 1 완료" },
] as const;

export type BadgeType = (typeof BADGE_TYPES)[number];

export const COHORTS: Record<string, number> = {
  "1": 1, "2": 1, "3": 1, "4": 2, "5": 2, "6": 1, "7": 2, "8": 2,
};
