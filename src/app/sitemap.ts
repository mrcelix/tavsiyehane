import type { MetadataRoute } from "next";
import { getBundle } from "@/lib/data";
import { itemHref } from "@/lib/routes";
import { slugify } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = await getSiteUrl();
  const bundle = await getBundle();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = ["", "/urunler", "/hizmetler", "/mekanlar", "/listeler", "/ara", "/karsilastir", "/isletme"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = bundle.categories.map((c) => ({
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
  for (const c of bundle.categories) {
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

  const itemPages: MetadataRoute.Sitemap = bundle.items.map((i) => ({
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
