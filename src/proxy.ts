import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 명시적 인증 바이패스 (BYPASS_AUTH=true일 때만)
  if (process.env.BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  // 인증 필요: 유저 상세, 온보딩, 관리자 API, 내 정보 API
  const authRequired =
    pathname.startsWith("/user/") ||
    pathname.startsWith("/api/user/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/me" ||
    pathname === "/api/onboarding" ||
    pathname === "/api/progress";

  if (!authRequired) {
    return NextResponse.next();
  }

  const session = request.cookies.get("ai-camp-session");

  if (!session?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Basic format validation (full verification in API routes)
  const val = session.value;
  const hasDot = val.includes(".");
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      val,
    );
  if (!hasDot && !isUuid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
