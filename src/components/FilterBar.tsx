"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BADGES } from "@/lib/badges";
import type { BadgeKey } from "@/lib/types";
import { Input, Select } from "./ui/Field";

export interface FilterOptions {
  brands?: string[];
  cities?: string[];
  showPrice?: boolean;
  brandLabel?: string;
}

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
      <Select
        value={params.get("sirala") ?? "puan"}
        onChange={(e) => set("sirala", e.target.value)}
        aria-label="Sıralama"
        className="w-auto"
      >
        <option value="puan">Tavsiye puanı</option>
        <option value="fiyat-artan">Fiyat (artan)</option>
        <option value="fiyat-azalan">Fiyat (azalan)</option>
        <option value="yorum">Yorum sayısı</option>
        <option value="yeni">Son güncellenen</option>
      </Select>

      {cities.length > 0 && (
        <Select
          value={params.get("sehir") ?? ""}
          onChange={(e) => set("sehir", e.target.value)}
          aria-label="Şehir"
          className="w-auto"
        >
          <option value="">Tüm şehirler</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      )}

      {brands.length > 0 && (
        <Select
          value={params.get("marka") ?? ""}
          onChange={(e) => set("marka", e.target.value)}
          aria-label={brandLabel}
          className="w-auto"
        >
          <option value="">Tüm {brandLabel.toLocaleLowerCase("tr")}lar</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      )}

      {showPrice && (
        <Input
          type="number"
          placeholder="Maks. fiyat (TL)"
          defaultValue={params.get("maksfiyat") ?? ""}
          onBlur={(e) => set("maksfiyat", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && set("maksfiyat", (e.target as HTMLInputElement).value)}
          aria-label="Maksimum fiyat"
          className="w-40 font-num"
        />
      )}

      <Select
        value={params.get("minpuan") ?? ""}
        onChange={(e) => set("minpuan", e.target.value)}
        aria-label="Minimum puan"
        className="w-auto"
      >
        <option value="">Tüm puanlar</option>
        <option value="85">85+ (Çok iyi)</option>
        <option value="80">80+</option>
        <option value="70">70+</option>
      </Select>

      <Select
        value={params.get("rozet") ?? ""}
        onChange={(e) => set("rozet", e.target.value)}
        aria-label="Rozet"
        className="w-auto"
      >
        <option value="">Tüm rozetler</option>
        {(Object.keys(BADGES) as BadgeKey[]).map((k) => (
          <option key={k} value={k}>
            {BADGES[k].label}
          </option>
        ))}
      </Select>

      {hasFilters && (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-semibold text-[var(--down)] transition-colors hover:bg-[var(--down-soft)]"
        >
          <X size={14} />
          Filtreleri temizle
        </button>
      )}
    </div>
  );
}
