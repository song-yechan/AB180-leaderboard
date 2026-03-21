interface CohortBadgeProps {
  cohort: number | null;
  size?: "sm" | "md";
}

const STYLES = {
  sm: {
    base: "inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-medium",
    1: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
    2: "border border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  md: {
    base: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
    1: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
    2: "border border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
} as const;

export default function CohortBadge({ cohort, size = "md" }: CohortBadgeProps) {
  if (!cohort) return null;

  const style = STYLES[size];
  const colorClass = cohort === 1 ? style[1] : style[2];
  const label = cohort === 1 ? "1\uAE30" : "2\uAE30";

  return (
    <span className={`${style.base} ${colorClass}`}>
      {label}
    </span>
  );
}
