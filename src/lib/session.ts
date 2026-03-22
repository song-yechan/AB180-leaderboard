import crypto from "crypto";

const SECRET =
  process.env.SESSION_SECRET || "dev-secret-change-in-production";

export function signSession(userId: string): string {
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(userId)
    .digest("hex");
  return `${userId}.${sig}`;
}

export function verifySession(cookie: string): string | null {
  const dotIdx = cookie.indexOf(".");

  // 서명된 쿠키: userId.hmac
  if (dotIdx !== -1) {
    const userId = cookie.substring(0, dotIdx);
    const sig = cookie.substring(dotIdx + 1);
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(userId)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
        ? userId
        : null;
    } catch {
      return null;
    }
  }

  // 미서명 레거시 쿠키 (UUID 형식): 마이그레이션 기간 허용
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cookie)) {
    return cookie;
  }

  return null;
}
