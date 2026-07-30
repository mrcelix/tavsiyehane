import Link from "next/link";
import { getBundle } from "@/lib/data";
import { filterItems, sortItems, uniqueCities } from "@/lib/query";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { slugify } from "@/lib/format";
import { ItemGrid } from "./ItemGrid";

function categoryHref(type: ItemType, catSlug: string, citySlug = "tumu"): string {
  const hub = TYPE_LABELS[type].hub;
  if (type === "urun") return `${hub}/${catSlug}`;
  if (type === "hizmet") return `${hub}/${citySlug}/${catSlug}`;
  return `${hub}/${citySlug}/tumu/${catSlug}`;
}

export async function TypeHub({ type, title, subtitle }: { type: ItemType; title: string; subtitle: string }) {
  const bundle = await getBundle();
  const categories = bundle.categories.filter((c) => c.type === type);
  const cities = type === "urun" ? [] : uniqueCities(bundle, type);
  const top = sortItems(filterItems(bundle, { type }), "puan").slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 max-w-3xl text-zinc-500 dark:text-zinc-400">{subtitle}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {categories.map((c) => {
          const count = bundle.items.filter((i) => i.categorySlug === c.slug).length;
          return (
            <Link
              key={c.id}
              href={categoryHref(type, c.slug)}
              className="card-hover flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-4xl">{c.icon}</span>
              <div>
                <h2 className="font-bold">{c.name}</h2>
                <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{c.description}</p>
                <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">{count} tavsiye →</p>
              </div>
            </Link>
          );
        })}
      </div>

      {cities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold">Şehre göre keşfet</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((city) =>
              categories.map((c) => (
                <Link
                  key={`${city}-${c.slug}`}
                  href={categoryHref(type, c.slug, slugify(city))}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {city} · {c.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">En yüksek puanlılar</h2>
        <ItemGrid items={top} categories={bundle.categories} />
      </div>
    </div>
  );
}
