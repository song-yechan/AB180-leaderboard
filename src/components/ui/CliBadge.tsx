interface CliBadgeProps {
  cliType: string | null | undefined;
  size?: "sm" | "md";
}

const STYLES = {
  sm: {
    base: "inline-flex items-center rounded text-[9px] font-semibold px-1.5 py-0.5",
    claude: "bg-purple-500/10 text-purple-400",
    codex: "bg-emerald-500/10 text-emerald-400",
    both: "bg-blue-500/10 text-blue-400",
  },
  md: {
    base: "inline-flex items-center rounded text-[10px] font-semibold px-2 py-0.5",
    claude: "bg-purple-500/10 text-purple-400",
    codex: "bg-emerald-500/10 text-emerald-400",
    both: "bg-blue-500/10 text-blue-400",
  },
} as const;

const LABELS: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  both: "Both",
};

export default function CliBadge({ cliType, size = "md" }: CliBadgeProps) {
  if (!cliType) return null;

  const normalized = cliType.toLowerCase();
  if (!(normalized in LABELS)) return null;

  const style = STYLES[size];
  const colorClass = style[normalized as keyof Omit<typeof style, "base">];

  return (
    <span className={`${style.base} ${colorClass}`}>
      {LABELS[normalized]}
    </span>
  );
}
