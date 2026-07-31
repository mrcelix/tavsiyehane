import type { Metadata } from "next";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";
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
  return pageMetadata({ title: list.title, description: list.description, path: `/liste/${list.slug}`, type: "article" });
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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">En iyi listesi</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[32px]">{list.title}</h1>
      <p className="mt-2 text-[var(--muted)]">{list.description}</p>
      <p className="mt-2 text-xs text-[var(--muted-2)]">Son güncelleme: {formatDate(list.updatedAt)}</p>

      <ol className="mt-8 space-y-4">
        {items.map((item, idx) => (
          <li key={item.id}>
            <Link
              href={itemHref(item)}
              className={`card-hover flex gap-4 rounded-[14px] border bg-[var(--card)] p-5 shadow-[var(--shadow-card)] ${
                item.isSponsored
                  ? "border-[var(--gold)] ring-1 ring-[color-mix(in_oklab,var(--gold)_35%,transparent)]"
                  : "border-[var(--line)]"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] font-num font-bold text-white">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold">{item.title}</h2>
                  {item.badges.slice(0, 3).map((b) => (
                    <BadgeChip key={b} badge={b} small />
                  ))}
                </div>
                <p className="mt-1 text-xs text-[var(--muted-2)]">
                  {item.brand}
                  {locationText(item) ? ` · ${locationText(item)}` : ""}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{item.whyRecommended}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <StarRating value={item.ratingAvg} count={item.ratingCount} small />
                  {priceSummary(item) && (
                    <span className="font-num font-bold text-[var(--brand)]">{priceSummary(item)}</span>
                  )}
                </div>
              </div>
              <ScoreRing score={item.score} size={52} />
            </Link>
          </li>
        ))}
      </ol>

      {/* Sıralı liste — arama sonuçlarında "en iyi X" listeleri olarak tanınır */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: list.title,
            description: list.description,
            numberOfItems: items.length,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            itemListElement: items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.title,
              ...(SITE_URL ? { url: `${SITE_URL}${itemHref(item)}` } : {}),
            })),
          }),
        }}
      />
    </div>
  );
}
