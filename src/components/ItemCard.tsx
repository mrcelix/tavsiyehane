import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { itemHref } from "@/lib/routes";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";
import { locationText, priceSummary } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CARD_BASE } from "./ui/Card";
import { ScoreRing } from "./ScoreRing";
import { BadgeChip } from "./BadgeChip";
import { StarRating } from "./StarRating";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";

export function ItemCard({ item }: { item: Item }) {
  const loc = locationText(item);
  const price = priceSummary(item);
  const visibleBadges = item.badges.filter((b) => b !== "sponsorlu").slice(0, 2);
  const accent = TYPE_ACCENT[item.type];

  return (
    <div
      className={cn(
        CARD_BASE,
        "card-hover group relative flex flex-col",
        item.isSponsored && "border-[var(--gold)] ring-1 ring-[color-mix(in_oklab,var(--gold)_35%,transparent)]"
      )}
    >
      {item.isSponsored && (
        <span className="absolute -top-2.5 left-4 z-10">
          <BadgeChip badge="sponsorlu" small />
        </span>
      )}

      <Link href={itemHref(item)} className="flex flex-1 flex-col">
        {/* İkon başlığı — kategori tipine göre renklenen sade zemin */}
        <div className={cn("flex h-24 items-center justify-center rounded-t-[13px]", accent.bg)}>
          <span className={cn("transition-transform duration-200 group-hover:scale-110", accent.text)}>
            <CategoryIcon slug={item.categorySlug} size={40} strokeWidth={1.5} />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          {visibleBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleBadges.map((b) => (
                <BadgeChip key={b} badge={b} small />
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight tracking-tight transition-colors group-hover:text-[var(--brand)]">
                {item.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--muted)]">
                <span className="font-semibold">{item.brand}</span>
                {loc && (
                  <>
                    <span className="text-[var(--muted-2)]">·</span>
                    <MapPin size={11} />
                    {loc}
                  </>
                )}
              </p>
            </div>
            <ScoreRing score={item.score} size={44} />
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <StarRating value={item.ratingAvg} count={item.ratingCount} small />
            {price && <span className="font-num text-sm font-bold text-[var(--brand)]">{price}</span>}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2">
        <CompareButton item={{ slug: item.slug, type: item.type, title: item.title }} />
        <FavoriteButton item={{ slug: item.slug, type: item.type, title: item.title }} />
      </div>
    </div>
  );
}
