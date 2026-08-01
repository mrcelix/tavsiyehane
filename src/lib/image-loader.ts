"use client";

/**
 * Cloudflare görüntü dönüştürme yükleyicisi.
 *
 * Next'in yerleşik görsel optimizasyonu sharp'a ve Node çalışma zamanına dayanır;
 * OpenNext ile Workers üzerinde çalışmaz. Cloudflare'in kendi dönüştürücüsü
 * (`/cdn-cgi/image/...`) aynı işi kenar tarafında yapar.
 *
 * Dönüştürme yalnızca Cloudflare'in proxy'lediği bir alan adında çalışır;
 * geliştirmede ve `*.workers.dev` üzerinde çalışmaz. Bu yüzden adres olduğu gibi
 * geri verilir: görsel optimize edilmemiş olarak görünür ama KIRILMAZ.
 * Sessizce bozuk görsel göstermektense optimize etmemeyi tercih ediyoruz.
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Veri adresleri ve SVG'ler dönüştürülmez.
  if (src.startsWith("data:") || src.endsWith(".svg")) return src;

  const cfZone = process.env.NEXT_PUBLIC_CF_IMAGES === "1";
  if (!cfZone) return src;

  const params = [`width=${width}`, `quality=${quality ?? 75}`, "format=auto", "fit=cover"];
  // Dış adresler tam URL olarak, kendi varlıklarımız kök göreli olarak geçer.
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
