"use client";

import { Check, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { olayGonder } from "@/lib/olay";

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

export function CompareButton({ item, itemId }: { item: CompareEntry; itemId?: string }) {
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
      // Yalnızca EKLEME sayılır: çıkarmayı da saymak "kaç kez karşılaştırıldı"
      // sayacını iki katına çıkarır ve ilgiyi olduğundan büyük gösterirdi.
      olayGonder({ tur: "karsilastirma", itemId, yol: `/${item.type}/${item.slug}` });
    }
    writeCompare(list);
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors max-sm:min-h-11 ${
        selected
          ? "bg-[var(--brand)] text-white"
          : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]"
      }`}
    >
      {selected ? <Check size={13} /> : <Scale size={13} />}
      {selected ? "Karşılaştırmada" : "Karşılaştır"}
    </button>
  );
}
