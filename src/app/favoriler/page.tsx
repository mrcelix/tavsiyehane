"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readFavs, writeFavs, type FavEntry } from "@/components/FavoriteButton";

const TYPE_ICON: Record<string, string> = { urun: "🛒", hizmet: "🤝", mekan: "📍" };
const TYPE_PREFIX: Record<string, string> = { urun: "/urun", hizmet: "/hizmet", mekan: "/mekan" };

export default function FavorilerPage() {
  const [favs, setFavs] = useState<FavEntry[] | null>(null);

  useEffect(() => {
    const sync = () => setFavs(readFavs());
    sync();
    window.addEventListener("favs-changed", sync);
    return () => window.removeEventListener("favs-changed", sync);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Favorilerim</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Favoriler bu tarayıcıda saklanır{favs && favs.length > 0 ? ` · ${favs.length} kayıt` : ""}.
      </p>

      {favs && favs.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
          <div className="mb-2 text-3xl">♡</div>
          Henüz favori eklemediniz. Kartlardaki <strong>&quot;♡ Favori&quot;</strong> düğmesiyle ekleyin.
          <div className="mt-4">
            <Link href="/urunler" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Keşfetmeye başla →
            </Link>
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-2.5">
        {(favs ?? []).map((f) => (
          <li
            key={f.slug}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">{TYPE_ICON[f.type] ?? "★"}</span>
            <Link href={`${TYPE_PREFIX[f.type] ?? "/urun"}/${f.slug}`} className="flex-1 font-semibold hover:text-indigo-600">
              {f.title}
            </Link>
            <button
              onClick={() => writeFavs(readFavs().filter((x) => x.slug !== f.slug))}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
            >
              Kaldır
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
