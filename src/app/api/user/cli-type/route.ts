import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createServiceSupabase } from "@/lib/supabase/server";

const VALID_CLI_TYPES = ["claude", "codex", "both"] as const;
type CliType = (typeof VALID_CLI_TYPES)[number];

function isValidCliType(value: unknown): value is CliType {
  return typeof value === "string" && VALID_CLI_TYPES.includes(value as CliType);
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { cli_type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidCliType(body.cli_type)) {
    return NextResponse.json(
      { error: "Invalid cli_type. Must be one of: claude, codex, both" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServiceSupabase();

    const { error } = await supabase
      .from("users")
      .update({ cli_type: body.cli_type })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update cli_type:", error);
      return NextResponse.json(
        { error: "Failed to update" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, cli_type: body.cli_type });
  } catch (err) {
    console.error("POST /api/user/cli-type failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
