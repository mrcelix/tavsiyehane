import Link from "next/link";
import type { Category, Item } from "@/lib/types";
import { itemHref, TYPE_GRADIENT } from "@/lib/routes";
import { locationText, priceSummary } from "@/lib/format";
import { ScoreRing } from "./ScoreRing";
import { BadgeChip } from "./BadgeChip";
import { StarRating } from "./StarRating";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";

export function ItemCard({ item, category }: { item: Item; category?: Category }) {
  const loc = locationText(item);
  const price = priceSummary(item);
  const visibleBadges = item.badges.filter((b) => b !== "sponsorlu").slice(0, 2);

  return (
    <div
      className={`card-hover group relative flex flex-col rounded-2xl border bg-white dark:bg-zinc-900 ${
        item.isSponsored
          ? "border-orange-300 ring-1 ring-orange-200 dark:border-orange-500/50 dark:ring-orange-500/20"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {item.isSponsored && (
        <span className="absolute -top-2.5 left-4 z-10">
          <BadgeChip badge="sponsorlu" small />
        </span>
      )}

      <Link href={itemHref(item)} className="flex flex-1 flex-col">
        <div className={`flex h-28 items-center justify-center rounded-t-2xl bg-gradient-to-br text-5xl ${TYPE_GRADIENT[item.type]}`}>
          <span className="transition-transform duration-200 group-hover:scale-110">{category?.icon ?? "📦"}</span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {visibleBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleBadges.map((b) => (
                <BadgeChip key={b} badge={b} small />
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {item.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {item.brand}
                {loc ? ` · ${loc}` : ""}
              </p>
            </div>
            <ScoreRing score={item.score} size={44} />
          </div>

          <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <StarRating value={item.ratingAvg} count={item.ratingCount} small />
            {price && <span className="font-bold text-indigo-600 dark:text-indigo-400">{price}</span>}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
        <CompareButton item={{ slug: item.slug, type: item.type, title: item.title }} />
        <FavoriteButton item={{ slug: item.slug, type: item.type, title: item.title }} />
      </div>
    </div>
  );
}
