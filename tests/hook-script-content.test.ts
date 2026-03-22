import { describe, it, expect } from "vitest";

describe("hook script content", () => {
  let script: string;

  async function getScript() {
    if (!script) {
      const { GET } = await import("@/app/api/hook-script/route");
      script = await (await GET()).text();
    }
    return script;
  }

  it("contains pricing table for all models", async () => {
    const s = await getScript();
    expect(s).toContain("claude-opus-4-6");
    expect(s).toContain("claude-sonnet-4-6");
    expect(s).toContain("claude-haiku-4-5");
  });

  it("contains 5-second hard timeout", async () => {
    const s = await getScript();
    expect(s).toContain("5000");
    expect(s).toContain("HARD_TIMEOUT");
  });

  it("uses ai-camp config directory", async () => {
    const s = await getScript();
    expect(s).toContain("ai-camp");
  });

  it("uses git log for commit counting", async () => {
    const s = await getScript();
    expect(s).toContain("git log");
    expect(s).toContain("execSync");
  });

  it("contains session cache for delta calculation", async () => {
    const s = await getScript();
    expect(s).toContain("session-cache.json");
  });

  it("uses Asia/Seoul timezone", async () => {
    const s = await getScript();
    expect(s).toContain("Asia/Seoul");
  });

  it("posts to /api/usage/submit", async () => {
    const s = await getScript();
    expect(s).toContain("/api/usage/submit");
  });

  it("contains self-update mechanism", async () => {
    const s = await getScript();
    expect(s).toContain("selfUpdate");
  });
});
