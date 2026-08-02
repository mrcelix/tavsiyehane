/**
 * Yerleşik içeriği Supabase'e aktarır.
 *
 * Panel Özet sayfasındaki "Yerleşik içeriği veritabanına aktar" düğmesiyle AYNI
 * işi yapar; tek fark, bu script `service_role` anahtarıyla çalıştığı için
 * admin oturumu gerektirmez. İkisinin aynı davranması bilinçli: iki farklı
 * içe aktarma yolu, iki farklı veritabanı durumu demek olurdu.
 *
 * NE AKTARILIR: kategoriler ve kayıtlar.
 *
 * NE AKTARILMAZ ve neden:
 *  - Örnek verinin sentetik OYLARI. Uydurma oy veritabanına yazılırsa gerçek
 *    oylardan ayırt edilemez hale gelir ve tüm puanlama iddiası çöker.
 *  - Örnek YORUMLAR ("Ece L., 5 yıldız"). Bunlar kurgu; gerçek yorum tablosuna
 *    girerse moderasyon kuyruğunda ve sayılarda gerçek yorum gibi görünürler.
 *  - Örnek SATICI teklifleri ve fiyat geçmişi — aynı sebep.
 *
 * Sonuç: örnek kayıtlar sitede durmaya devam eder ve "Örnek veri" rozetiyle
 * görünür; puanları editör kriterlerinden hesaplanır. Gerçek katalog kayıtları
 * (telefon) kaynaklarıyla birlikte aktarılır.
 *
 *   npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { getDemoBundle } from "../src/data/demo";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("HATA: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const bundle = getDemoBundle();
  const gercek = bundle.items.filter((i) => i.provenance.kind === "editor").length;

  console.log(`Kategori : ${bundle.categories.length}`);
  console.log(`Kayıt    : ${bundle.items.length} (${gercek} gerçek, ${bundle.items.length - gercek} örnek)`);
  console.log();

  const kategoriler = bundle.categories.map((c, i) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    type: c.type,
    icon: c.icon,
    description: c.description,
    sira: i,
    status: c.status ?? "yayinda",
  }));
  const { error: kErr } = await supabase.from("categories").upsert(kategoriler, { onConflict: "slug" });
  if (kErr) throw new Error("categories: " + kErr.message);
  console.log(`✓ ${kategoriler.length} kategori`);

  const kayitlar = bundle.items.map((i) => ({
    id: i.id,
    slug: i.slug,
    title: i.title,
    description: i.description,
    type: i.type,
    category_slug: i.categorySlug,
    brand: i.brand,
    city: i.city ?? null,
    district: i.district ?? null,
    price: i.price ?? null,
    price_min: i.priceMin ?? null,
    price_max: i.priceMax ?? null,
    price_level: i.priceLevel ?? null,
    why_recommended: i.whyRecommended,
    attrs: i.attrs,
    pros: i.pros,
    cons: i.cons,
    suitable_for: i.suitableFor,
    not_suitable_for: i.notSuitableFor,
    is_sponsored: i.isSponsored,
    // Sentetik oy taşınmaz (yukarıdaki açıklama).
    signals: i.provenance.kind === "demo" ? null : i.signals,
    external_signals: i.external ?? null,
    editor_criteria: i.editorial.criteria,
    provenance_kind: i.provenance.kind,
    verified_at: i.provenance.verifiedAt ?? null,
    sources: i.provenance.sources ?? null,
    image_url: i.image?.url ?? null,
    image_alt: i.image?.alt ?? null,
    image_credit: i.image?.credit ?? null,
    image_license: i.image?.license ?? null,
    image_source_url: i.image?.sourceUrl ?? null,
    updated_at: i.updatedAt,
  }));

  // Parça parça: tek istekte yüzlerce satır göndermek zaman aşımına düşer.
  for (let i = 0; i < kayitlar.length; i += 40) {
    const parca = kayitlar.slice(i, i + 40);
    const { error } = await supabase.from("items").upsert(parca, { onConflict: "id" });
    if (error) throw new Error("items: " + error.message);
    console.log(`✓ ${Math.min(i + 40, kayitlar.length)}/${kayitlar.length} kayıt`);
  }

  console.log("\nTamam. Site artık Supabase verisiyle çalışıyor.");
  console.log("Puan, rozet ve listeler her okumada yeniden hesaplanır; veritabanında saklanmaz.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
