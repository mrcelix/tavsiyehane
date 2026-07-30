import { SCORE_MODELS } from "@/lib/scoring";
import type { Item } from "@/lib/types";

export function BreakdownBars({ item }: { item: Item }) {
  const model = SCORE_MODELS[item.type];
  return (
    <div className="space-y-2.5">
      {model.map((c) => {
        const v = item.scoreBreakdown[c.key] ?? 50;
        return (
          <div key={c.key} title={c.hint}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-300">
                {c.label}
                <span className="ml-1.5 text-xs text-zinc-400">%{Math.round(c.weight * 100)}</span>
              </span>
              <span className="font-semibold tabular-nums">{v}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${v >= 85 ? "bg-emerald-500" : v >= 70 ? "bg-lime-500" : v >= 55 ? "bg-amber-500" : "bg-rose-500"}`}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
