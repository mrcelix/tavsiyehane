import { cn } from "@/lib/cn";

/**
 * Sıra nişanı: ilk üç madalya renginde, kalanı düz numara.
 *
 * Hero kartı ve sihirbazın sonuç paneli aynı listeyi gösteriyor; iki ayrı
 * nişan çizimi, aynı verinin iki farklı görünmesi demek olurdu.
 */
export function RankBadge({ rank }: { rank: number }) {
  const stil =
    rank === 1
      ? "bg-[var(--gold-soft)] text-[var(--gold-ink)]"
      : rank === 2
        ? "bg-[var(--mist-2)] text-[var(--ink-2)]"
        : rank === 3
          ? "bg-[color-mix(in_oklab,var(--gold)_16%,var(--mist))] text-[var(--gold-ink)]"
          : "text-[var(--muted-2)]";
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-num text-[11px] font-bold",
        stil
      )}
    >
      {rank}
    </span>
  );
}
