"use client";

import { useEffect, useState } from "react";
import CountUp from "./CountUp";
import { formatNumber } from "@/lib/format";

interface StatsData {
  totalParticipants: number;
  totalCost: number;
  totalSessions: number;
}

export default function HeroStats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/usage?period=all&category=all");
        if (!res.ok) {
          setStats({ totalParticipants: 0, totalCost: 0, totalSessions: 0 });
          return;
        }
        const json = await res.json();
        const leaderboard = Array.isArray(json.leaderboard)
          ? json.leaderboard
          : [];

        setStats({
          totalParticipants: leaderboard.length,
          totalCost: leaderboard.reduce(
            (sum: number, e: { input_tokens?: number; output_tokens?: number; cache_read_tokens?: number; cache_creation_tokens?: number }) =>
              sum + (e.input_tokens ?? 0) + (e.output_tokens ?? 0) + (e.cache_read_tokens ?? 0) + (e.cache_creation_tokens ?? 0),
            0
          ),
          totalSessions: leaderboard.reduce(
            (sum: number, e: { sessions_count: number }) =>
              sum + e.sessions_count,
            0
          ),
        });
      } catch {
        setStats({ totalParticipants: 0, totalCost: 0, totalSessions: 0 });
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      label: "참여자",
      value: stats?.totalParticipants ?? 0,
      suffix: "명",
      prefix: "",
      decimals: 0,
    },
    {
      label: "총 토큰",
      value: stats?.totalCost ?? 0,
      suffix: "",
      prefix: "",
      decimals: 0,
      formatted: formatNumber(stats?.totalCost ?? 0),
    },
    {
      label: "총 세션",
      value: stats?.totalSessions ?? 0,
      suffix: "",
      prefix: "",
      decimals: 0,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:flex lg:flex-col lg:gap-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="glass glass-hover group flex flex-col gap-1 rounded-xl px-4 py-4 transition-all duration-300 sm:px-6 sm:py-5"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-camp-text-secondary">
            {item.label}
          </span>
          <span className="font-mono text-xl font-bold tabular-nums text-camp-text sm:text-2xl">
            {item.formatted ? (
              <>{item.formatted}</>
            ) : (
              <CountUp
                end={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                decimals={item.decimals}
                duration={800}
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
