import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { itemHref } from "@/lib/routes";
import { locationText, priceSummary } from "@/lib/format";
import { freshnessOf, freshnessWarning } from "@/lib/freshness";
import { cn } from "@/lib/cn";
import { CARD_BASE } from "./ui/Card";
import { CoverArt } from "./CoverArt";
import { ScoreRing } from "./ScoreRing";
import { BadgeChip } from "./BadgeChip";
import { StarRating } from "./StarRating";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";
import { VoteButtons } from "./VoteButtons";

export function ItemCard({ item }: { item: Item }) {
  const loc = locationText(item);
  const price = priceSummary(item);
  const visibleBadges = item.badges.filter((b) => b !== "sponsorlu").slice(0, 2);
  // Demo kayıtlarda doğrulama kavramı yok; tazelik uyarısı yalnızca gerçek katalogda.
  const tazelik = item.provenance.kind === "editor" ? freshnessOf(item) : "taze";

  return (
    <div
      // Listeleme testleri kartları buradan sayar (scripts/panel-check.mjs);
      // sınıf adları değiştiğinde kırılmayan tek tutamak bu.
      data-slug={item.slug}
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
        {/* Görsel: gerçek fotoğraf varsa o, yoksa kayda özel üretilmiş kapak.
            Yükseklik her iki durumda da sabit — düzen kayması olmuyor. */}
        <div className="h-28 overflow-hidden rounded-t-[13px]">
          {item.image ? (
            <Image
              src={item.image.url}
              alt={item.image.alt}
              width={480}
              height={280}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <CoverArt
              slug={item.slug}
              type={item.type}
              categorySlug={item.categorySlug}
              className="h-full w-full transition-transform duration-200 group-hover:scale-105"
            />
          )}
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
            <span className="flex shrink-0 flex-col items-center gap-0.5">
              <ScoreRing score={item.score} size={44} />
              {/* Puanın neye dayandığı kartta da görünür: editör notu ile topluluk
                  puanı aynı görünürse kullanıcı ikisini aynı sanır. */}
              {item.scoreBasis !== "topluluk" && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted-2)]">
                  {item.scoreBasis === "dis-sinyal" ? "Dış sinyal" : "Editör"}
                </span>
              )}
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <StarRating value={item.ratingAvg} count={item.ratingCount} small />
            {price && (
              <span className="flex items-center gap-1">
                {/* Bayat fiyatı sessizce güncelmiş gibi göstermek, yanlış fiyat
                    göstermenin en sinsi hâli. Kartta küçük bir işaret, detayda
                    tam açıklama. */}
                {tazelik === "bayat" && (
                  <Clock size={11} className="text-[var(--muted-2)]" aria-label="Fiyat doğrulama bekliyor" />
                )}
                <span
                  className={cn(
                    "font-num text-sm font-bold",
                    tazelik === "bayat" ? "text-[var(--muted)]" : "text-[var(--brand)]"
                  )}
                  title={tazelik === "bayat" ? (freshnessWarning(item) ?? undefined) : undefined}
                >
                  {price}
                </span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="border-t border-[var(--line)] px-4 py-2">
        <VoteButtons
          itemId={item.id}
          counts={{
            up: item.signals?.votesUp ?? 0,
            down: item.signals?.votesDown ?? 0,
            interest: item.signals?.votesInterest ?? 0,
          }}
          compact
        />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-1.5">
        <CompareButton item={{ slug: item.slug, type: item.type, title: item.title }} />
        <FavoriteButton item={{ slug: item.slug, type: item.type, title: item.title }} />
      </div>
    </div>
  );
}
