import { cache } from "react";
import type { Category, DataBundle, Item, ListDef, Offer, PricePoint, Review } from "./types";
import { getDemoBundle } from "@/data/demo";
import { createSupabaseServer } from "./supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapItem(r: any): Item {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? "",
    type: r.type,
    categorySlug: r.category_slug,
    brand: r.brand ?? "",
    city: r.city ?? undefined,
    district: r.district ?? undefined,
    price: r.price ?? undefined,
    priceMin: r.price_min ?? undefined,
    priceMax: r.price_max ?? undefined,
    priceLevel: r.price_level ?? undefined,
    score: r.score ?? 0,
    scoreBreakdown: r.score_breakdown ?? {},
    whyRecommended: r.why_recommended ?? "",
    attrs: r.attrs ?? {},
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    suitableFor: r.suitable_for ?? [],
    notSuitableFor: r.not_suitable_for ?? [],
    badges: r.badges ?? [],
    isSponsored: r.is_sponsored ?? false,
    updatedAt: r.updated_at,
    ratingAvg: Number(r.rating_avg ?? 0),
    ratingCount: r.rating_count ?? 0,
    ownerId: r.owner_id ?? null,
  };
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    itemId: r.item_id,
    userName: r.user_name ?? "Üye",
    rating: r.rating,
    criteria: r.criteria ?? {},
    comment: r.comment ?? "",
    isVerified: r.is_verified ?? false,
    status: r.status,
    createdAt: r.created_at,
  };
}

/**
 * Tüm okuma katmanının tek girişi. Supabase yapılandırılmış ve dolu ise oradan,
 * aksi halde yerleşik demo veriden okur. İstek başına önbelleklenir (React cache).
 */
export const getBundle = cache(async (): Promise<DataBundle> => {
  const supabase = await createSupabaseServer();
  if (!supabase) return getDemoBundle();

  try {
    const [cats, items, reviews, offers, hist, lists, listItems] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("items").select("*"),
      supabase.from("reviews").select("*").eq("status", "approved"),
      supabase.from("offers").select("*"),
      supabase.from("price_history").select("*").order("recorded_at"),
      supabase.from("lists").select("*"),
      supabase.from("list_items").select("*").order("position"),
    ]);

    if (cats.error || items.error || !items.data?.length) {
      // Tablolar boş ya da erişilemiyor → demo veriyle devam et
      return getDemoBundle();
    }

    const categories: Category[] = cats.data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      type: c.type,
      icon: c.icon ?? "📦",
      description: c.description ?? "",
    }));

    const mappedOffers: Offer[] = (offers.data ?? []).map((o: any) => ({
      id: o.id,
      itemId: o.item_id,
      sellerName: o.seller_name,
      sellerRating: Number(o.seller_rating ?? 0),
      price: Number(o.price),
      inStock: o.in_stock ?? true,
      url: o.url ?? "#",
    }));

    const priceHistory: Record<string, PricePoint[]> = {};
    for (const p of hist.data ?? []) {
      (priceHistory[p.item_id] ??= []).push({ date: p.recorded_at, price: Number(p.price) });
    }

    const itemById = new Map<string, Item>();
    const mappedItems = items.data.map(mapItem);
    mappedItems.forEach((i) => itemById.set(i.id, i));

    const mappedLists: ListDef[] = (lists.data ?? []).map((l: any) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description ?? "",
      updatedAt: l.updated_at,
      itemSlugs: (listItems.data ?? [])
        .filter((li: any) => li.list_id === l.id)
        .map((li: any) => itemById.get(li.item_id)?.slug)
        .filter(Boolean) as string[],
    }));

    return {
      categories,
      items: mappedItems,
      reviews: (reviews.data ?? []).map(mapReview),
      offers: mappedOffers,
      priceHistory,
      lists: mappedLists,
      source: "supabase",
    };
  } catch {
    return getDemoBundle();
  }
});
