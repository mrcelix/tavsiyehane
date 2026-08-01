import { EDITOR_MODELS, SCORE_MODELS } from "@/lib/scoring";
import type { Item } from "@/lib/types";

function barColor(v: number): string {
  if (v >= 85) return "bg-[var(--up)]";
  if (v >= 70) return "bg-[var(--brand)]";
  if (v >= 55) return "bg-[var(--gold)]";
  return "bg-[var(--down)]";
}

export function BreakdownBars({ item }: { item: Item }) {
  // Kırılım puanın dayanağını izler: topluluk puanında sinyaller, editör
  // puanında editör kriterleri gösterilir. İkisini karıştırmak, verilmemiş bir
  // notu verilmiş gibi göstermek olur.
  const model = item.scoreBasis === "topluluk" ? SCORE_MODELS[item.type] : EDITOR_MODELS[item.type];
  return (
    <div className="space-y-3">
      {model.map((c) => {
        const v = item.scoreBreakdown[c.key];
        // Değerlendirilmemiş kriter boş geçilir; 50 yazmak "ortalama not verdik" demektir.
        if (typeof v !== "number") return null;
        return (
          <div key={c.key} title={c.hint}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-[var(--ink-2)]">
                {c.label}
                <span className="ml-1.5 font-num text-[11px] text-[var(--muted-2)]">%{Math.round(c.weight * 100)}</span>
              </span>
              <span className="font-num font-bold text-[var(--ink)]">{v}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--mist-2)]">
              <div className={`h-full rounded-full ${barColor(v)}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
