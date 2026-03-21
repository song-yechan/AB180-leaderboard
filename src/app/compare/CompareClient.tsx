"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CompareBar from "@/components/CompareBar";
import CompareChart from "@/components/CompareChart";
import { Avatar, CohortBadge } from "@/components/UserProfile";
import { BADGE_TYPES } from "@/lib/constants";
import type { FallbackDailyUsage, FallbackEarnedBadge } from "@/lib/fallback-data";

interface UserData {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  cohort?: number | null;
  total_cost: number;
  sessions_count: number;
  commits?: number;
  current_streak: number;
  longest_streak: number;
}

interface Badge {
  type: string;
  icon: string;
  label: string;
  description: string;
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const [userA, setUserA] = useState<UserData | null>(null);
  const [userB, setUserB] = useState<UserData | null>(null);
  const [dailyA, setDailyA] = useState<FallbackDailyUsage[]>([]);
  const [dailyB, setDailyB] = useState<FallbackDailyUsage[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([...BADGE_TYPES]);
  const [earnedA, setEarnedA] = useState<FallbackEarnedBadge[]>([]);
  const [earnedB, setEarnedB] = useState<FallbackEarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idA || !idB) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/compare?a=${idA}&b=${idB}`);
        if (res.ok) {
          const json = await res.json();
          setUserA(json.userA);
          setUserB(json.userB);
          setDailyA(json.dailyA);
          setDailyB(json.dailyB);
          setAllBadges(json.badges.all);
          setEarnedA(json.badges.earnedA);
          setEarnedB(json.badges.earnedB);
        } else {
          throw new Error("API failed");
        }
      } catch {
        // Error — userA/userB stay null, "not found" UI will show
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [idA, idB]);

  if (!idA || !idB) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <span className="text-sm text-camp-text-secondary">
          비교할 두 사용자를 선택해주세요
        </span>
        <Link href="/" className="text-sm text-camp-accent hover:underline">
          리더보드에서 선택하기
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-camp-accent" />
          <span className="text-sm text-camp-text-secondary">불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!userA || !userB) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <span className="text-2xl">404</span>
        <span className="text-sm text-camp-text-secondary">
          사용자를 찾을 수 없습니다
        </span>
        <Link href="/" className="text-sm text-camp-accent hover:underline">
          리더보드로 돌아가기
        </Link>
      </div>
    );
  }

  const earnedSetA = new Set(earnedA.map((b) => b.badge_type));
  const earnedSetB = new Set(earnedB.map((b) => b.badge_type));

  return (
    <div className="flex flex-col gap-8 animate-fade-rise">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-camp-text-secondary transition-colors hover:text-camp-accent"
      >
        &larr; 리더보드
      </Link>

      {/* Two user headers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* User A */}
        <Link href={`/user/${userA.user_id}`} className="glass glass-hover flex items-center gap-4 rounded-2xl p-5 transition-all duration-200">
          <Avatar url={userA.avatar_url} name={userA.name} size={52} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-camp-text">{userA.name}</span>
              {userA.cohort && <CohortBadge cohort={userA.cohort} />}
            </div>
            <span className="text-xs text-camp-text-secondary">
              {"\uD83D\uDD25"} {userA.current_streak}일 연속
            </span>
          </div>
          <span className="ml-auto inline-block h-3 w-3 rounded-full bg-camp-accent/60" title="사용자 A" />
        </Link>

        {/* User B */}
        <Link href={`/user/${userB.user_id}`} className="glass glass-hover flex items-center gap-4 rounded-2xl p-5 transition-all duration-200">
          <Avatar url={userB.avatar_url} name={userB.name} size={52} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-camp-text">{userB.name}</span>
              {userB.cohort && <CohortBadge cohort={userB.cohort} />}
            </div>
            <span className="text-xs text-camp-text-secondary">
              {"\uD83D\uDD25"} {userB.current_streak}일 연속
            </span>
          </div>
          <span className="ml-auto inline-block h-3 w-3 rounded-full bg-camp-blue/60" title="사용자 B" />
        </Link>
      </div>

      {/* Compare bars */}
      <div className="glass flex flex-col gap-5 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-camp-text">스탯 비교</h2>
        <CompareBar
          label="비용"
          icon={"\uD83D\uDCB0"}
          valueA={userA.total_cost}
          valueB={userB.total_cost}
          nameA={userA.name}
          nameB={userB.name}
          format={(v) => `$${v.toFixed(2)}`}
        />
        <CompareBar
          label="세션"
          icon={"\uD83D\uDCCA"}
          valueA={userA.sessions_count}
          valueB={userB.sessions_count}
          nameA={userA.name}
          nameB={userB.name}
        />
        <CompareBar
          label="커밋"
          icon={"\u2328\uFE0F"}
          valueA={userA.commits ?? 0}
          valueB={userB.commits ?? 0}
          nameA={userA.name}
          nameB={userB.name}
        />
        <CompareBar
          label="스트릭"
          icon={"\uD83D\uDD25"}
          valueA={userA.current_streak}
          valueB={userB.current_streak}
          nameA={userA.name}
          nameB={userB.name}
          format={(v) => `${v}일`}
        />
      </div>

      {/* Overlay chart */}
      <CompareChart
        dailyA={dailyA}
        dailyB={dailyB}
        nameA={userA.name}
        nameB={userB.name}
      />

      {/* Badge comparison */}
      <div className="glass flex flex-col gap-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-camp-text">뱃지 비교</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {allBadges.map((badge) => {
            const hasA = earnedSetA.has(badge.type);
            const hasB = earnedSetB.has(badge.type);
            return (
              <div
                key={badge.type}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="flex-1 text-xs font-medium text-camp-text-secondary">
                  {badge.label}
                </span>
                {/* User A indicator */}
                <span
                  className={`h-5 w-5 rounded-full text-center text-[10px] font-bold leading-5 ${
                    hasA
                      ? "bg-camp-accent/20 text-camp-accent"
                      : "bg-white/[0.03] text-camp-text-muted"
                  }`}
                  title={`${userA.name}: ${hasA ? "획득" : "미획득"}`}
                >
                  A
                </span>
                <span
                  className={`h-5 w-5 rounded-full text-center text-[10px] font-bold leading-5 ${
                    hasB
                      ? "bg-camp-blue/20 text-camp-blue"
                      : "bg-white/[0.03] text-camp-text-muted"
                  }`}
                  title={`${userB.name}: ${hasB ? "획득" : "미획득"}`}
                >
                  B
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
