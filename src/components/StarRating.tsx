export function StarRating({ value, count, small = false }: { value: number; count?: number; small?: boolean }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-1 ${small ? "text-xs" : "text-sm"}`}>
      <span className="leading-none tracking-tight text-amber-400" aria-label={`${value} / 5`}>
        {"★".repeat(full)}
        <span className="text-zinc-300 dark:text-zinc-600">{"★".repeat(5 - full)}</span>
      </span>
      <span className="font-medium tabular-nums">{value ? value.toFixed(1) : "—"}</span>
      {count !== undefined && <span className="text-zinc-400">({count})</span>}
    </span>
  );
}
