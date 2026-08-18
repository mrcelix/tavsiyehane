import type { MetadataRoute } from "next";
import { getBundle } from "@/lib/data";
import { itemHref } from "@/lib/routes";
import { slugify } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";
import { liveCategories } from "@/lib/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = await getSiteUrl();
  const bundle = await getBundle();
  const now = new Date();

  /*
   * `/ara` LISTEDE DEGIL: robots.txt onu taramaya kapatiyor ve sayfa
   * `noindex, nofollow` tasiyor (sihirbaz sonsuz sorgu uzayi ureten bir tarama
   * tuzagiydi). Site haritasi "sunu indeksle" demektir; ayni adresi bir yandan
   * yasaklayip bir yandan haritaya koymak celiski olurdu.
   *
   * `/metodoloji` ve `/seffaflik` eklendi: ikisi de sitenin iddiasini anlatan
   * ve aranabilir sayfalar, haritada olmamalari eksiklikti.
   */
  const staticPages: MetadataRoute.Sitemap = ["", "/urunler", "/hizmetler", "/mekanlar", "/listeler", "/karsilastir", "/isletme", "/metodoloji", "/seffaflik", "/blog"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.8,
  }));

  // Hazırlanan kategoriler sitemap'e girmez: içinde kayıt yokken indekslenirse
  // arama motoru boş sayfa görür.
  const yayindaki = liveCategories(bundle.categories);

  const categoryPages: MetadataRoute.Sitemap = yayindaki.map((c) => ({
    url:
      c.type === "urun"
        ? `${BASE}/urunler/${c.slug}`
        : c.type === "hizmet"
          ? `${BASE}/hizmetler/tumu/${c.slug}`
          : `${BASE}/mekanlar/tumu/tumu/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Şehir bazlı hizmet/mekân sayfaları
  const cityPages: MetadataRoute.Sitemap = [];
  for (const c of yayindaki) {
    if (c.type === "urun") continue;
    const cities = [...new Set(bundle.items.filter((i) => i.categorySlug === c.slug).map((i) => i.city).filter(Boolean))] as string[];
    for (const city of cities) {
      cityPages.push({
        url:
          c.type === "hizmet"
            ? `${BASE}/hizmetler/${slugify(city)}/${c.slug}`
            : `${BASE}/mekanlar/${slugify(city)}/tumu/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  /*
   * Örnek kayıtlar site haritasına GİRMEZ.
   *
   * Bunlar uydurma ürün ve işletmelerdir: adı, fiyatı, ilçesi ve puanı var ama
   * karşılığı yok. Arama motoruna verilirse gerçek bir tavsiye gibi indeklenir
   * ve var olmayan bir işletme, gerçek bir işletmeyle aynı sonuç sayfasında
   * yarışır. Site haritası "şunları indeksle" demektir; uydurma kaydı oraya
   * koymak, onu gerçek diye sunmaktır.
   *
   * Aynı kayıtlar detay sayfalarında `noindex` de taşır (bkz. lib/seo.ts
   * kullanan detay sayfaları) — site haritasından çıkarmak tek başına yetmez,
   * çünkü liste sayfalarından bağlantıyla da bulunabilirler.
   */
  const itemPages: MetadataRoute.Sitemap = bundle.items
    .filter((i) => i.provenance.kind !== "demo")
    .map((i) => ({
      url: `${BASE}${itemHref(i)}`,
      lastModified: new Date(i.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const listPages: MetadataRoute.Sitemap = bundle.lists.map((l) => ({
    url: `${BASE}/liste/${l.slug}`,
    lastModified: new Date(l.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...cityPages, ...listPages, ...itemPages];
}
