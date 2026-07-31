import { Suspense } from "react";
import { getBundle } from "@/lib/data";
import { filterItems, sortItems, uniqueBrands, uniqueCities, type SortKey } from "@/lib/query";
import type { ItemType } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { ItemGrid } from "./ItemGrid";

export type ListingSearchParams = Record<string, string | string[] | undefined>;

function s(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

function n(v: string | string[] | undefined): number | undefined {
  const x = Number(s(v));
  return Number.isFinite(x) && x > 0 ? x : undefined;
}

export async function Listing({
  type,
  categorySlug,
  city,
  district,
  searchParams,
  title,
  subtitle,
  brandLabel,
}: {
  type: ItemType;
  categorySlug?: string;
  city?: string;
  district?: string;
  searchParams: ListingSearchParams;
  title: string;
  subtitle?: string;
  brandLabel?: string;
}) {
  const bundle = await getBundle();
  const base = filterItems(bundle, { type, categorySlug, city, district });
  const filtered = filterItems(bundle, {
    type,
    categorySlug,
    city: city ?? s(searchParams.sehir),
    district,
    brand: s(searchParams.marka),
    maxPrice: n(searchParams.maksfiyat),
    minScore: n(searchParams.minpuan),
    badge: s(searchParams.rozet),
  });
  const sorted = sortItems(filtered, (s(searchParams.sirala) as SortKey) ?? "puan");

  return (
    <div className="mx-auto max-w-[1220px] px-6 py-10">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-[var(--muted)]">{subtitle}</p>}
        <p className="mt-1 text-[13px] text-[var(--muted-2)]">
          Puanlar {type === "urun" ? "ürün" : type === "hizmet" ? "hizmet" : "mekân"} kriterlerine göre
          ağırlıklandırılır
        </p>
      </div>

      <div className="mb-6 rounded-[14px] border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 shadow-[var(--shadow-card)]">
        <Suspense>
          <FilterBar
            brands={uniqueBrands(base)}
            cities={city ? [] : uniqueCities(bundle, type)}
            showPrice={type !== "mekan"}
            brandLabel={brandLabel ?? (type === "urun" ? "Marka" : "İşletme")}
            resultCount={sorted.length}
          />
        </Suspense>
      </div>

      <ItemGrid items={sorted} />
    </div>
  );
}
