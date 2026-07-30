import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/data";
import { formatDate, locationText, priceSummary } from "@/lib/format";
import { itemHref } from "@/lib/routes";
import { ScoreRing } from "@/components/ScoreRing";
import { BadgeChip } from "@/components/BadgeChip";
import { StarRating } from "@/components/StarRating";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundle();
  const list = bundle.lists.find((l) => l.slug === slug);
  if (!list) return {};
  return { title: list.title, description: list.description };
}

export default async function ListePage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getBundle();
  const list = bundle.lists.find((l) => l.slug === slug);
  if (!list) notFound();

  const items = list.itemSlugs
    .map((s) => bundle.items.find((i) => i.slug === s))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">En iyi listesi</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{list.title}</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">{list.description}</p>
      <p className="mt-2 text-xs text-zinc-400">Son güncelleme: {formatDate(list.updatedAt)}</p>

      <ol className="mt-8 space-y-4">
        {items.map((item, idx) => (
          <li key={item.id}>
            <Link
              href={itemHref(item)}
              className={`card-hover flex gap-4 rounded-2xl border bg-white p-5 dark:bg-zinc-900 ${
                item.isSponsored
                  ? "border-orange-300 ring-1 ring-orange-200 dark:border-orange-500/50 dark:ring-orange-500/20"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{item.title}</h2>
                  {item.badges.slice(0, 3).map((b) => (
                    <BadgeChip key={b} badge={b} small />
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {item.brand}
                  {locationText(item) ? ` · ${locationText(item)}` : ""}
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.whyRecommended}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <StarRating value={item.ratingAvg} count={item.ratingCount} small />
                  {priceSummary(item) && (
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{priceSummary(item)}</span>
                  )}
                </div>
              </div>
              <ScoreRing score={item.score} size={52} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
