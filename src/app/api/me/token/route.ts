import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("api_token")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ api_token: data.api_token });
}
