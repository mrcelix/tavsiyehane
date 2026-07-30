/**
 * Demo verisini Supabase'e yükler.
 * Kullanım: .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY tanımlıyken
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
  console.log(`Yükleniyor: ${bundle.categories.length} kategori, ${bundle.items.length} içerik, ${bundle.reviews.length} yorum…`);

  // Kategoriler
  {
    const { error } = await supabase.from("categories").upsert(
      bundle.categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, type: c.type, icon: c.icon, description: c.description }))
    );
    if (error) throw new Error("categories: " + error.message);
  }

  // İçerikler
  {
    const { error } = await supabase.from("items").upsert(
      bundle.items.map((i) => ({
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
        score: i.score,
        score_breakdown: i.scoreBreakdown,
        why_recommended: i.whyRecommended,
        attrs: i.attrs,
        pros: i.pros,
        cons: i.cons,
        suitable_for: i.suitableFor,
        not_suitable_for: i.notSuitableFor,
        badges: i.badges,
        is_sponsored: i.isSponsored,
        rating_avg: i.ratingAvg,
        rating_count: i.ratingCount,
        updated_at: i.updatedAt,
      }))
    );
    if (error) throw new Error("items: " + error.message);
  }

  // Satıcılar
  {
    const { error } = await supabase.from("offers").upsert(
      bundle.offers.map((o) => ({
        id: o.id,
        item_id: o.itemId,
        seller_name: o.sellerName,
        seller_rating: o.sellerRating,
        price: o.price,
        in_stock: o.inStock,
        url: o.url,
      }))
    );
    if (error) throw new Error("offers: " + error.message);
  }

  // Fiyat geçmişi (tazele: önce sil)
  {
    await supabase.from("price_history").delete().neq("item_id", "");
    const rows = Object.entries(bundle.priceHistory).flatMap(([itemId, points]) =>
      points.map((p) => ({ item_id: itemId, price: p.price, recorded_at: p.date }))
    );
    const { error } = await supabase.from("price_history").insert(rows);
    if (error) throw new Error("price_history: " + error.message);
  }

  // Yorumlar (demo yorumları onaylı; user_id boş)
  {
    await supabase.from("reviews").delete().is("user_id", null);
    const { error } = await supabase.from("reviews").insert(
      bundle.reviews.map((r) => ({
        item_id: r.itemId,
        user_id: null,
        user_name: r.userName,
        rating: r.rating,
        criteria: r.criteria,
        comment: r.comment,
        is_verified: r.isVerified,
        status: r.status,
        created_at: r.createdAt,
      }))
    );
    if (error) throw new Error("reviews: " + error.message);
  }

  // Listeler
  {
    const { error } = await supabase.from("lists").upsert(
      bundle.lists.map((l) => ({ id: l.id, slug: l.slug, title: l.title, description: l.description, updated_at: l.updatedAt }))
    );
    if (error) throw new Error("lists: " + error.message);

    const { error: e2 } = await supabase.from("list_items").upsert(
      bundle.lists.flatMap((l) =>
        l.itemSlugs.map((slug, idx) => ({ list_id: l.id, item_id: slug, position: idx }))
      )
    );
    if (e2) throw new Error("list_items: " + e2.message);
  }

  console.log("✓ Seed tamamlandı. Site artık Supabase verisiyle çalışacak.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
