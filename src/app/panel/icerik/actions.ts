"use server";

import { redirect } from "next/navigation";
import { adminIslem, isaret, liste, metin, sayi, slugla } from "@/lib/admin";
import { getDemoBundle } from "@/data/demo";
import type { ItemType } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TIPLER: ItemType[] = ["urun", "hizmet", "mekan"];

/** "RAM: 8 GB" satırlarını nesneye çevirir; panelde öznitelik girmenin en hızlı yolu. */
function anahtarDeger(ham: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const satir of ham) {
    const i = satir.indexOf(":");
    if (i < 1) continue;
    const k = satir.slice(0, i).trim();
    const v = satir.slice(i + 1).trim();
    if (k && v) out[k] = v;
  }
  return out;
}

/**
 * Kaynak künyeleri. Satır başına bir kaynak: `Etiket | adres | tarih`.
 * Adres ve tarih isteğe bağlı; etiketsiz satır atlanır çünkü etiketsiz kaynak
 * kayıtta gösterilemez. Hiç kaynak yoksa `null` yazılır — boş dizi, "kaynak
 * girildi ama boş" gibi okunuyordu.
 */
function kaynaklar(fd: FormData): { label: string; url?: string; checkedAt?: string }[] | null {
  const out = liste(fd, "sources")
    .map((satir) => {
      const [label, url, checkedAt] = satir.split("|").map((p) => p.trim());
      if (!label) return null;
      return { label, ...(url ? { url } : {}), ...(checkedAt ? { checkedAt } : {}) };
    })
    .filter(Boolean) as { label: string; url?: string; checkedAt?: string }[];
  return out.length > 0 ? out : null;
}

/** Editör kriterleri: boş bırakılan kriter YAZILMAZ — bkz. lib/scoring.ts. */
function kriterler(fd: FormData): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith("kriter.") || typeof v !== "string" || v.trim() === "") continue;
    const n = Number(v);
    if (Number.isFinite(n)) out[k.slice(7)] = Math.max(0, Math.min(100, n));
  }
  return out;
}

function govde(fd: FormData) {
  const title = metin(fd, "title") ?? "";
  const slug = metin(fd, "slug") || slugla(title);
  const type = (metin(fd, "type") ?? "urun") as ItemType;
  if (!TIPLER.includes(type)) throw new Error("Geçersiz tip");
  if (!title) throw new Error("Başlık zorunlu");
  if (!slug) throw new Error("Slug üretilemedi");

  const imageUrl = metin(fd, "image_url");
  const imageAlt = metin(fd, "image_alt");
  const imageCredit = metin(fd, "image_credit");
  const imageLicense = metin(fd, "image_license");
  // Künye ya tam ya hiç: yarım künye veritabanı kısıtına takılır (0005), o hatayı
  // kullanıcıya ham göstermek yerine burada anlaşılır biçimde veriyoruz.
  if (imageUrl && !(imageAlt && imageCredit && imageLicense)) {
    throw new Error("Görsel eklerken alt metin, telif sahibi ve lisans zorunludur.");
  }

  return {
    slug,
    title,
    description: metin(fd, "description"),
    type,
    category_slug: metin(fd, "category_slug"),
    brand: metin(fd, "brand"),
    city: metin(fd, "city"),
    district: metin(fd, "district"),
    price: sayi(fd, "price"),
    price_min: sayi(fd, "price_min"),
    price_max: sayi(fd, "price_max"),
    price_level: sayi(fd, "price_level"),
    why_recommended: metin(fd, "why_recommended"),
    attrs: anahtarDeger(liste(fd, "attrs")),
    pros: liste(fd, "pros"),
    cons: liste(fd, "cons"),
    suitable_for: liste(fd, "suitable_for"),
    not_suitable_for: liste(fd, "not_suitable_for"),
    is_sponsored: isaret(fd, "is_sponsored"),
    editor_criteria: kriterler(fd),
    provenance_kind: "editor",
    verified_at: metin(fd, "verified_at") ?? new Date().toISOString(),
    sources: kaynaklar(fd),
    image_url: imageUrl,
    image_alt: imageAlt,
    image_credit: imageCredit,
    image_license: imageLicense,
    image_source_url: metin(fd, "image_source_url"),
    updated_at: new Date().toISOString(),
  };
}

export async function kayitOlusturAction(fd: FormData) {
  const veri = govde(fd);
  await adminIslem(
    "kayit.olustur",
    { tur: "item", id: veri.slug, detay: { title: veri.title, type: veri.type } },
    async ({ supabase }) => {
      const { error } = await (supabase as any).from("items").insert({ id: veri.slug, ...veri });
      if (error) throw new Error(error.message);
    },
    ["/", "/urunler", "/hizmetler", "/mekanlar"]
  );
  redirect(`/panel/icerik/${veri.slug}?kaydedildi=1`);
}

export async function kayitGuncelleAction(fd: FormData) {
  const id = metin(fd, "id");
  if (!id) throw new Error("Kayıt kimliği yok");
  const veri = govde(fd);
  await adminIslem(
    "kayit.guncelle",
    { tur: "item", id, detay: { title: veri.title } },
    async ({ supabase }) => {
      const { error } = await (supabase as any).from("items").update(veri).eq("id", id);
      if (error) throw new Error(error.message);
    },
    ["/", "/urunler", "/hizmetler", "/mekanlar"]
  );
  redirect(`/panel/icerik/${veri.slug}?kaydedildi=1`);
}

export async function kayitSilAction(fd: FormData) {
  const id = metin(fd, "id");
  if (!id) return;
  await adminIslem(
    "kayit.sil",
    { tur: "item", id },
    async ({ supabase }) => {
      const { error } = await (supabase as any).from("items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    ["/", "/urunler", "/hizmetler", "/mekanlar"]
  );
  redirect("/panel/icerik?silindi=1");
}

/**
 * Yerleşik içeriği veritabanına aktarır.
 *
 * NEDEN GEREKLİ: okuma katmanı `items` tablosu BOŞKEN yerleşik veriye düşüyor
 * (bkz. lib/data.ts). Panelden tek bir kayıt eklendiği anda tablo dolu sayılır
 * ve site 109 kaydını kaybedip yalnızca o kaydı gösterir. Bu düğme, panelden
 * içerik yönetmeye başlamadan önce mevcut içeriği veritabanına taşır.
 *
 * Çakışan kayıtlar güncellenir, silinen bir şey olmaz.
 */
export async function icerigiIceAktarAction() {
  const bundle = getDemoBundle();

  await adminIslem(
    "icerik.ice-aktar",
    { tur: "toplu", detay: { kategori: bundle.categories.length, kayit: bundle.items.length } },
    async ({ supabase }) => {
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
      const { error: kErr } = await (supabase as any)
        .from("categories")
        .upsert(kategoriler, { onConflict: "slug" });
      if (kErr) throw new Error(`Kategoriler: ${kErr.message}`);

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
        // Sinyaller sentetikse taşınmaz: uydurma oy veritabanına yazılırsa
        // gerçek oylardan ayırt edilemez hale gelir.
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
        const { error } = await (supabase as any)
          .from("items")
          .upsert(kayitlar.slice(i, i + 40), { onConflict: "id" });
        if (error) throw new Error(`Kayıtlar: ${error.message}`);
      }
    },
    ["/", "/urunler", "/hizmetler", "/mekanlar"]
  );
}
