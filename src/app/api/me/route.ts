import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { verifySession, isLegacyCookie, signSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ai-camp-session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  const sessionId = verifySession(sessionCookie);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 401 },
    );
  }

  try {
    const supabase = await createServiceSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, avatar_url, role, department, cohort, setup_completed, cli_type")
      .eq("id", sessionId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 },
      );
    }

    // Auto-upgrade legacy cookies
    if (isLegacyCookie(sessionCookie)) {
      const response = NextResponse.json(user);
      response.cookies.set("ai-camp-session", signSession(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("GET /api/me failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
