"use client";

import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

export type VoteKind = "up" | "down" | "interest";

interface Props {
  itemId: string;
  counts: { up: number; down: number; interest: number };
  /** Kartlarda daralt */
  compact?: boolean;
}

const KEY = "tavsiyehane:votes";
const EVENT = "votes-changed";

function readVotes(raw: string): Record<string, VoteKind> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Tarayıcıdaki oy kaydını dış kaynak olarak okur — effect içinde setState gerekmez. */
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const OPTIONS: { kind: VoteKind; label: string; short: string; icon: typeof ThumbsUp; tone: string }[] = [
  {
    kind: "up",
    label: "Denedim, tavsiye ederim",
    short: "Tavsiye ederim",
    icon: ThumbsUp,
    tone: "text-[var(--up)] border-[color-mix(in_oklab,var(--up)_45%,transparent)] bg-[var(--up-soft)]",
  },
  {
    kind: "down",
    label: "Denedim, tavsiye etmem",
    short: "Tavsiye etmem",
    icon: ThumbsDown,
    tone: "text-[var(--down)] border-[color-mix(in_oklab,var(--down)_45%,transparent)] bg-[var(--down-soft)]",
  },
  {
    kind: "interest",
    label: "İlgimi çekti",
    short: "İlgimi çekti",
    icon: Eye,
    tone: "text-[var(--brand-ink)] border-[color-mix(in_oklab,var(--brand)_45%,transparent)] bg-[var(--brand-soft)]",
  },
];

/**
 * Üç seçenekli oy. Deneyim oyu (tavsiye ederim / etmem) ile niyet oyu (ilgimi çekti)
 * bilinçli olarak ayrılır: çok ilgi çekip az tavsiye alan şey "hype'ı tutmayan" şeydir
 * ve tek tip beğeni düğmesi bu bilgiyi yok eder.
 */
export function VoteButtons({ itemId, counts, compact = false }: Props) {
  const [local, setLocal] = useState(counts);
  const [not, setNot] = useState<string | null>(null);

  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? "{}",
    () => "{}"
  );
  const mine = useMemo(() => readVotes(raw)[itemId] ?? null, [raw, itemId]);

  async function vote(kind: VoteKind) {
    const onceki = mine;
    if (onceki === kind) return;

    // İyimser güncelleme: önceki oy geri alınır, yenisi eklenir.
    setLocal((c) => {
      const next = { ...c };
      if (onceki) next[onceki] = Math.max(0, next[onceki] - 1);
      next[kind] += 1;
      return next;
    });

    const store = readVotes(localStorage.getItem(KEY) ?? "{}");
    store[itemId] = kind;
    localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, kind }),
      });
      const data = await res.json();
      if (data.demo) setNot("Demo modunda oyunuz yalnızca bu tarayıcıda saklanır.");
      else if (data.authRequired) setNot("Oyunuz sayıldı; kalıcı olması için giriş yapın.");
      else setNot(null);
    } catch {
      setNot("Oy kaydedilemedi, bağlantınızı kontrol edin.");
    }
  }

  const deneyim = local.up + local.down;
  const olumluOran = deneyim > 0 ? Math.round((local.up / deneyim) * 100) : null;

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const secili = mine === o.kind;
          return (
            <button
              key={o.kind}
              onClick={() => vote(o.kind)}
              aria-pressed={secili}
              title={o.label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
                compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-[13px]",
                secili ? o.tone : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--muted-2)]"
              )}
            >
              <Icon size={compact ? 12 : 14} />
              {compact ? "" : o.short}
              <span className="font-num tabular-nums">{local[o.kind]}</span>
            </button>
          );
        })}
      </div>

      {!compact && (
        <p className="text-xs text-[var(--muted)]">
          {olumluOran !== null ? (
            <>
              Deneyenlerin <span className="font-num font-bold text-[var(--ink-2)]">%{olumluOran}</span>&apos;i tavsiye
              ediyor ({deneyim} deneyim oyu). Deneyim oyu, ilgi oyundan üç kat ağır sayılır.
            </>
          ) : (
            "Henüz deneyim oyu yok — ilk siz oylayın."
          )}
        </p>
      )}

      {not && !compact && <p className="text-xs text-[var(--gold-ink)]">{not}</p>}
    </div>
  );
}
