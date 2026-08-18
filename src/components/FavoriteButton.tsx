"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { olayGonder } from "@/lib/olay";

export interface FavEntry {
  slug: string;
  type: string;
  title: string;
}

const KEY = "tavsiyehane:favs";

export function readFavs(): FavEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function writeFavs(list: FavEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("favs-changed"));
  buluta(list);
}

/**
 * Favorileri buluta yazar — yalnızca oturum açıksa.
 *
 * Sessizce başarısız olur ve bu bilinçli: giriş yapmamış ziyaretçinin favorisi
 * tarayıcıda çalışmaya devam etmeli, ağ hatası da favori eklemeyi bozmamalı.
 * Bulut burada yedek, tek kaynak değil.
 */
let oturumYok = false;

function buluta(list: FavEntry[]) {
  // Oturum olmadığı bir kez anlaşıldıysa bir daha sorulmaz: aksi halde giriş
  // yapmamış ziyaretçi her kalbe bastığında boşuna istek gider.
  if (oturumYok) return;
  fetch("/api/favoriler", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slugs: list.map((e) => e.slug) }),
    keepalive: true,
  })
    .then((r) => r.json())
    .then((v) => {
      if (v?.authRequired || v?.demo) oturumYok = true;
    })
    .catch(() => {});
}

/**
 * Oturum açıksa buluttaki listeyle yereli BİRLEŞTİRİR.
 *
 * Birleşim, üzerine yazma değil: bir cihazda eklenip diğerinde bilinmeyen
 * favorinin kaybolmaması için. Silme eşitlemesi `writeFavs` üzerinden
 * yürüyor — kullanıcı bir şeyi kaldırdığında tam liste gönderiliyor.
 */
export async function favorileriEsitle(): Promise<void> {
  try {
    const r = await fetch("/api/favoriler");
    const veri = await r.json().catch(() => null);
    if (!veri || veri.authRequired || veri.demo) {
      oturumYok = true;
      return;
    }

    const bulut: FavEntry[] = veri.favoriler ?? [];
    const yerel = readFavs();
    const birlesik = [...yerel];
    for (const b of bulut) if (!birlesik.some((y) => y.slug === b.slug)) birlesik.push(b);

    const degisti = birlesik.length !== yerel.length || birlesik.length !== bulut.length;
    localStorage.setItem(KEY, JSON.stringify(birlesik));
    window.dispatchEvent(new Event("favs-changed"));
    if (degisti) buluta(birlesik);
  } catch {
    // Ağ yoksa yerel liste geçerli kalır.
  }
}

export function FavoriteButton({ item, itemId, large = false }: { item: FavEntry; itemId?: string; large?: boolean }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(readFavs().some((e) => e.slug === item.slug));
    sync();
    window.addEventListener("favs-changed", sync);
    return () => window.removeEventListener("favs-changed", sync);
  }, [item.slug]);

  function toggle() {
    const list = readFavs();
    // Yalnızca EKLEME olay üretir; favoriden çıkarmayı da saymak ilgiyi
    // olduğundan büyük gösterirdi.
    if (!fav) olayGonder({ tur: "favori", itemId, yol: `/${item.type}/${item.slug}` });
    writeFavs(fav ? list.filter((e) => e.slug !== item.slug) : [...list, item]);
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg font-semibold transition-colors max-sm:min-h-11 ${
        large ? "px-3 py-2 text-sm" : "px-2.5 py-2 text-xs"
      } ${fav ? "text-[var(--down)]" : "text-[var(--muted)] hover:bg-[var(--down-soft)] hover:text-[var(--down)]"}`}
    >
      <Heart size={large ? 15 : 13} className={fav ? "fill-[var(--down)]" : undefined} />
      {fav ? "Favoride" : "Favori"}
    </button>
  );
}
