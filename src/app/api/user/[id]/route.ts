import { NextResponse } from "next/server";
import { BADGE_TYPES } from "@/lib/constants";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createServiceSupabase();

    // 유저 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, avatar_url, role, department, cohort, max_streak")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // usage_logs에서 일별 사용량 집계 (daily_usage 대신)
    const { data: dailyUsage } = await supabase
      .from("usage_logs")
      .select("date, total_cost, sessions_count, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens, commits, pull_requests")
      .eq("user_id", id)
      .order("date", { ascending: true });

    // 뱃지 조회
    const { data: earnedBadges } = await supabase
      .from("badges")
      .select("*")
      .eq("user_id", id);

    // usage_logs에서 streak 계산
    const dates = (dailyUsage ?? []).map((d) => d.date).sort();
    let currentStreak = 0;
    let maxStreak = user.max_streak ?? 0;

    if (dates.length > 0) {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
      const dateSet = new Set(dates);

      // 오늘 또는 어제부터 연속 날짜 세기
      let checkDate = dateSet.has(today) ? today : (dateSet.has(yesterday) ? yesterday : null);
      if (checkDate) {
        let d = new Date(checkDate);
        while (dateSet.has(d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }))) {
          currentStreak++;
          d = new Date(d.getTime() - 86400000);
        }
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    // 총합 계산
    const totals = (dailyUsage ?? []).reduce(
      (acc, d) => ({
        total_cost: acc.total_cost + Number(d.total_cost ?? 0),
        sessions_count: acc.sessions_count + (d.sessions_count ?? 0),
        input_tokens: acc.input_tokens + (d.input_tokens ?? 0),
        output_tokens: acc.output_tokens + (d.output_tokens ?? 0),
        cache_creation_tokens: acc.cache_creation_tokens + (d.cache_creation_tokens ?? 0),
        cache_read_tokens: acc.cache_read_tokens + (d.cache_read_tokens ?? 0),
        commits: acc.commits + (d.commits ?? 0),
        pull_requests: acc.pull_requests + (d.pull_requests ?? 0),
      }),
      { total_cost: 0, sessions_count: 0, input_tokens: 0, output_tokens: 0, cache_creation_tokens: 0, cache_read_tokens: 0, commits: 0, pull_requests: 0 }
    );

    return NextResponse.json({
      user: {
        user_id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        department: user.department,
        cohort: user.cohort,
        current_streak: currentStreak,
        longest_streak: maxStreak,
        ...totals,
      },
      dailyUsage: (dailyUsage ?? []).map((d) => ({
        date: d.date,
        cost: Number(d.total_cost ?? 0),
        sessions: d.sessions_count ?? 0,
      })),
      streakData: (dailyUsage ?? []).map((d) => ({
        date: d.date,
        cost: Number(d.total_cost ?? 0),
        sessions: d.sessions_count ?? 0,
      })),
      badges: {
        all: BADGE_TYPES,
        earned: earnedBadges ?? [],
      },
    });
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
