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

  // Try Supabase first
  try {
    const supabase = await createServiceSupabase();

    const [{ data: userA }, { data: userB }] = await Promise.all([
      supabase.from("users").select("*").eq("id", idA).single(),
      supabase.from("users").select("*").eq("id", idB).single(),
    ]);

    if (userA && userB) {
      const [{ data: dailyA }, { data: dailyB }, { data: earnedA }, { data: earnedB }] =
        await Promise.all([
          supabase.from("daily_usage").select("*").eq("user_id", idA).order("date", { ascending: true }),
          supabase.from("daily_usage").select("*").eq("user_id", idB).order("date", { ascending: true }),
          supabase.from("badges").select("*").eq("user_id", idA),
          supabase.from("badges").select("*").eq("user_id", idB),
        ]);

      return NextResponse.json({
        userA,
        userB,
        dailyA: dailyA ?? [],
        dailyB: dailyB ?? [],
        badges: {
          all: BADGE_TYPES,
          earnedA: earnedA ?? [],
          earnedB: earnedB ?? [],
        },
      });
    }
  } catch (err) {
    console.error("Failed to fetch compare data from Supabase:", err);
  }

  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
