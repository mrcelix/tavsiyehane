import { scoreTone } from "@/lib/scoring";

const TONE_STROKE: Record<string, string> = {
  great: "stroke-[var(--up)]",
  good: "stroke-[var(--brand)]",
  mid: "stroke-[var(--gold)]",
  low: "stroke-[var(--down)]",
};

export function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Tavsiye puanı: ${score}/100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none" className="stroke-[var(--line)]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          className={TONE_STROKE[scoreTone(score)]}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-num font-bold text-[var(--ink)]"
        style={{ fontSize: size * 0.32 }}
      >
        {score}
      </span>
    </div>
  );
}
