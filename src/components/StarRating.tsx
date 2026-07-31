import { Star } from "lucide-react";

export function StarRating({ value, count, small = false }: { value: number; count?: number; small?: boolean }) {
  const full = Math.round(value);
  const px = small ? 12 : 14;
  return (
    <span className={`inline-flex items-center gap-1 ${small ? "text-xs" : "text-sm"}`}>
      <span className="flex items-center gap-px" aria-label={`${value} / 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={px}
            className={n <= full ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--line)]"}
          />
        ))}
      </span>
      <span className="font-num font-semibold text-[var(--ink-2)]">{value ? value.toFixed(1) : "—"}</span>
      {count !== undefined && <span className="font-num text-[var(--muted-2)]">({count})</span>}
    </span>
  );
}
