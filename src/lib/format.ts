import type { Item } from "./types";

export function formatPrice(v: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v) + " TL";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export function priceLevelText(level?: number): string {
  if (!level) return "";
  return "₺".repeat(level);
}

/** Kart ve listelerde gösterilecek fiyat özeti (tipe göre değişir). */
export function priceSummary(item: Item): string {
  if (item.type === "urun" && item.price) return formatPrice(item.price);
  if (item.type === "hizmet") {
    if (item.priceMin && item.priceMax) return `${formatPrice(item.priceMin)} – ${formatPrice(item.priceMax)}`;
    if (item.priceMin) return `${formatPrice(item.priceMin)}'den başlayan`;
  }
  if (item.type === "mekan") return priceLevelText(item.priceLevel);
  return "";
}

export function locationText(item: Item): string {
  return [item.district, item.city].filter(Boolean).join(", ");
}

export function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u" };
  return s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
