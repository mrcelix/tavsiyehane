import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { PuanGecmisi } from "@/lib/score-history";

/**
 * Puan Günlüğü grafiği.
 *
 * Fiyat geçmişi grafiğiyle aynı dilde çizilir (satır içi SVG, ağ isteği yok).
 * Grafiğin altındaki cümle asıl mesele: puanın NEDEN değiştiğini söyler.
 */
export function ScoreHistory({ gecmis }: { gecmis: PuanGecmisi }) {
  const { noktalar, fark, baskinBilesen } = gecmis;
  const w = 560;
  const h = 120;
  const pad = 10;
  const puanlar = noktalar.map((n) => n.puan);
  const min = Math.min(...puanlar);
  const max = Math.max(...puanlar);
  // Düz çizgi durumunda (puan hiç değişmemiş) sıfıra bölmemek için taban 1.
  const aralik = max - min || 1;
  const x = (i: number) => pad + (i / (noktalar.length - 1)) * (w - pad * 2);
  const y = (p: number) => h - pad - ((p - min) / aralik) * (h - pad * 2);
  const cizgi = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(n.puan).toFixed(1)}`).join(" ");
  const alan = `${cizgi} L${x(noktalar.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;

  const Ikon = fark > 0 ? TrendingUp : fark < 0 ? TrendingDown : Minus;
  const renk = fark > 0 ? "text-[var(--up)]" : fark < 0 ? "text-[var(--down)]" : "text-[var(--muted)]";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`flex items-center gap-1.5 text-sm font-bold ${renk}`}>
          <Ikon size={16} />
          {fark > 0 ? `+${fark} puan` : fark < 0 ? `${fark} puan` : "Puan değişmedi"}
          <span className="font-normal text-[var(--muted)]">
            · {formatDate(noktalar[0].tarih)} — {formatDate(noktalar[noktalar.length - 1].tarih)}
          </span>
        </p>
        <p className="font-num text-[12px] text-[var(--muted-2)]">{noktalar.length} ölçüm</p>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img" aria-label="Puan geçmişi grafiği">
        <path d={alan} className="fill-[var(--brand)] opacity-10" />
        <path d={cizgi} fill="none" strokeWidth={2.5} className="stroke-[var(--brand)]" strokeLinecap="round" />
        {noktalar.map((n, i) => (
          <circle
            key={n.tarih}
            cx={x(i)}
            cy={y(n.puan)}
            r={i === noktalar.length - 1 ? 4 : 2.5}
            className={i === noktalar.length - 1 ? "fill-[var(--gold)]" : "fill-[var(--brand)]"}
          >
            <title>{`${formatDate(n.tarih)}: ${n.puan} puan`}</title>
          </circle>
        ))}
      </svg>

      {/* Puanın NEDEN değiştiği. Bu cümle olmadan grafik yalnızca bir çizgi. */}
      {baskinBilesen && fark !== 0 && (
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          En çok oynayan bileşen:{" "}
          <strong className="text-[var(--ink-2)]">{baskinBilesen.etiket}</strong>{" "}
          <span className={baskinBilesen.fark > 0 ? "text-[var(--up)]" : "text-[var(--down)]"}>
            ({baskinBilesen.fark > 0 ? "+" : ""}
            {baskinBilesen.fark})
          </span>
          .
        </p>
      )}
      <p className="mt-1 text-[12px] text-[var(--muted-2)]">
        Puan her gün yeniden hesaplanır; grafik günlük anlık görüntülerden çizilir.
      </p>
    </div>
  );
}
