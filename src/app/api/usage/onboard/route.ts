import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

type CliType = "claude" | "codex" | "both";

function mergeCliType(
  incoming: CliType,
  current: CliType | null | undefined
): CliType {
  if (!current) return incoming;
  if (current === "both") return "both";
  if (incoming === current) return current;
  // incoming and current are different non-'both' values → set to 'both'
  return "both";
}

export async function POST(request: NextRequest) {
  // 1. Extract Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }
  const token = authHeader.slice(7);

  // Parse optional cli_type from body; default to 'claude' if missing or unparseable
  let incomingCliType: CliType = "claude";
  try {
    const body = await request.json();
    if (body?.cli_type === "codex" || body?.cli_type === "both") {
      incomingCliType = body.cli_type as CliType;
    }
  } catch {
    // Empty body or non-JSON — use default 'claude'
  }

  try {
    const supabase = await createServiceSupabase();

    // 2. Look up user by api_token (also fetch current cli_type for merge logic)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, cli_type")
      .eq("api_token", token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    // 3. Check if usage_logs row already exists for today
    const { data: existing, error: fetchError } = await supabase
      .from("usage_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // 4. Insert empty row only if none exists
    if (!existing) {
      const { error: insertError } = await supabase
        .from("usage_logs")
        .insert({
          user_id: userId,
          date: today,
          input_tokens: 0,
          output_tokens: 0,
          cache_creation_tokens: 0,
          cache_read_tokens: 0,
          total_cost: 0,
          sessions_count: 0,
        });

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to insert usage log" },
          { status: 500 }
        );
      }
    }

    // 5. Mark setup as completed and update cli_type with merge logic
    const mergedCliType = mergeCliType(
      incomingCliType,
      user.cli_type as CliType | null | undefined
    );
    await supabase
      .from("users")
      .update({ setup_completed: true, cli_type: mergedCliType })
      .eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
