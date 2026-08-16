"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

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
}

export function FavoriteButton({ item, large = false }: { item: FavEntry; large?: boolean }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(readFavs().some((e) => e.slug === item.slug));
    sync();
    window.addEventListener("favs-changed", sync);
    return () => window.removeEventListener("favs-changed", sync);
  }, [item.slug]);

  function toggle() {
    const list = readFavs();
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
