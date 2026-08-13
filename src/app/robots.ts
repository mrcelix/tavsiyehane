import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const BASE = await getSiteUrl();
  return {
    /*
     * `/ara` ve sorgu dizili adresler taramaya kapalı.
     *
     * Sebep maliyet: sihirbaz ve gelişmiş filtreler, seçenek başına benzersiz
     * sorgu dizisi taşıyan gerçek bağlantılar üretiyor. Bunların çarpımı
     * pratikte sınırsız sayıda adres demek ve her biri sunucuda yeniden
     * hesaplanıp veritabanına gidiyor. Bir tarayıcı bu uzayda gezmeye
     * başladığında fatura, trafik değil kombinatorik tarafından belirlenir.
     *
     * SEO kaybı yok: site haritasındaki adreslerin hiçbirinde sorgu dizisi
     * yok, filtreler yalnızca daraltma aracı ve kategori sayfalarının
     * canonical'ı zaten sorgusuz yola işaret ediyor.
     */
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/hesap", "/api/", "/ara", "/*?"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
