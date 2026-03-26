export function formatNumber(n: number, suffix = ""): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B${suffix}`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M${suffix}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K${suffix}`;
  return `${n}${suffix}`;
}
