import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getBundle } from "@/lib/data";
import { filterItems, sortItems, uniqueCities } from "@/lib/query";
import { categoryHref } from "@/lib/menu";
import { liveCategories, upcomingCategories } from "@/lib/categories";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";
import type { ItemType } from "@/lib/types";
import { slugify } from "@/lib/format";
import { ItemGrid } from "./ItemGrid";
import { Overline } from "./ui/Card";

export async function TypeHub({ type, title, subtitle }: { type: ItemType; title: string; subtitle: string }) {
  const bundle = await getBundle();
  const categories = liveCategories(bundle.categories, type);
  const yakinda = upcomingCategories(bundle.categories, type);
  const cities = type === "urun" ? [] : uniqueCities(bundle, type);
  const top = sortItems(filterItems(bundle, { type }), "puan").slice(0, 8);
  const accent = TYPE_ACCENT[type];

  return (
    <div className="mx-auto max-w-[1220px] px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
      <p className="mt-1.5 max-w-3xl text-[var(--muted)]">{subtitle}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {categories.map((c) => {
          const count = bundle.items.filter((i) => i.categorySlug === c.slug).length;
          return (
            <Link
              key={c.id}
              href={categoryHref(type, c.slug)}
              className="card-hover flex items-start gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
                <CategoryIcon slug={c.slug} size={24} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold tracking-tight">{c.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)]">
                  <span className="font-num">{count}</span> tavsiye <ArrowRight size={12} />
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {yakinda.length > 0 && (
        <div className="mt-6">
          <Overline className="mb-3">Yakında</Overline>
          <div className="flex flex-wrap gap-2">
            {yakinda.map((c) => (
              // Bilinçli olarak bağlantı değil: içi boş bir kategori sayfası açmak,
              // yol haritasını göstermekten daha kötü bir deneyim.
              <span
                key={c.id}
                title={c.description}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--muted)]"
              >
                <CategoryIcon slug={c.slug} size={12} strokeWidth={2} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-10">
          <Overline className="mb-3">Şehre göre keşfet</Overline>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) =>
              categories.map((c) => (
                <Link
                  key={`${city}-${c.slug}`}
                  href={categoryHref(type, c.slug, slugify(city))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-2)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <MapPin size={12} />
                  {city} · {c.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Overline className="mb-4">En yüksek puanlılar</Overline>
        <ItemGrid items={top} />
      </div>
    </div>
  );
}
