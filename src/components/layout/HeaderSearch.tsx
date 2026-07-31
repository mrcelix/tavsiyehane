"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

/** §5 arama tetikleyici: h 40px, mist zemin, hover'da paper + line kenarlık, sağda kbd ipucu. */
export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="group relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)] transition-colors group-focus-within:text-[var(--brand)]"
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ne arıyorsun?"
          aria-label="Ara"
          className="h-10 w-full rounded-md border border-transparent bg-[var(--mist)] pl-9 pr-16 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted-2)] hover:border-[var(--line)] hover:bg-[var(--paper)] focus:border-[var(--brand)] focus:bg-[var(--paper)] focus:ring-2 focus:ring-[var(--brand-soft)]"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-6 -translate-y-1/2 items-center rounded border border-[var(--line)] bg-[var(--paper)] px-1.5 text-[10px] font-medium text-[var(--muted)] lg:flex">
          Ctrl K
        </kbd>
      </div>
    </form>
  );
}
