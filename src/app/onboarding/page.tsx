"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCategoriesByGroup,
  type JobCategoryId,
} from "@/lib/job-categories";
import SetupGuide from "@/components/SetupGuide";

const DEV_CATEGORIES = getCategoriesByGroup("developer");
const NON_DEV_CATEGORIES = getCategoriesByGroup("non-developer");

type CliType = "claude" | "codex" | "both";
type Step = "role" | "cli" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<JobCategoryId | null>(null);

  // CLI 설정 추적
  const [selectedCli, setSelectedCli] = useState<CliType>("claude");
  const [claudeDone, setClaudeDone] = useState(false);
  const [codexDone, setCodexDone] = useState(false);

  const isCliDone = useCallback(() => {
    switch (selectedCli) {
      case "claude": return claudeDone;
      case "codex": return codexDone;
      case "both": return claudeDone && codexDone;
    }
  }, [selectedCli, claudeDone, codexDone]);

  // 초기 상태 확인
  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.id) {
          router.replace("/auth");
          return;
        }
        // 이미 직군 선택 완료 + setup 완료면 done
        if (data.department && data.setup_completed) {
          setStep("done");
        } else if (data.department) {
          // 직군은 골랐지만 CLI 미설정
          setStep("cli");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // CLI 설정 폴링 (step === "cli"일 때만)
  useEffect(() => {
    if (step !== "cli") return;
    let interval: ReturnType<typeof setInterval>;

    function check() {
      fetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.id) return;
          const cliType: string | null = data.cli_type;
          const setupDone: boolean = data.setup_completed === true;
          if (setupDone) {
            setClaudeDone(cliType === "claude" || cliType === "both");
            setCodexDone(cliType === "codex" || cliType === "both");
          }
        })
        .catch(() => {});
    }

    check();
    interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [step]);

  // CLI 모두 완료 시 done
  useEffect(() => {
    if (step === "cli" && isCliDone()) {
      setStep("done");
    }
  }, [step, isCliDone]);

  // 직군 선택 제출
  async function handleRoleSubmit() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: selected }),
      });
      if (res.ok) {
        setStep("cli");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-camp-accent" />
          <span className="text-sm text-camp-text-secondary">불러오는 중...</span>
        </div>
      </div>
    );
  }

  // Step 3: 완료
  if (step === "done") {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-camp-text mb-2">설정 완료!</h1>
        <p className="text-sm text-camp-text-secondary mb-8">
          사용량 추적이 시작됩니다. 리더보드로 이동하세요.
        </p>
        <button
          onClick={() => router.replace("/")}
          className="w-full cursor-pointer rounded-xl bg-camp-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-camp-accent-hover"
        >
          리더보드로 이동
        </button>
      </div>
    );
  }

  // Step 1: 직군 선택
  if (step === "role") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-camp-text-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camp-accent text-[10px] font-bold text-black">1</span>
            <span className="text-camp-text-secondary">직군 선택</span>
            <span className="mx-1 h-px w-6 bg-camp-border" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camp-surface text-[10px] font-bold text-camp-text-muted">2</span>
            <span>CLI 설정</span>
          </div>

          <h1 className="text-2xl font-bold text-camp-text">어떤 직군이신가요?</h1>
          <p className="text-center text-sm text-camp-text-secondary">
            AI Camp 경험을 맞춤 설정하기 위해 알려주세요.
            <br />
            나중에 변경할 수 있습니다.
          </p>

          {/* Developer group */}
          <div className="flex w-full flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-camp-text-secondary">
              개발
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={saving}
                  onClick={() => setSelected(cat.id)}
                  className={`glass flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected === cat.id
                      ? "border-2 border-amber-500 text-camp-accent"
                      : "border border-transparent text-camp-text hover:bg-white/[0.08]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Non-developer group */}
          <div className="flex w-full flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-camp-text-secondary">
              비즈니스
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NON_DEV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={saving}
                  onClick={() => setSelected(cat.id)}
                  className={`glass flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected === cat.id
                      ? "border-2 border-amber-500 text-camp-accent"
                      : "border border-transparent text-camp-text hover:bg-white/[0.08]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={saving || !selected}
            onClick={handleRoleSubmit}
            className="w-full max-w-xs cursor-pointer rounded-xl bg-camp-accent px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-camp-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "저장 중..." : "다음"}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: CLI 설정
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 text-xs text-camp-text-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black">✓</span>
        <span className="text-green-400">직군 선택</span>
        <span className="mx-1 h-px w-6 bg-camp-border" />
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camp-accent text-[10px] font-bold text-black">2</span>
        <span className="text-camp-text-secondary">CLI 설정</span>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-camp-text">CLI 설정</h1>
        <p className="mt-2 text-sm text-camp-text-secondary">
          사용하는 AI 코딩 도구를 선택하고, 터미널에서 설정을 완료하세요.
        </p>
      </div>
      <SetupGuide onCliTypeChange={setSelectedCli} />

      {/* "둘 다" 선택 시 진행 상태 표시 */}
      {selectedCli === "both" && (claudeDone || codexDone) && (
        <div className="mt-4 flex items-center justify-center gap-4 rounded-xl border border-camp-border bg-camp-surface p-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${claudeDone ? "bg-green-500" : "bg-camp-text-muted"}`} />
            <span className={`text-xs ${claudeDone ? "text-green-400" : "text-camp-text-muted"}`}>
              Claude Code {claudeDone ? "완료" : "대기 중"}
            </span>
          </div>
          <span className="h-3 w-px bg-camp-border" />
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${codexDone ? "bg-green-500" : "bg-camp-text-muted"}`} />
            <span className={`text-xs ${codexDone ? "text-green-400" : "text-camp-text-muted"}`}>
              Codex {codexDone ? "완료" : "대기 중"}
            </span>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-camp-text-muted">
        터미널에서 명령어를 실행하면 이 페이지가 자동으로 업데이트됩니다.
      </p>
    </div>
  );
}
