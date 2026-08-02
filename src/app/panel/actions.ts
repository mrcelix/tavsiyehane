"use server";

import { redirect } from "next/navigation";
import { adminIslem, isaret, metin, sayi, slugla } from "@/lib/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Panel aksiyonları — kategori, liste, site metinleri, üye ve blog.
 *
 * Hepsi `adminIslem` üzerinden geçer: yetki kontrolü, denetim kaydı ve önbellek
 * tazeleme tek yerde. Bir aksiyonun kendi kontrolünü yazması, birinde
 * unutulduğunda kimsenin fark etmemesi demek.
 */

// =============== YORUM MODERASYONU ===============

export async function moderateReviewAction(fd: FormData) {
  const id = metin(fd, "id");
  const status = metin(fd, "status");
  if (!id || !status || !["approved", "rejected"].includes(status)) return;
  await adminIslem("yorum.moderasyon", { tur: "review", id, detay: { status } }, async ({ supabase }) => {
    await (supabase as any).from("reviews").update({ status }).eq("id", id);
  }, ["/panel/yorumlar"]);
}

export async function toggleSponsorAction(fd: FormData) {
  const id = metin(fd, "id");
  const current = fd.get("current") === "true";
  if (!id) return;
  await adminIslem("kayit.sponsor", { tur: "item", id, detay: { sponsorlu: !current } }, async ({ supabase }) => {
    await (supabase as any).from("items").update({ is_sponsored: !current }).eq("id", id);
  }, ["/", "/panel/icerik"]);
}

/** Doğrulama tarihini bugüne çeker — tazelik uyarısını kapatan tek işlem. */
export async function touchItemAction(fd: FormData) {
  const id = metin(fd, "id");
  if (!id) return;
  const now = new Date().toISOString();
  await adminIslem("kayit.dogrula", { tur: "item", id }, async ({ supabase }) => {
    await (supabase as any).from("items").update({ verified_at: now, updated_at: now }).eq("id", id);
  }, ["/", "/panel/icerik"]);
}

// =============== KATEGORİ ===============

export async function kategoriKaydetAction(fd: FormData) {
  const slug = metin(fd, "slug") || slugla(metin(fd, "name") ?? "");
  const name = metin(fd, "name");
  const type = metin(fd, "type");
  if (!slug || !name || !type) throw new Error("Ad, tip ve slug zorunlu");

  const veri = {
    id: slug,
    slug,
    name,
    type,
    icon: metin(fd, "icon") ?? "📦",
    description: metin(fd, "description") ?? "",
    sira: sayi(fd, "sira") ?? 0,
    status: metin(fd, "status") ?? "yayinda",
    menu_gorunur: isaret(fd, "menu_gorunur"),
  };

  await adminIslem("kategori.kaydet", { tur: "category", id: slug, detay: { name } }, async ({ supabase }) => {
    const { error } = await (supabase as any).from("categories").upsert(veri, { onConflict: "slug" });
    if (error) throw new Error(error.message);
  }, ["/", "/urunler", "/hizmetler", "/mekanlar", "/panel/kategoriler"]);

  redirect("/panel/kategoriler?kaydedildi=1");
}

export async function kategoriSilAction(fd: FormData) {
  const slug = metin(fd, "slug");
  if (!slug) return;
  await adminIslem("kategori.sil", { tur: "category", id: slug }, async ({ supabase }) => {
    // Kategoriye bağlı kayıtlar da silinir (on delete cascade); arayüzde uyarılıyor.
    const { error } = await (supabase as any).from("categories").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
  }, ["/", "/panel/kategoriler"]);
  redirect("/panel/kategoriler?silindi=1");
}

/** Sıralama: tek tek kaydetmek yerine tüm sıra bir formda gönderilir. */
export async function kategoriSiraAction(fd: FormData) {
  const guncellemeler: { slug: string; sira: number }[] = [];
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith("sira.") || typeof v !== "string") continue;
    const n = Number(v);
    if (Number.isFinite(n)) guncellemeler.push({ slug: k.slice(5), sira: n });
  }
  if (guncellemeler.length === 0) return;

  await adminIslem("kategori.sirala", { tur: "category", detay: { adet: guncellemeler.length } }, async ({ supabase }) => {
    for (const g of guncellemeler) {
      await (supabase as any).from("categories").update({ sira: g.sira }).eq("slug", g.slug);
    }
  }, ["/", "/urunler", "/hizmetler", "/mekanlar", "/panel/kategoriler"]);
}

// =============== SİTE METİNLERİ (HERO) ===============

export async function ayarKaydetAction(fd: FormData) {
  const anahtar = metin(fd, "anahtar");
  const ham = metin(fd, "deger");
  if (!anahtar || !ham) throw new Error("Anahtar ve değer zorunlu");

  let deger: unknown;
  try {
    deger = JSON.parse(ham);
  } catch {
    throw new Error("Değer geçerli JSON olmalı");
  }

  await adminIslem("ayar.kaydet", { tur: "setting", id: anahtar }, async ({ supabase, userId }) => {
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert({ anahtar, deger, updated_at: new Date().toISOString(), updated_by: userId }, { onConflict: "anahtar" });
    if (error) throw new Error(error.message);
  }, ["/", "/panel/site"]);

  redirect("/panel/site?kaydedildi=1");
}

// =============== ÜYE ===============

export async function rolDegistirAction(fd: FormData) {
  const id = metin(fd, "id");
  const rol = metin(fd, "rol");
  if (!id || !rol || !["user", "business", "admin"].includes(rol)) return;
  await adminIslem("uye.rol", { tur: "profile", id, detay: { rol } }, async ({ supabase }) => {
    const { error } = await (supabase as any).from("profiles").update({ role: rol }).eq("id", id);
    if (error) throw new Error(error.message);
  }, ["/panel/uyeler"]);
}

// =============== BLOG ===============

export async function yaziKaydetAction(fd: FormData) {
  const id = metin(fd, "id");
  const title = metin(fd, "title");
  if (!title) throw new Error("Başlık zorunlu");
  const slug = metin(fd, "slug") || slugla(title);
  const status = metin(fd, "status") ?? "taslak";

  const coverUrl = metin(fd, "cover_url");
  const coverAlt = metin(fd, "cover_alt");
  const coverCredit = metin(fd, "cover_credit");
  const coverLicense = metin(fd, "cover_license");
  if (coverUrl && !(coverAlt && coverCredit && coverLicense)) {
    throw new Error("Kapak görseli için alt metin, telif sahibi ve lisans zorunludur.");
  }

  const veri: Record<string, unknown> = {
    slug,
    title,
    excerpt: metin(fd, "excerpt"),
    body: metin(fd, "body") ?? "",
    status,
    cover_url: coverUrl,
    cover_alt: coverAlt,
    cover_credit: coverCredit,
    cover_license: coverLicense,
    updated_at: new Date().toISOString(),
  };
  // Yayın tarihi yalnızca ilk yayımlamada yazılır; sonraki düzenlemeler
  // yazıyı listenin başına taşımamalı.
  if (status === "yayinda") veri.published_at = metin(fd, "published_at") ?? new Date().toISOString();

  await adminIslem("blog.kaydet", { tur: "post", id: slug, detay: { title, status } }, async ({ supabase, userId }) => {
    if (id) {
      const { error } = await (supabase as any).from("posts").update(veri).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await (supabase as any).from("posts").insert({ ...veri, author_id: userId });
      if (error) throw new Error(error.message);
    }
  }, ["/blog", `/blog/${slug}`, "/panel/blog"]);

  redirect("/panel/blog?kaydedildi=1");
}

export async function yaziSilAction(fd: FormData) {
  const id = metin(fd, "id");
  if (!id) return;
  await adminIslem("blog.sil", { tur: "post", id }, async ({ supabase }) => {
    const { error } = await (supabase as any).from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, ["/blog", "/panel/blog"]);
  redirect("/panel/blog?silindi=1");
}
