import type { Category, ItemType } from "./types";

/**
 * Kategori yol haritası ile yayındaki kategoriyi ayırır.
 *
 * "Hazırlanıyor" kategoriler menüde görünür — yol haritasını göstermek
 * kullanıcıya bilgi verir — ama tıklanabilir olmaz ve sitemap'e girmez:
 * boş bir liste sayfası hem kullanıcıyı hem arama motorunu yanıltır.
 */
export function isCategoryLive(c: Category): boolean {
  return c.status !== "hazirlaniyor";
}

export function liveCategories(categories: Category[], type?: ItemType): Category[] {
  return categories.filter((c) => isCategoryLive(c) && (!type || c.type === type));
}

export function upcomingCategories(categories: Category[], type?: ItemType): Category[] {
  return categories.filter((c) => !isCategoryLive(c) && (!type || c.type === type));
}
