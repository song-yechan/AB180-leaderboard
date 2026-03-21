import { NextResponse } from "next/server";
import { BADGE_TYPES } from "@/lib/constants";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try Supabase first
  try {
    const supabase = await createServiceSupabase();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (user) {
      const { data: dailyUsage } = await supabase
        .from("daily_usage")
        .select("*")
        .eq("user_id", id)
        .order("date", { ascending: true });

      const { data: streakData } = await supabase
        .from("streak_data")
        .select("*")
        .eq("user_id", id)
        .order("date", { ascending: true });

      const { data: earnedBadges } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", id);

      return NextResponse.json({
        user,
        dailyUsage: dailyUsage ?? [],
        streakData: streakData ?? [],
        badges: {
          all: BADGE_TYPES,
          earned: earnedBadges ?? [],
        },
      });
    }
  } catch (err) {
    console.error("Failed to fetch user from Supabase:", err);
  }

  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
