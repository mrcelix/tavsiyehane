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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        <p className="mt-1 text-sm text-zinc-400">
          {sorted.length} sonuç · Puanlar {type === "urun" ? "ürün" : type === "hizmet" ? "hizmet" : "mekân"} kriterlerine göre ağırlıklandırılır
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Suspense>
          <FilterBar
            brands={uniqueBrands(base)}
            cities={city ? [] : uniqueCities(bundle, type)}
            showPrice={type !== "mekan"}
            brandLabel={brandLabel ?? (type === "urun" ? "Marka" : "İşletme")}
          />
        </Suspense>
      </div>

      <ItemGrid items={sorted} categories={bundle.categories} />
    </div>
  );
}
