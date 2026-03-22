"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCategoriesByGroup,
  type JobCategoryId,
} from "@/lib/job-categories";
import SetupGuide from "@/components/SetupGuide";

const DEV_CATEGORIES = getCategoriesByGroup("developer");
const NON_DEV_CATEGORIES = getCategoriesByGroup("non-developer");

function SetupStep({ onComplete }: { onComplete: () => void }) {
  const [setupDone, setSetupDone] = useState(false);

  const checkSetup = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (data.setup_completed) {
        setSetupDone(true);
      }
    } catch {}
  }, []);

  // 3초마다 setup_completed 폴링
  useEffect(() => {
    checkSetup();
    const interval = setInterval(checkSetup, 3000);
    return () => clearInterval(interval);
  }, [checkSetup]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <h1 className="text-2xl font-bold text-camp-text">
          {setupDone ? "설정 완료!" : "CLI 설정을 진행하세요"}
        </h1>
        <p className="text-center text-sm text-camp-text-secondary">
          {setupDone
            ? "사용량 추적이 시작됩니다. 리더보드로 이동하세요."
            : "아래 명령어를 터미널에 붙여넣기하면 자동으로 다음 단계로 넘어갑니다."}
        </p>

        {!setupDone && (
          <div className="w-full">
            <SetupGuide />
          </div>
        )}

        {setupDone && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🎉</span>
            <span className="text-sm text-camp-accent">설정이 감지되었습니다</span>
          </div>
        )}

        <button
          type="button"
          onClick={onComplete}
          disabled={!setupDone}
          className={`w-full max-w-xs rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
            setupDone
              ? "cursor-pointer bg-camp-accent text-black hover:bg-camp-accent-hover"
              : "cursor-not-allowed bg-camp-surface text-camp-text-muted"
          }`}
        >
          {setupDone ? "리더보드로 이동" : "터미널에서 설정을 완료해주세요"}
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<JobCategoryId | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [googleName, setGoogleName] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (me?.name) {
          setGoogleName(me.name);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!selected) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: selected,
          ...(displayName.trim() ? { name: displayName.trim() } : {}),
        }),
      });

      if (res.ok) {
        setCompleted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return <SetupStep onComplete={() => router.push("/")} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <h1 className="text-2xl font-bold text-camp-text">
          어떤 직군이신가요?
        </h1>
        <p className="text-center text-sm text-camp-text-secondary">
          AI Camp 경험을 맞춤 설정하기 위해 알려주세요.
          <br />
          나중에 변경할 수 있습니다.
        </p>

        {/* Display name */}
        <div className="flex w-full flex-col gap-2">
          <label htmlFor="display-name" className="text-xs font-medium uppercase tracking-wider text-camp-text-secondary">
            표시 이름
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={googleName || "이름을 입력해주세요"}
            disabled={loading}
            className="glass w-full rounded-xl border border-camp-border bg-camp-surface px-4 py-3 text-sm text-camp-text placeholder:text-camp-text-muted focus:border-camp-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-[10px] text-camp-text-muted">
            비워두면 Google 계정 이름이 사용됩니다.
          </span>
        </div>

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
                disabled={loading}
                onClick={() => setSelected(cat.id)}
                className={`glass flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected === cat.id
                    ? "border-2 border-amber-500 text-camp-accent"
                    : "border border-camp-border text-camp-text hover:bg-camp-surface-hover"
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
                disabled={loading}
                onClick={() => setSelected(cat.id)}
                className={`glass flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected === cat.id
                    ? "border-2 border-amber-500 text-camp-accent"
                    : "border border-camp-border text-camp-text hover:bg-camp-surface-hover"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Validation message */}
        {showValidation && !selected && (
          <p className="text-sm text-red-400">
            직군을 선택해주세요.
          </p>
        )}

        {/* Submit button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full max-w-xs cursor-pointer rounded-xl bg-camp-accent px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-camp-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "저장 중..." : "시작하기"}
        </button>
      </div>
    </div>
  );
}
