"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCompare, writeCompare, type CompareEntry } from "./CompareButton";

export function CompareTray() {
  const [list, setList] = useState<CompareEntry[]>([]);

  useEffect(() => {
    const sync = () => setList(readCompare());
    sync();
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-indigo-200 bg-white/95 backdrop-blur dark:border-indigo-500/30 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5">
        <span className="text-sm font-semibold">Karşılaştır ({list.length}/4):</span>
        {list.map((e) => (
          <button
            key={e.slug}
            onClick={() => writeCompare(readCompare().filter((x) => x.slug !== e.slug))}
            className="group flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-500/10"
            title="Listeden çıkar"
          >
            <span className="max-w-40 truncate">{e.title}</span>
            <span className="text-zinc-400 group-hover:text-rose-500">✕</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => writeCompare([])}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Temizle
          </button>
          <Link
            href={`/karsilastir?ids=${list.map((e) => e.slug).join(",")}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${
              list.length >= 2 ? "bg-indigo-600 hover:bg-indigo-500" : "pointer-events-none bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            Karşılaştır →
          </Link>
        </div>
      </div>
    </div>
  );
}
