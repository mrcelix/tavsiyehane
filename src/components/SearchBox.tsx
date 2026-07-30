"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ compact = false, initial = "" }: { compact?: boolean; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className={compact ? "w-full" : "mx-auto w-full max-w-2xl"}>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={compact ? "Ara…" : "Ne arıyorsun? Örn: 25.000 TL altı telefon, İstanbul ev temizliği…"}
          className={`w-full rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
            compact ? "px-3 py-1.5 pr-9 text-sm" : "px-5 py-3.5 pr-12 text-base shadow-sm"
          }`}
        />
        <button
          type="submit"
          aria-label="Ara"
          className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-600 ${compact ? "right-2.5" : "right-4"}`}
        >
          🔍
        </button>
      </div>
    </form>
  );
}
