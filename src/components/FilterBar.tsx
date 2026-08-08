"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BADGES } from "@/lib/badges";
import type { Facet } from "@/lib/facets";
import type { BadgeKey } from "@/lib/types";
import { AdvancedFilters } from "./AdvancedFilters";
import { Input, Select } from "./ui/Field";

export interface FilterOptions {
  brands?: string[];
  cities?: string[];
  showPrice?: boolean;
  brandLabel?: string;
  /** Sonuç sayısı çubuğun sağında gösterilir — ayrı satır harcanmaz. */
  resultCount?: number;
  /** Kategorinin kendi verisinden çıkarılan gelişmiş filtre boyutları */
  facets?: Facet[];
}

/** Kompakt alan: sabit genişlik + üstte küçük etiket. */
function Field({ label, width, children }: { label: string; width: string; children: React.ReactNode }) {
  return (
    <label className={`flex shrink-0 flex-col gap-1 ${width}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-2)]">{label}</span>
      {children}
    </label>
  );
}

const CTRL = "h-9 w-full text-[13px]";

export function FilterBar({
  brands = [],
  cities = [],
  showPrice = true,
  brandLabel = "Marka",
  resultCount,
  facets = [],
}: FilterOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const activeKeys = ["sehir", "marka", "maksfiyat", "minpuan", "rozet"].filter((k) => params.get(k));

  /*
   * Rozet kutusu listelenen kayıtlardan doğar, sabit rozet tablosundan değil:
   * mekân listesinde "Kategori lideri" seçeneği sunup 0 sonuç göstermek,
   * seçeneği hiç sunmamaktan kötüdür. Marka ve şehir kutuları da böyle çalışır.
   */
  const rozetler = facets.find((f) => f.param === "rozet")?.values ?? [];
  const seciliRozet = params.get("rozet") ?? "";
  // Kohortta karşılığı olmayan bir rozet URL'den gelmiş olabilir (eski bağlantı,
  // daralmış liste). Seçenek olarak yine de basılır — yoksa kutu "Tümü" görünür
  // ama filtre uygulanmaya devam eder ve kullanıcı 0 sonucun sebebini göremez.
  const rozetSecenekleri =
    seciliRozet && !rozetler.some((r) => r.value === seciliRozet)
      ? [...rozetler, { value: seciliRozet, count: 0 }]
      : rozetler;

  return (
    <div className="flex flex-wrap items-end gap-x-2 gap-y-3">
      <SlidersHorizontal size={15} className="mb-2.5 hidden shrink-0 text-[var(--muted-2)] sm:block" />

      <Field label="Sırala" width="w-[152px]">
        <Select
          value={params.get("sirala") ?? "puan"}
          onChange={(e) => set("sirala", e.target.value)}
          aria-label="Sıralama"
          className={CTRL}
        >
          <option value="puan">Tavsiye puanı</option>
          <option value="fiyat-artan">Fiyat (artan)</option>
          <option value="fiyat-azalan">Fiyat (azalan)</option>
          <option value="yorum">Yorum sayısı</option>
          <option value="yeni">Son güncellenen</option>
        </Select>
      </Field>

      {cities.length > 0 && (
        <Field label="Şehir" width="w-[130px]">
          <Select value={params.get("sehir") ?? ""} onChange={(e) => set("sehir", e.target.value)} aria-label="Şehir" className={CTRL}>
            <option value="">Tümü</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {brands.length > 0 && (
        <Field label={brandLabel} width="w-[150px]">
          <Select value={params.get("marka") ?? ""} onChange={(e) => set("marka", e.target.value)} aria-label={brandLabel} className={CTRL}>
            <option value="">Tümü</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {showPrice && (
        <Field label="Maks. fiyat" width="w-[124px]">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="TL"
            defaultValue={params.get("maksfiyat") ?? ""}
            onBlur={(e) => set("maksfiyat", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && set("maksfiyat", (e.target as HTMLInputElement).value)}
            aria-label="Maksimum fiyat"
            className={`${CTRL} font-num`}
          />
        </Field>
      )}

      <Field label="Puan" width="w-[112px]">
        <Select value={params.get("minpuan") ?? ""} onChange={(e) => set("minpuan", e.target.value)} aria-label="Minimum puan" className={CTRL}>
          <option value="">Tümü</option>
          <option value="85">85+</option>
          <option value="80">80+</option>
          <option value="70">70+</option>
        </Select>
      </Field>

      {rozetSecenekleri.length > 0 && (
        <Field label="Rozet" width="w-[168px]">
          <Select value={seciliRozet} onChange={(e) => set("rozet", e.target.value)} aria-label="Rozet" className={CTRL}>
            <option value="">Tümü</option>
            {rozetSecenekleri.map((r) => (
              <option key={r.value} value={r.value}>
                {BADGES[r.value as BadgeKey]?.label ?? r.value}
                {r.count > 0 && ` (${r.count})`}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="pb-1">
        {/* Rozet burada kendi kutusuyla duruyor; panelde ikinci bir rozet listesi
            aynı `rozet` parametresini çok seçimli yazar ve iki denetim birbirinin
            değerini ezer. */}
        <AdvancedFilters facets={facets.filter((f) => f.param !== "rozet")} />
      </div>

      <div className="ml-auto flex items-center gap-3 pb-1">
        {activeKeys.length > 0 && (
          <button
            onClick={() => router.replace(pathname, { scroll: false })}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-[var(--down)] transition-colors hover:bg-[var(--down-soft)]"
          >
            <X size={13} />
            Temizle
            <span className="font-num text-[11px] opacity-70">({activeKeys.length})</span>
          </button>
        )}
        {resultCount !== undefined && (
          <span className="whitespace-nowrap text-[13px] text-[var(--muted)]">
            <span className="font-num font-bold text-[var(--ink)]">{resultCount}</span> sonuç
          </span>
        )}
      </div>
    </div>
  );
}
