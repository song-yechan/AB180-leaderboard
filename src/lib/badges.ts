import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * usage/submit 후 배지 조건을 체크하고 자동 지급.
 * 이미 보유한 배지는 upsert로 중복 방지.
 */
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: logs } = await supabase
    .from("usage_logs")
    .select("date, total_cost, sessions_count, commits, pull_requests")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (!logs || logs.length === 0) return;

  const totals = logs.reduce(
    (acc, d) => ({
      cost: acc.cost + Number(d.total_cost ?? 0),
      sessions: acc.sessions + (d.sessions_count ?? 0),
      commits: acc.commits + (d.commits ?? 0),
      prs: acc.prs + (d.pull_requests ?? 0),
    }),
    { cost: 0, sessions: 0, commits: 0, prs: 0 }
  );

  // Streak 계산
  const dates = logs.map((d) => d.date).sort();
  let maxStreak = 0;
  let currentStreak = 0;

  if (dates.length > 0) {
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }
  }

  // 오늘의 최신 로그 (시간대 + 단일 세션 분석용)
  const todayLog = logs[logs.length - 1];
  const todaySessions = todayLog?.sessions_count ?? 0;
  const todayCost = Number(todayLog?.total_cost ?? 0);

  const earned: string[] = [];

  // ── 시작 ──
  if (totals.sessions >= 1) earned.push("first_step");

  // ── 세션 ──
  if (totals.sessions >= 10) earned.push("session_10");
  if (totals.sessions >= 50) earned.push("session_50");
  if (totals.sessions >= 100) earned.push("century");
  if (totals.sessions >= 500) earned.push("session_500");
  if (totals.sessions >= 1000) earned.push("session_1000");

  // ── 비용 ──
  if (totals.cost >= 1) earned.push("one_dollar");
  if (totals.cost >= 10) earned.push("ten_dollar");
  if (totals.cost >= 50) earned.push("fifty_dollar");
  if (totals.cost >= 100) earned.push("hundred_dollar");
  if (totals.cost >= 500) earned.push("five_hundred_dollar");
  if (totals.cost >= 1000) earned.push("thousand_dollar");

  // ── 스트릭 ──
  if (maxStreak >= 3) earned.push("streak_3");
  if (maxStreak >= 7) earned.push("week_warrior");
  if (maxStreak >= 14) earned.push("streak_14");
  if (maxStreak >= 21) earned.push("streak_21");
  if (maxStreak >= 30) earned.push("month_master");
  if (maxStreak >= 60) earned.push("streak_60");
  if (maxStreak >= 90) earned.push("streak_90");

  // ── 코드 ──
  if (totals.commits >= 1) earned.push("code_pusher");
  if (totals.commits >= 10) earned.push("commit_10");
  if (totals.commits >= 50) earned.push("commit_50");
  if (totals.commits >= 100) earned.push("commit_100");
  if (totals.prs >= 1) earned.push("pr_hero");
  if (totals.prs >= 10) earned.push("pr_10");

  // ── 특별 ──
  if (todayCost >= 5) earned.push("big_session");
  if (todayCost >= 20) earned.push("mega_session");
  if (todaySessions >= 10) earned.push("speed_demon");

  // hello_world, setup_done, skill_maker, early_bird, night_owl,
  // weekend_warrior, multi_model, top_3, top_10, first_compare,
  // camp_graduate, camp_day1 → 별도 트리거에서 지급 (자동 감지 불가)

  // 배지 upsert
  if (earned.length > 0) {
    const rows = earned.map((type) => ({
      user_id: userId,
      badge_type: type,
    }));

    await supabase
      .from("badges")
      .upsert(rows, { onConflict: "user_id,badge_type", ignoreDuplicates: true });
  }

  // max_streak 업데이트
  await supabase
    .from("users")
    .update({ max_streak: maxStreak })
    .eq("id", userId);
}
