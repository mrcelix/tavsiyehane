import { headers } from "next/headers";

/**
 * Sitemap ve robots için mutlak site adresi.
 *
 * Öncelik sırası:
 *  1. NEXT_PUBLIC_SITE_URL (özel alan adı için en doğrusu — canonical adresi sabitler)
 *  2. İsteğin kendi host başlığı (Cloudflare Workers'ta workers.dev adresi de dahil)
 *  3. Yerel geliştirme adresi
 *
 * Böylece ortam değişkeni ayarlanmadığında bile üretimde localhost adresi sızmaz.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() erişilemiyorsa (statik üretim) son çareye düş
  }

  return "http://localhost:3000";
}
