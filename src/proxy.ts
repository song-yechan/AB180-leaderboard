import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 개발 모드: 인증 스킵
  if (process.env.NODE_ENV === "development") {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
