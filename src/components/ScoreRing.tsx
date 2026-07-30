import { scoreTone } from "@/lib/scoring";

const TONE_COLOR: Record<string, string> = {
  great: "stroke-emerald-500",
  good: "stroke-lime-500",
  mid: "stroke-amber-500",
  low: "stroke-rose-500",
};

export function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Tavsiye puanı: ${score}/100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          className={TONE_COLOR[scoreTone(score)]}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-bold tabular-nums"
        style={{ fontSize: size * 0.32 }}
      >
        {score}
      </span>
    </div>
  );
}
