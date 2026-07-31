"use client";

import { Check, Star } from "lucide-react";
import { useState } from "react";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import type { ItemType } from "@/lib/types";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Field";

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} yıldız`}
        >
          <Star
            size={18}
            className={n <= value ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--line)] hover:text-[var(--gold)]"}
          />
        </button>
      ))}
    </span>
  );
}

export function ReviewForm({ itemId, type }: { itemId: string; type: ItemType }) {
  const criteria = REVIEW_CRITERIA[type];
  const [rating, setRating] = useState(0);
  const [crit, setCrit] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "demo" | "auth" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, rating, criteria: crit, comment: comment.trim() }),
      });
      const data = await res.json();
      if (data.demo) setState("demo");
      else if (data.authRequired) setState("auth");
      else if (data.ok) setState("done");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[var(--up-soft)] p-4 text-sm font-semibold text-[var(--up)]">
        <Check size={16} />
        Yorumunuz alındı. Moderasyon onayından sonra yayınlanacak.
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-bold text-[var(--ink)]">Genel puanınız</label>
        <Stars value={rating} onChange={setRating} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {criteria.map((c) => (
          <div key={c.key} className="flex items-center justify-between rounded-[10px] bg-[var(--mist)] px-3 py-2">
            <span className="text-sm text-[var(--ink-2)]">{c.label}</span>
            <Stars value={crit[c.key] ?? 0} onChange={(v) => setCrit((p) => ({ ...p, [c.key]: v }))} />
          </div>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Deneyiminizi paylaşın…"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={state === "sending" || !rating || !comment.trim()}>
          {state === "sending" ? "Gönderiliyor…" : "Yorumu Gönder"}
        </Button>
        {state === "demo" && (
          <span className="text-sm text-[var(--gold-ink)]">
            Demo modunda yorumlar kaydedilmez (Supabase bağlanınca aktifleşir).
          </span>
        )}
        {state === "auth" && (
          <span className="text-sm text-[var(--gold-ink)]">
            Yorum yazmak için{" "}
            <a href="/giris" className="font-bold underline">
              giriş yapın
            </a>
            .
          </span>
        )}
        {state === "error" && <span className="text-sm text-[var(--down)]">Bir hata oluştu, tekrar deneyin.</span>}
      </div>
    </form>
  );
}
