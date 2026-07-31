import type { PricePoint } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length < 2) return null;
  const w = 560;
  const h = 140;
  const pad = 8;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const y = (p: number) => h - pad - ((p - min) / span) * (h - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  const last = points[points.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Fiyat geçmişi grafiği">
        <path d={area} className="fill-[var(--brand)] opacity-10" />
        <path d={path} fill="none" strokeWidth={2.5} className="stroke-[var(--brand)]" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.price)}
            r={i === points.length - 1 ? 4 : 3}
            className={i === points.length - 1 ? "fill-[var(--gold)]" : "fill-[var(--brand)]"}
          >
            <title>{`${new Date(p.date).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" })}: ${formatPrice(p.price)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
        <span>
          Son 8 ay · En düşük: <span className="font-num font-bold text-[var(--up)]">{formatPrice(min)}</span>
        </span>
        <span>
          Güncel: <span className="font-num font-bold text-[var(--ink)]">{formatPrice(last.price)}</span>
        </span>
      </div>
    </div>
  );
}
