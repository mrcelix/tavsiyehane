"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="group relative">
        <Search
          size={20}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-2)] transition-colors group-focus-within:text-[var(--brand)]"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ne arıyorsun? Örn: 25.000 TL altı telefon, İstanbul ev temizliği…"
          className="h-14 w-full rounded-[14px] border border-[var(--line)] bg-[var(--paper)] pl-14 pr-32 text-base text-[var(--ink)] shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-[var(--muted-2)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
        />
        <button
          type="submit"
          className="btn-shine absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-[var(--gold)] px-5 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-colors hover:bg-[var(--gold-ink)]"
        >
          Ara
        </button>
      </div>
    </form>
  );
}
