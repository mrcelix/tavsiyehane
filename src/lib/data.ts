import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Category, DataBundle, Item, ListDef, Offer, PricePoint, Review } from "./types";
import { getDemoBundle } from "@/data/demo";
import { buildEditorial, scoreAll } from "./scoring";
import { computeBadges } from "./badges";
import { createSupabasePublic } from "./supabase/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

const BOS_SINYAL = {
  interest30: 0,
  interestPrev30: 0,
  votesUp: 0,
  votesDown: 0,
  votesInterest: 0,
  weeksTracked: 0,
  weeksTop: 0,
  editor: 50,
};

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
    provenance: {
      kind: r.provenance_kind ?? "editor",
      verifiedAt: r.verified_at ?? undefined,
      sources: r.sources ?? undefined,
    },
    // Görsel yalnızca künyesi tamsa gösterilir; kaynağı bilinmeyen görsel
    // yayımlanmaz (bkz. ItemImage). Eksik künye = görsel yok, üretilmiş kapak devreye girer.
    image:
      r.image_url && r.image_alt && r.image_credit && r.image_license
        ? {
            url: r.image_url,
            alt: r.image_alt,
            credit: r.image_credit,
            license: r.image_license,
            sourceUrl: r.image_source_url ?? undefined,
          }
        : undefined,
    editorial: buildEditorial(r.type, r.editor_criteria ?? {}),
    // Sinyal satırı yoksa `null` — sıfır oyla dolu bir nesne "veri var" izlenimi verir.
    signals: r.signals ? { ...BOS_SINYAL, ...r.signals } : null,
    // Dış sinyal ancak kaynağıyla birlikte kabul edilir; kaynaksız ölçüm yok sayılır.
    external: r.external_signals?.kaynak?.label ? r.external_signals : undefined,
    // Puan ve rozetler okumadan sonra kohort üzerinden yeniden hesaplanır.
    score: 0,
    scoreBasis: "editor",
    scoreBreakdown: {},
    categoryRank: 0,
    categorySize: 0,
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
 * aksi halde yerleşik demo veriden okur.
 *
 * İKİ ÖNBELLEK KATMANI VAR ve ikisi farklı işi yapıyor:
 *
 *  1. `cache` (React)          — aynı istek içinde tekrar tekrar çağrılırsa
 *                                veritabanına bir kez gidilir.
 *  2. `unstable_cache` (Next)  — İSTEKLER ARASI. Katalog herkese aynı görünür ve
 *                                dakikada bir değişmez; her sayfa görüntülemesi
 *                                için 7 sorgu atmanın karşılığı yok.
 *
 * İkincisi olmadan tek bir tarayıcı ziyareti bile veritabanını dövüyordu:
 * 12 saatte 85K istek ~600K sorgu demekti (bkz. robots.txt'teki tarama notu).
 *
 * TAZELİK: `revalidate` 60 saniye, ayrıca panelden yapılan her yazma
 * `revalidateTag(BUNDLE_TAG)` ile önbelleği anında düşürüyor (lib/admin.ts) —
 * yönetici değişikliği bir dakika beklemez.
 *
 * `createSupabaseServer` yerine çerezsiz istemci kullanılıyor: önbellek kapsamı
 * içinde `cookies()` okunamaz. Katalog zaten oturumdan bağımsız.
 */
export const BUNDLE_TAG = "bundle";

const readBundle = unstable_cache(
  async (): Promise<DataBundle> => {
    const supabase = createSupabasePublic();
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

    /*
     * `status` ve `sira` okunmazsa panelden yapılan ayar hiçbir işe yaramaz:
     * hazırlanıyor işaretlenmiş kategori yayında görünür (içi boş bir sayfa
     * hem kullanıcıyı hem arama motorunu yanıltır) ve sıralama uygulanmaz.
     */
    const categories: Category[] = [...cats.data]
      // Sıralama ham satırlar üzerinde: `sira` Category tipine ait değil,
      // yalnızca kategorilerin hangi düzende geleceğini belirler.
      .sort((a: any, b: any) => (a.sira ?? 0) - (b.sira ?? 0))
      .map((c: any) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        type: c.type,
        icon: c.icon ?? "📦",
        description: c.description ?? "",
        status: c.status === "hazirlaniyor" ? ("hazirlaniyor" as const) : ("yayinda" as const),
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
      // Puan göreli olduğu için kohort üzerinden hesaplanır; rozetler koşullardan türer.
      items: scoreAll(mappedItems).map((it) => ({ ...it, badges: computeBadges(it) })),
      reviews: (reviews.data ?? []).map(mapReview),
      offers: mappedOffers,
      priceHistory,
      lists: mappedLists,
      source: "supabase",
    };
    } catch {
      return getDemoBundle();
    }
  },
  [BUNDLE_TAG],
  { tags: [BUNDLE_TAG], revalidate: 60 }
);

export const getBundle = cache(readBundle);
