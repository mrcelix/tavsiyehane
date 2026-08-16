import type { Metadata } from "next";

export const SITE_NAME = "TavsiyeHane";
export const SITE_TAGLINE = "Her konuda doğru tavsiye";
export const SITE_DESCRIPTION =
  "Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver. Ürün, hizmet ve mekân tavsiyelerinde her alanda en iyiler; şeffaf puanlama ve doğrulanmış yorumlarla.";

/**
 * Üretim adresi. Tanımlıysa canonical ve og:image mutlak adrese çözülür.
 * Tanımlı değilse (yerel geliştirme) metadataBase verilmez — böylece
 * paylaşım etiketlerine yanlışlıkla localhost adresi yazılmaz.
 */
/*
 * `NEXT_PUBLIC_SITE_URL` tanımlı değilse Vercel'in kendi ürettiği üretim adresi
 * kullanılır. Sebebi somut: değişken ne yerelde ne Vercel'de tanımlıydı, bu
 * yüzden ÜRETİMDE `og:image` ve `og:url` hiç basılmıyordu — site nereye
 * paylaşılırsa paylaşılsın kartsız, çıplak bir bağlantı olarak görünüyordu.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` her zaman asıl üretim alan adını verir;
 * önizleme dağıtımlarında bile değişmez, dolayısıyla önizleme adresleri
 * canonical olarak ilan edilmez. Özel alan adı bağlandığında yine de
 * `NEXT_PUBLIC_SITE_URL` tanımlanmalı: önceliği o alır.
 */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const envUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || (vercelUrl ? `https://${vercelUrl}` : undefined);
export const SITE_URL = envUrl || null;
export const metadataBase = envUrl ? new URL(envUrl) : undefined;

const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

interface PageMetaInput {
  title: string;
  description: string;
  /** Kökten başlayan yol, ör. "/urunler/telefon" */
  path: string;
  /** Detay sayfalarında "article" daha doğru olur */
  type?: "website" | "article";
  /** Arama/filtre gibi indekslenmemesi gereken sayfalar */
  noIndex?: boolean;
  /**
   * Bağlantıları da taranmasın.
   *
   * `noindex` tek başına taramayı DURDURMAZ; varsayılan `follow: true` tam
   * tersine "indeksleme ama bağlantıları takip et" demektir. Sorgu
   * parametreleriyle sonsuz sayıda benzersiz adres üreten sayfalarda (sihirbaz)
   * bu, tarayıcıyı kombinasyon uzayında gezmeye davet eder.
   */
  noFollow?: boolean;
}

/** Her sayfada aynı OpenGraph/Twitter/canonical setini üretir. */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  noIndex,
  noFollow,
}: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false, follow: !noFollow } } : {}),
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "tr_TR",
      title,
      description,
      url: path,
      ...(envUrl ? { images: [OG_IMAGE] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(envUrl ? { images: [OG_IMAGE.url] } : {}),
    },
  };
}

/** JSON-LD betiğini string olarak üretir (script etiketine gömülür). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data);
}

/** Kırıntı yolu — detay ve kategori sayfalarında arama sonuçlarında yol gösterir. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(SITE_URL ? { item: `${SITE_URL}${it.path}` } : {}),
    })),
  };
}
