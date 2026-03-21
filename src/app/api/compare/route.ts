import { NextRequest, NextResponse } from "next/server";
import { BADGE_TYPES } from "@/lib/constants";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  if (!idA || !idB) {
    return NextResponse.json(
      { error: "Both 'a' and 'b' query params are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServiceSupabase();

    const [{ data: userA, error: errA }, { data: userB, error: errB }] = await Promise.all([
      supabase.from("users").select("id, name, avatar_url, role, department, cohort").eq("id", idA).single(),
      supabase.from("users").select("id, name, avatar_url, role, department, cohort").eq("id", idB).single(),
    ]);

    if (errA || errB || !userA || !userB) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [{ data: dailyA }, { data: dailyB }, { data: earnedA }, { data: earnedB }] =
      await Promise.all([
        supabase.from("usage_logs").select("date, total_cost, sessions_count").eq("user_id", idA).order("date", { ascending: true }),
        supabase.from("usage_logs").select("date, total_cost, sessions_count").eq("user_id", idB).order("date", { ascending: true }),
        supabase.from("badges").select("*").eq("user_id", idA),
        supabase.from("badges").select("*").eq("user_id", idB),
      ]);

    return NextResponse.json({
      userA,
      userB,
      dailyA: (dailyA ?? []).map((d) => ({ date: d.date, cost: Number(d.total_cost ?? 0), sessions: d.sessions_count ?? 0 })),
      dailyB: (dailyB ?? []).map((d) => ({ date: d.date, cost: Number(d.total_cost ?? 0), sessions: d.sessions_count ?? 0 })),
      badges: {
        all: BADGE_TYPES,
        earnedA: earnedA ?? [],
        earnedB: earnedB ?? [],
      },
    });
  } catch (err) {
    console.error("Failed to fetch compare data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
