import { NextResponse } from "next/server";
import { getBundle } from "@/lib/data";
import { searchItems } from "@/lib/query";
import { liveCategories } from "@/lib/categories";
import { categoryHref } from "@/lib/menu";
import { itemHref } from "@/lib/routes";
import { priceSummary } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/types";

/**
 * Hızlı arama uç noktası — komut paleti buradan beslenir.
 *
 * Arama mantığı istemciye taşınmadı: `searchItems` bütçe ayıklamayı
 * ("25.000 TL altı telefon") ve Türkçe ek toleransını ("kediler" → "kedi")
 * zaten yapıyor ve testleri var. İstemcide ikinci bir arama yazmak, iki farklı
 * sonuç kümesi üretme riski demek — paletten bulunan şeyin arama sayfasında
 * bulunamaması en kafa karıştırıcı hatadır.
 */
export const dynamic = "force-dynamic";

const KAYIT_LIMIT = 8;
const KATEGORI_LIMIT = 4;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const bundle = await getBundle();

  if (q.length < 2) {
    // Boş sorguda öneri: en yüksek puanlılar. Boş bir kutu, kullanıcıya
    // nereden başlayacağını söylemez.
    const oneriler = [...bundle.items].sort((a, b) => b.score - a.score).slice(0, 6);
    return NextResponse.json({
      sorgu: q,
      toplam: 0,
      oneri: true,
      kayitlar: oneriler.map((i) => kayitOzet(i, bundle)),
      kategoriler: [],
    });
  }

  const bulunan = searchItems(bundle, q);
  const kucuk = q.toLocaleLowerCase("tr");
  const kategoriler = liveCategories(bundle.categories)
    .filter((c) => c.name.toLocaleLowerCase("tr").includes(kucuk))
    .slice(0, KATEGORI_LIMIT)
    .map((c) => ({
      ad: c.name,
      tip: TYPE_LABELS[c.type].singular,
      href: categoryHref(c.type, c.slug),
      adet: bundle.items.filter((i) => i.categorySlug === c.slug).length,
    }));

  return NextResponse.json({
    sorgu: q,
    toplam: bulunan.length,
    oneri: false,
    kayitlar: bulunan.slice(0, KAYIT_LIMIT).map((i) => kayitOzet(i, bundle)),
    kategoriler,
  });
}

type Bundle = Awaited<ReturnType<typeof getBundle>>;

function kayitOzet(i: Bundle["items"][number], bundle: Bundle) {
  const kategori = bundle.categories.find((c) => c.slug === i.categorySlug);
  return {
    slug: i.slug,
    baslik: i.title,
    marka: i.brand,
    tip: TYPE_LABELS[i.type].singular,
    kategori: kategori?.name ?? i.categorySlug,
    kategoriSlug: i.categorySlug,
    href: itemHref(i),
    puan: i.score,
    dayanak: i.scoreBasis,
    fiyat: priceSummary(i),
    sehir: i.city ?? null,
  };
}
