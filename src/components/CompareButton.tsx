"use client";

import { useEffect, useState } from "react";

export interface CompareEntry {
  slug: string;
  type: string;
  title: string;
}

const KEY = "tavsiyehane:compare";

export function readCompare(): CompareEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function writeCompare(list: CompareEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("compare-changed"));
}

export function CompareButton({ item }: { item: CompareEntry }) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const sync = () => setSelected(readCompare().some((e) => e.slug === item.slug));
    sync();
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, [item.slug]);

  function toggle() {
    let list = readCompare();
    if (list.some((e) => e.slug === item.slug)) {
      list = list.filter((e) => e.slug !== item.slug);
    } else {
      // Karşılaştırma yalnızca aynı tip içinde anlamlı — farklı tip seçilirse liste sıfırlanır
      if (list.length && list[0].type !== item.type) list = [];
      if (list.length >= 4) list = list.slice(1);
      list = [...list, item];
    }
    writeCompare(list);
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
        selected
          ? "bg-indigo-600 text-white"
          : "text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-indigo-500/10"
      }`}
    >
      {selected ? "✓ Karşılaştırmada" : "+ Karşılaştır"}
    </button>
  );
}
