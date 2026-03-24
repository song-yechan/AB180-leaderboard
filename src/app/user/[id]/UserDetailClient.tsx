"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserProfile from "@/components/UserProfile";
import UsageChart from "@/components/UsageChart";
import StreakHeatmap from "@/components/StreakHeatmap";
import BadgeGrid from "@/components/BadgeGrid";
import { BADGE_TYPES } from "@/lib/constants";
import type { UserData, FallbackDailyUsage, FallbackStreakEntry, FallbackEarnedBadge } from "@/lib/types";

interface Badge {
  type: string;
  icon: string;
  label: string;
  description: string;
}

type CliType = "claude" | "codex" | "both";

const CLI_OPTIONS: { value: CliType; label: string }[] = [
  { value: "claude", label: "Claude Code" },
  { value: "codex", label: "Codex" },
  { value: "both", label: "둘 다" },
];

export default function UserDetailClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [dailyUsage, setDailyUsage] = useState<FallbackDailyUsage[]>([]);
  const [streakData, setStreakData] = useState<FallbackStreakEntry[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([...BADGE_TYPES]);
  const [earnedBadges, setEarnedBadges] = useState<FallbackEarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [cliType, setCliType] = useState<CliType>("claude");
  const [cliSaving, setCliSaving] = useState(false);
  const [cliSaved, setCliSaved] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch user data and current session in parallel
        const [res, meRes] = await Promise.all([
          fetch(`/api/user/${userId}`),
          fetch("/api/me"),
        ]);

        if (res.status === 401) {
          setNeedsLogin(true);
          return;
        }

        if (res.ok) {
          const json = await res.json();
          setUser(json.user);
          setDailyUsage(json.dailyUsage);
          setStreakData(json.streakData);
          setAllBadges(json.badges.all);
          setEarnedBadges(json.badges.earned);

          // Check if this is the current user's own profile
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.id === userId) {
              setIsOwnProfile(true);
              setCliType((json.user.cli_type as CliType) ?? "claude");
            }
          }
        } else {
          throw new Error("API failed");
        }
      } catch {
        // Error — user stays null, "not found" UI will show
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 w-24 rounded bg-camp-surface" />

        {/* Profile skeleton */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-camp-surface" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-32 rounded bg-camp-surface" />
              <div className="h-3 w-48 rounded bg-camp-surface" />
            </div>
          </div>
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass flex flex-col items-center gap-2 rounded-xl px-4 py-4">
              <div className="h-5 w-5 rounded bg-camp-surface" />
              <div className="h-3 w-12 rounded bg-camp-surface" />
              <div className="h-5 w-16 rounded bg-camp-surface" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="glass rounded-xl p-4">
          <div className="h-4 w-24 rounded bg-camp-surface mb-4" />
          <div className="h-48 rounded bg-camp-surface" />
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <span className="text-4xl">🔒</span>
        <span className="text-lg font-semibold text-camp-text">로그인이 필요합니다</span>
        <span className="text-sm text-camp-text-secondary">프로필을 보려면 먼저 로그인해주세요.</span>
        <Link
          href="/auth"
          className="rounded-lg bg-camp-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-camp-accent-hover"
        >
          로그인
        </Link>
      </div>
    );
  }

  async function handleCliTypeChange(newType: CliType) {
    setCliSaving(true);
    setCliSaved(false);
    try {
      const res = await fetch("/api/user/cli-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cli_type: newType }),
      });
      if (res.ok) {
        setCliType(newType);
        setCliSaved(true);
        setTimeout(() => setCliSaved(false), 2000);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setCliSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <span className="text-2xl">404</span>
        <span className="text-sm text-camp-text-secondary">사용자를 찾을 수 없습니다</span>
        <Link
          href="/"
          className="text-sm text-camp-accent hover:underline"
        >
          리더보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-rise">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-camp-text-secondary transition-colors hover:text-camp-accent"
      >
        &larr; 리더보드
      </Link>

      {/* Profile + stats */}
      <UserProfile user={user} allBadges={allBadges} earnedBadges={earnedBadges} />

      {/* Usage chart */}
      <UsageChart dailyUsage={dailyUsage} />

      {/* Streak heatmap */}
      <StreakHeatmap dailyUsage={streakData} />

      {/* Badge grid */}
      <BadgeGrid allBadges={allBadges} earnedBadges={earnedBadges} />

      {/* CLI settings — only visible on own profile */}
      {isOwnProfile && (
        <div className="glass flex flex-col gap-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-camp-text">CLI 설정</h2>
            {cliSaved && (
              <span className="text-xs font-medium text-green-400 animate-fade-rise">
                저장됨
              </span>
            )}
          </div>
          <p className="text-xs text-camp-text-secondary">
            사용 중인 CLI를 선택하세요. 리더보드에 아이콘으로 표시됩니다.
          </p>
          <div className="flex gap-2">
            {CLI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={cliSaving}
                onClick={() => handleCliTypeChange(opt.value)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  cliType === opt.value
                    ? "bg-camp-accent text-black"
                    : "bg-camp-surface text-camp-text-secondary hover:bg-camp-surface-hover hover:text-camp-text"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
