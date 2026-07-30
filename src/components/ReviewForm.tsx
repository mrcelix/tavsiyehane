"use client";

import { useState } from "react";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import type { ItemType } from "@/lib/types";

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`px-0.5 text-xl leading-none transition ${n <= value ? "text-amber-400" : "text-zinc-300 hover:text-amber-300 dark:text-zinc-600"}`}
          aria-label={`${n} yıldız`}
        >
          ★
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
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
        ✓ Yorumunuz alındı. Moderasyon onayından sonra yayınlanacak.
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold">Genel puanınız</label>
        <Stars value={rating} onChange={setRating} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {criteria.map((c) => (
          <div key={c.key} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60">
            <span className="text-sm">{c.label}</span>
            <Stars value={crit[c.key] ?? 0} onChange={(v) => setCrit((p) => ({ ...p, [c.key]: v }))} />
          </div>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Deneyiminizi paylaşın…"
        className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending" || !rating || !comment.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "sending" ? "Gönderiliyor…" : "Yorumu Gönder"}
        </button>
        {state === "demo" && (
          <span className="text-sm text-amber-600 dark:text-amber-400">Demo modunda yorumlar kaydedilmez (Supabase bağlanınca aktifleşir).</span>
        )}
        {state === "auth" && (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Yorum yazmak için <a href="/giris" className="font-semibold underline">giriş yapın</a>.
          </span>
        )}
        {state === "error" && <span className="text-sm text-rose-500">Bir hata oluştu, tekrar deneyin.</span>}
      </div>
    </form>
  );
}
