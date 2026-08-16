import { Suspense } from "react";
import { getBundle } from "@/lib/data";
import { itemHref } from "@/lib/routes";
import { breadcrumbLd, jsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { categoryHref } from "@/lib/menu";
import { slugify } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/types";
import { filterItems, sortItems, uniqueBrands, uniqueCities, type SortKey } from "@/lib/query";
import { buildFacets } from "@/lib/facets";
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

  // Gelişmiş filtre boyutları kategorinin kendi verisinden çıkarılır;
  // sayımlar daima filtrelenmemiş kohortu gösterir.
  const facets = buildFacets(base);
  const secilenFacets: Record<string, string[]> = {};
  for (const f of facets) {
    const v = searchParams[f.param];
    const dizi = Array.isArray(v) ? v : v ? [v] : [];
    if (dizi.length) secilenFacets[f.param] = dizi;
  }

  const filtered = filterItems(bundle, {
    type,
    categorySlug,
    city: city ?? s(searchParams.sehir),
    district,
    brand: s(searchParams.marka),
    maxPrice: n(searchParams.maksfiyat),
    minScore: n(searchParams.minpuan),
    badge: s(searchParams.rozet),
    facets: secilenFacets,
  });
  const sorted = sortItems(filtered, (s(searchParams.sirala) as SortKey) ?? "puan");

  /*
   * SIRALI LİSTE YAPISAL VERİSİ
   *
   * Bu sayfalar sitenin asıl arama hedefleri ("en iyi telefon", "İstanbul ev
   * temizliği") ama tek bir yapısal veri taşımıyorlardı — detay sayfalarında
   * Product/LocalBusiness vardı, listelerde hiçbir şey yoktu. `ItemList`,
   * sıralamanın kendisini arama motoruna anlatan şey.
   *
   * ÖRNEK KAYITLAR DIŞARIDA: onların detay sayfaları `noindex` taşıyor
   * (bkz. app/sitemap.ts). İndekslenmeyecek adresleri sıralı listede saymak,
   * arama motoruna gösterip kapıyı yüzüne kapatmak olurdu. Hiç gerçek kayıt
   * yoksa şema hiç basılmıyor.
   */
  // Adres `getSiteUrl()` ile isteğin kendisinden türetiliyor, derleme anındaki
  // `SITE_URL` sabitinden değil: o değişken tanımlı olmayınca şema hiç
  // basılmıyordu ve bunu ancak üretimde fark ederdik.
  const kok = await getSiteUrl();
  const indekslenebilir = sorted.filter((i) => i.provenance.kind !== "demo");
  const itemListLd =
    indekslenebilir.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: title,
          numberOfItems: indekslenebilir.length,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          itemListElement: indekslenebilir.slice(0, 30).map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${kok}${itemHref(it)}`,
            name: it.title,
          })),
        }
      : null;

  // Kırıntı yolu: detay sayfalarında vardı, listelerde yoktu. Arama sonucunda
  // "tavsiyehane → Ürünler → Telefon" yolunu gösteren şey bu.
  const hub = TYPE_LABELS[type].hub;
  const kirintilar = [
    { name: "Ana sayfa", path: "/" },
    { name: TYPE_LABELS[type].plural, path: hub },
    ...(categorySlug ? [{ name: title, path: categoryHref(type, categorySlug, city ? slugify(city) : "tumu") }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1220px] px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([breadcrumbLd(kirintilar), ...(itemListLd ? [itemListLd] : [])]),
        }}
      />
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
            facets={facets}
          />
        </Suspense>
      </div>

      <ItemGrid items={sorted} />
    </div>
  );
}
