"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BADGES } from "@/lib/badges";
import type { BadgeKey } from "@/lib/types";

export interface FilterOptions {
  brands?: string[];
  cities?: string[];
  showPrice?: boolean;
  brandLabel?: string;
}

const selectCls =
  "rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900";

export function FilterBar({ brands = [], cities = [], showPrice = true, brandLabel = "Marka" }: FilterOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const hasFilters = ["sirala", "sehir", "marka", "maksfiyat", "minpuan", "rozet"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={params.get("sirala") ?? "puan"} onChange={(e) => set("sirala", e.target.value)} className={selectCls} aria-label="Sıralama">
        <option value="puan">Tavsiye puanı</option>
        <option value="fiyat-artan">Fiyat (artan)</option>
        <option value="fiyat-azalan">Fiyat (azalan)</option>
        <option value="yorum">Yorum sayısı</option>
        <option value="yeni">Son güncellenen</option>
      </select>

      {cities.length > 0 && (
        <select value={params.get("sehir") ?? ""} onChange={(e) => set("sehir", e.target.value)} className={selectCls} aria-label="Şehir">
          <option value="">Tüm şehirler</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {brands.length > 0 && (
        <select value={params.get("marka") ?? ""} onChange={(e) => set("marka", e.target.value)} className={selectCls} aria-label={brandLabel}>
          <option value="">Tüm {brandLabel.toLocaleLowerCase("tr")}lar</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      )}

      {showPrice && (
        <input
          type="number"
          placeholder="Maks. fiyat (TL)"
          defaultValue={params.get("maksfiyat") ?? ""}
          onBlur={(e) => set("maksfiyat", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && set("maksfiyat", (e.target as HTMLInputElement).value)}
          className={`${selectCls} w-36`}
          aria-label="Maksimum fiyat"
        />
      )}

      <select value={params.get("minpuan") ?? ""} onChange={(e) => set("minpuan", e.target.value)} className={selectCls} aria-label="Minimum puan">
        <option value="">Tüm puanlar</option>
        <option value="85">85+ (Çok iyi)</option>
        <option value="80">80+</option>
        <option value="70">70+</option>
      </select>

      <select value={params.get("rozet") ?? ""} onChange={(e) => set("rozet", e.target.value)} className={selectCls} aria-label="Rozet">
        <option value="">Tüm rozetler</option>
        {(Object.keys(BADGES) as BadgeKey[]).map((k) => (
          <option key={k} value={k}>{BADGES[k].label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          ✕ Filtreleri temizle
        </button>
      )}
    </div>
  );
}
