interface CliBadgeProps {
  cliType: string | null | undefined;
  size?: "sm" | "md";
}

const SIZE_CLASS = {
  sm: "inline-flex items-center rounded text-[9px] font-semibold px-1.5 py-0.5",
  md: "inline-flex items-center rounded text-[10px] font-semibold px-2 py-0.5",
} as const;

const CLI_STYLES = {
  claude: { label: "Claude", color: "bg-purple-500/10 text-purple-400" },
  codex: { label: "Codex", color: "bg-emerald-500/10 text-emerald-400" },
} as const;

function SingleBadge({ type, size }: { type: "claude" | "codex"; size: "sm" | "md" }) {
  const s = CLI_STYLES[type];
  return <span className={`${SIZE_CLASS[size]} ${s.color}`}>{s.label}</span>;
}

export default function CliBadge({ cliType, size = "md" }: CliBadgeProps) {
  if (!cliType) return null;

  const normalized = cliType.toLowerCase();

  if (normalized === "both") {
    return (
      <span className="inline-flex items-center gap-1">
        <SingleBadge type="claude" size={size} />
        <SingleBadge type="codex" size={size} />
      </span>
    );
  }

  if (normalized === "claude" || normalized === "codex") {
    return <SingleBadge type={normalized} size={size} />;
  }

  return null;
}
