"use client";

import { getCategoryById } from "@/lib/job-categories";

export type Category = "all" | "camp" | "non-dev" | "dev";
export type Period = "today" | "week" | "all";

export const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: "all", label: "\uC804\uCCB4" },
  { key: "camp", label: "\uCEA0\uD504" },
  { key: "non-dev", label: "\uBE44\uAC1C\uBC1C\uC790" },
  { key: "dev", label: "\uAC1C\uBC1C\uC790" },
];

export const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "today", label: "\uC624\uB298" },
  { key: "week", label: "\uC774\uBC88 \uC8FC" },
  { key: "all", label: "\uC804\uCCB4" },
];

export interface LeaderboardFiltersProps {
  category: Category;
  period: Period;
  department: string;
  showDeptFilter: boolean;
  deptOptions: string[];
  onCategoryChange: (category: Category) => void;
  onPeriodChange: (period: Period) => void;
  onDepartmentChange: (dept: string) => void;
}

export default function LeaderboardFilters({
  category,
  period,
  department,
  showDeptFilter,
  deptOptions,
  onCategoryChange,
  onPeriodChange,
  onDepartmentChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Top row: category tabs + period pills */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-0.5 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onCategoryChange(tab.key)}
              className={`tab-underline cursor-pointer whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                category === tab.key
                  ? "tab-underline-active text-camp-accent"
                  : "text-camp-text-secondary hover:text-camp-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 gap-1 rounded-lg bg-camp-surface p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onPeriodChange(tab.key)}
              className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                period === tab.key
                  ? "bg-camp-surface-hover text-camp-text shadow-sm"
                  : "text-camp-text-secondary hover:text-camp-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Department sub-filter (separate row) */}
      {showDeptFilter && (
        <div className="flex gap-1 overflow-x-auto">
          {deptOptions.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => onDepartmentChange(dept)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                department === dept
                  ? "bg-camp-accent/15 text-camp-accent"
                  : "text-camp-text-muted hover:text-camp-text-secondary"
              }`}
            >
              {dept === "\uC804\uCCB4" ? "\uC804\uCCB4" : (getCategoryById(dept)?.label ?? dept)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
