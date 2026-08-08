import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Clock,
  Map,
  MapPin,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Store,
  Ticket,
  TrendingDown,
  X,
} from "lucide-react";
import { getBundle } from "@/lib/data";
import { alternativesFor } from "@/lib/query";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import { scoreBasisLabel, scoreToneLabel } from "@/lib/scoring";
import { freshnessOf, freshnessWarning } from "@/lib/freshness";
import { TYPE_LABELS, type Item } from "@/lib/types";
import { formatDate, formatPrice, locationText, priceSummary, slugify } from "@/lib/format";
import { categoryHref } from "@/lib/menu";
import { itemHref } from "@/lib/routes";
import { breadcrumbLd, jsonLd } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { CoverArt } from "./CoverArt";
import { ScoreRing } from "./ScoreRing";
import { BadgeChip } from "./BadgeChip";
import { StarRating } from "./StarRating";
import { BreakdownBars } from "./BreakdownBars";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { ItemGrid } from "./ItemGrid";
import { ReviewForm } from "./ReviewForm";
import { QuoteForm } from "./QuoteForm";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";
import { VoteButtons } from "./VoteButtons";
import { Badge } from "./ui/Badge";
import { Overline } from "./ui/Card";

const ATTRS_TITLE = { urun: "Teknik Özellikler", hizmet: "Hizmet Bilgileri", mekan: "Mekân Bilgileri" } as const;

const PANEL = "rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]";

export async function ItemDetail({ item }: { item: Item }) {
  const bundle = await getBundle();
  const category = bundle.categories.find((c) => c.slug === item.categorySlug);
  const tazelik = freshnessOf(item);
  const tazelikUyarisi = item.provenance.kind === "editor" ? freshnessWarning(item) : null;
  const reviews = bundle.reviews.filter((r) => r.itemId === item.id && r.status === "approved");
  const offers = bundle.offers.filter((o) => o.itemId === item.id).sort((a, b) => a.price - b.price);
  const history = bundle.priceHistory[item.id] ?? [];
  const alternatives = alternativesFor(bundle, item);
  const criteria = REVIEW_CRITERIA[item.type];
  const loc = locationText(item);

  const criteriaAvg = criteria.map((c) => {
    const vals = reviews.map((r) => r.criteria[c.key]).filter((v) => typeof v === "number");
    return { ...c, avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0 };
  });

  const mapsQuery =
    item.type === "mekan" ? encodeURIComponent(`${item.attrs["Adres"] ?? item.title} ${item.city ?? ""}`) : "";

  return (
    <div className="mx-auto max-w-[1220px] px-6 py-10">
      {/* Kırıntı */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted-2)]">
        <Link href={TYPE_LABELS[item.type].hub} className="py-1.5 transition-colors hover:text-[var(--brand)]">
          {TYPE_LABELS[item.type].plural}
        </Link>
        <span>/</span>
        <Link href={categoryHref(item.type, item.categorySlug)} className="py-1.5 transition-colors hover:text-[var(--brand)]">
          {category?.name}
        </Link>
        {loc && (
          <>
            <span>/</span>
            <span>{loc}</span>
          </>
        )}
      </nav>

      {/* Başlık kartı */}
      <div
        className={cn(
          "rounded-[14px] border bg-[var(--card)] p-6 shadow-[var(--shadow-card)]",
          item.isSponsored
            ? "border-[var(--gold)] ring-1 ring-[color-mix(in_oklab,var(--gold)_35%,transparent)]"
            : "border-[var(--line)]"
        )}
      >
        <div className="flex flex-col gap-5 sm:flex-row">
          {/* `self-start` yalnızca satır düzeninde (sm ve üstü): sütun düzeninde
              hizalamayı başa çekmek öğeyi germekten çıkarıp genişliğini içeriğe
              indiriyor ve görsel ince bir şeride dönüşüyordu. */}
          <figure className="m-0 w-full shrink-0 sm:w-auto sm:self-start">
            {item.image ? (
              <Image
                src={item.image.url}
                alt={item.image.alt}
                width={224}
                height={224}
                sizes="(max-width: 640px) 100vw, 224px"
                priority
                className="h-40 w-full rounded-[18px] object-cover sm:h-28 sm:w-28"
              />
            ) : (
              <CoverArt
                slug={item.slug}
                type={item.type}
                categorySlug={item.categorySlug}
                iconSize={52}
                className="h-40 w-full rounded-[18px] sm:h-28 sm:w-28"
              />
            )}
            {/* Telif künyesi görselin yanında durur; kaynağı bilinmeyen görsel yayımlanmaz. */}
            {item.image && (
              <figcaption className="mt-1.5 text-[10px] leading-tight text-[var(--muted-2)] sm:max-w-28">
                {item.image.sourceUrl ? (
                  <a href={item.image.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                    {item.image.credit}
                  </a>
                ) : (
                  item.image.credit
                )}{" "}
                · {item.image.license}
              </figcaption>
            )}
          </figure>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              {item.badges.map((b) => (
                <BadgeChip key={b} badge={b} />
              ))}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">{item.title}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink-2)]">{item.brand}</span>
              {loc && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {loc}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} /> Son güncelleme: {formatDate(item.updatedAt)}
              </span>
            </p>
            <p className="mt-3 leading-relaxed text-[var(--ink-2)]">{item.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <StarRating value={item.ratingAvg} count={item.ratingCount} />
              {priceSummary(item) && (
                <span className="font-num text-lg font-bold text-[var(--brand)]">{priceSummary(item)}</span>
              )}
              <CompareButton item={{ slug: item.slug, type: item.type, title: item.title }} />
              <FavoriteButton item={{ slug: item.slug, type: item.type, title: item.title }} large />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 self-start">
            <ScoreRing score={item.score} size={84} />
            <span className="text-center text-xs font-bold text-[var(--ink-2)]">{scoreToneLabel(item)}</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-2)]">
              {scoreBasisLabel(item).kisa}
            </span>
          </div>
        </div>

        {/* Puanın dayanağı ve doğrulama — hangi bilgiye güvendiğimiz gizlenmez */}
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[var(--line)] p-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-1.5">
            <ShieldCheck size={14} className="mt-px shrink-0 text-[var(--brand)]" />
            <span>{scoreBasisLabel(item).aciklama}</span>
          </span>
          {item.provenance.kind === "demo" ? (
            <Badge variant="down" className="shrink-0 self-start">
              Örnek veri
            </Badge>
          ) : (
            item.provenance.verifiedAt && (
              <span
                className={cn(
                  "shrink-0 font-medium",
                  tazelik === "bayat"
                    ? "text-[var(--down)]"
                    : tazelik === "eskiyor"
                      ? "text-[var(--gold-ink)]"
                      : "text-[var(--ink-2)]"
                )}
              >
                Doğrulandı: {formatDate(item.provenance.verifiedAt)}
              </span>
            )
          )}
        </div>

        {/* Tazelik uyarısı. Bayat kayıt gizlenmez, bayat olduğu söylenir —
            bilgiyi saklamak yanlış bilgi göstermek kadar kötü. */}
        {tazelikUyarisi && (
          <p
            className={cn(
              "mt-2 flex items-start gap-1.5 rounded-xl p-3 text-xs leading-relaxed",
              tazelik === "bayat"
                ? "bg-[var(--down-soft)] text-[var(--down)]"
                : "bg-[var(--gold-soft)] text-[var(--gold-ink)]"
            )}
          >
            <Clock size={13} className="mt-0.5 shrink-0" />
            {tazelikUyarisi}
          </p>
        )}

        {item.provenance.sources && item.provenance.sources.length > 0 && (
          <div className="mt-2 text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink-2)]">Kaynaklar: </span>
            {item.provenance.sources.map((s, i) => (
              <span key={s.label + i}>
                {i > 0 && " · "}
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-block py-1 underline decoration-dotted underline-offset-2 hover:text-[var(--brand)]"
                  >
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
                {s.checkedAt && ` (${formatDate(s.checkedAt)})`}
              </span>
            ))}
          </div>
        )}

        {/* Topluluk oyu — puanın en ağır bileşeni */}
        <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Sen ne dersin?</p>
          <VoteButtons
            itemId={item.id}
            counts={{
              up: item.signals?.votesUp ?? 0,
              down: item.signals?.votesDown ?? 0,
              interest: item.signals?.votesInterest ?? 0,
            }}
          />
          {item.scoreBasis === "editor" && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Bu kategoride topluluk verisi henüz toplanıyor. İlk oylar buradan gelecek.
            </p>
          )}
        </div>

        {/* Neden tavsiye ediyoruz */}
        <div className="mt-4 rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-[var(--brand-ink)]">
          <span className="font-bold">Neden tavsiye ediyoruz? </span>
          {item.whyRecommended}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sol kolon */}
        <div className="space-y-6 lg:col-span-2">
          {/* Artılar / Eksiler */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[color-mix(in_oklab,var(--up)_30%,transparent)] bg-[var(--up-soft)] p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-[var(--up)]">
                <Check size={17} /> Avantajlar
              </h2>
              <ul className="space-y-2 text-sm text-[var(--ink-2)]">
                {item.pros.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-[var(--up)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[14px] border border-[color-mix(in_oklab,var(--down)_30%,transparent)] bg-[var(--down-soft)] p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-[var(--down)]">
                <Minus size={17} /> Dezavantajlar
              </h2>
              <ul className="space-y-2 text-sm text-[var(--ink-2)]">
                {item.cons.map((c) => (
                  <li key={c} className="flex gap-2">
                    <X size={15} className="mt-0.5 shrink-0 text-[var(--down)]" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Kimler için */}
          <section className={PANEL}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h2 className="mb-2.5 text-base font-bold">Kimler için uygun?</h2>
                <div className="flex flex-wrap gap-1.5">
                  {item.suitableFor.map((s) => (
                    <Badge key={s} variant="up">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-2.5 text-base font-bold">Kimler için uygun değil?</h2>
                <div className="flex flex-wrap gap-1.5">
                  {item.notSuitableFor.map((s) => (
                    <Badge key={s} variant="neutral">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tipe özel alanlar */}
          <section className={PANEL}>
            <h2 className="mb-3 text-base font-bold">{ATTRS_TITLE[item.type]}</h2>
            <dl className="divide-y divide-[var(--line)] text-sm">
              {Object.entries(item.attrs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted)]">{k}</dt>
                  <dd className="text-right font-semibold text-[var(--ink-2)]">{v}</dd>
                </div>
              ))}
            </dl>
            {item.type === "mekan" && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--mist-2)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--line)]"
              >
                <Map size={15} /> Haritada göster
              </a>
            )}
          </section>

          {/* Ürün: satıcılar + fiyat geçmişi */}
          {item.type === "urun" && offers.length > 0 && (
            <section className={PANEL}>
              <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold">
                <Store size={17} className="text-[var(--brand)]" /> Satıcılar ve Güncel Fiyatlar
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-left text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      <th className="py-2 pr-3 font-semibold">Satıcı</th>
                      <th className="py-2 pr-3 font-semibold">Satıcı Puanı</th>
                      <th className="py-2 pr-3 font-semibold">Stok</th>
                      <th className="py-2 text-right font-semibold">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {offers.map((o, i) => (
                      <tr key={o.id}>
                        <td className="py-2.5 pr-3 font-semibold text-[var(--ink-2)]">
                          {o.sellerName}
                          {i === 0 && o.inStock && (
                            <span className="ml-2">
                              <Badge variant="up">En uygun</Badge>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 font-num text-[var(--ink-2)]">{o.sellerRating.toFixed(1)}/10</td>
                        <td className="py-2.5 pr-3">
                          {o.inStock ? (
                            <span className="font-semibold text-[var(--up)]">Stokta</span>
                          ) : (
                            <span className="font-semibold text-[var(--down)]">Tükendi</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-num font-bold text-[var(--ink)]">{formatPrice(o.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.length > 1 && (
                <div className="mt-5">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                    <TrendingDown size={15} className="text-[var(--brand)]" /> Fiyat Geçmişi
                  </h3>
                  <PriceHistoryChart points={history} />
                </div>
              )}
            </section>
          )}

          {/* Yorumlar */}
          <section className={PANEL}>
            <h2 className="text-base font-bold">Kullanıcı Değerlendirmeleri ({reviews.length})</h2>
            <p className="mb-4 mt-1 text-xs text-[var(--muted-2)]">
              Doğrulanmış yorumlar puana daha yüksek ağırlıkla yansır. Kriterler kategoriye özeldir.
            </p>

            {criteriaAvg.some((c) => c.avg > 0) && (
              <div className="mb-5 grid gap-2 rounded-xl bg-[var(--mist)] p-4 sm:grid-cols-2">
                {criteriaAvg.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{c.label}</span>
                    <StarRating value={Math.round(c.avg * 10) / 10} small />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {reviews.map((r) => (
                <article key={r.id} className="rounded-xl border border-[var(--line)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--ink)]">{r.userName}</span>
                    {r.isVerified && (
                      <Badge variant="up">
                        <BadgeCheck size={11} />
                        Doğrulanmış {item.type === "urun" ? "satın alma" : item.type === "hizmet" ? "işlem" : "ziyaret"}
                      </Badge>
                    )}
                    <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-1.5">
                    <StarRating value={r.rating} small />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{r.comment}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <h3 className="mb-3 text-base font-bold">Deneyiminizi paylaşın</h3>
              <ReviewForm itemId={item.id} type={item.type} />
            </div>
          </section>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-6">
          <section className={PANEL}>
            <h2 className="text-base font-bold">Puan Nasıl Oluştu?</h2>
            <p className="mb-4 mt-1 text-xs text-[var(--muted-2)]">
              {TYPE_LABELS[item.type].singular} kategorisinin ağırlıklı puanlama modeli
            </p>
            <BreakdownBars item={item} />
          </section>

          {item.type === "hizmet" && (
            <section className="rounded-[14px] border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] p-5">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-[var(--brand-ink)]">
                <Ticket size={17} /> Teklif Al
              </h2>
              <p className="mb-3 mt-1 text-xs text-[var(--brand-ink)] opacity-80">
                {item.brand} firmasından ücretsiz fiyat teklifi isteyin.
              </p>
              <QuoteForm itemId={item.id} businessName={item.brand} />
            </section>
          )}

          {item.type === "mekan" && (
            <section className={cn(PANEL, "text-sm")}>
              <h2 className="mb-2 text-base font-bold">Ziyaret Bilgisi</h2>
              {item.attrs["Çalışma Saatleri"] && (
                <p className="flex justify-between gap-3 py-1">
                  <span className="text-[var(--muted)]">Saatler</span>
                  <span className="text-right font-semibold">{item.attrs["Çalışma Saatleri"]}</span>
                </p>
              )}
              {item.attrs["Rezervasyon"] && (
                <p className="flex justify-between gap-3 py-1">
                  <span className="text-[var(--muted)]">Rezervasyon</span>
                  <span className="text-right font-semibold">{item.attrs["Rezervasyon"]}</span>
                </p>
              )}
              {item.priceLevel && (
                <p className="flex justify-between gap-3 py-1">
                  <span className="text-[var(--muted)]">Fiyat seviyesi</span>
                  <span className="font-num font-semibold">
                    {"₺".repeat(item.priceLevel)}
                    <span className="text-[var(--muted-2)]">{"₺".repeat(4 - item.priceLevel)}</span>
                  </span>
                </p>
              )}
            </section>
          )}

          {item.isSponsored && (
            <p className="flex gap-2 rounded-[14px] bg-[var(--gold-soft)] p-4 text-xs leading-relaxed text-[var(--gold-ink)]">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>
                <strong>Sponsorlu içerik:</strong> Bu işletme görünürlük için ücret ödemiştir. Tavsiye puanı ve sıralama
                bundan etkilenmez.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Alternatifler */}
      {alternatives.length > 0 && (
        <section className="mt-12">
          <Overline className="mb-4">Alternatifler</Overline>
          <ItemGrid items={alternatives} />
        </section>
      )}

      {/* Kırıntı yolu — arama sonuçlarında hiyerarşiyi gösterir */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Ana sayfa", path: "/" },
              { name: TYPE_LABELS[item.type].plural, path: TYPE_LABELS[item.type].hub },
              { name: category?.name ?? "", path: categoryHref(item.type, item.categorySlug) },
              { name: item.title, path: itemHref(item) },
            ])
          ),
        }}
      />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            item.type === "urun"
              ? {
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: item.title,
                  description: item.description,
                  brand: { "@type": "Brand", name: item.brand },
                  ...(item.ratingCount
                    ? {
                        aggregateRating: {
                          "@type": "AggregateRating",
                          ratingValue: item.ratingAvg,
                          reviewCount: item.ratingCount,
                          bestRating: 5,
                        },
                      }
                    : {}),
                  ...(offers.length
                    ? {
                        offers: {
                          "@type": "AggregateOffer",
                          priceCurrency: "TRY",
                          lowPrice: Math.min(...offers.map((o) => o.price)),
                          highPrice: Math.max(...offers.map((o) => o.price)),
                          offerCount: offers.length,
                        },
                      }
                    : {}),
                }
              : {
                  "@context": "https://schema.org",
                  "@type": "LocalBusiness",
                  name: item.title,
                  description: item.description,
                  ...(item.city
                    ? {
                        address: {
                          "@type": "PostalAddress",
                          addressLocality: item.district ?? item.city,
                          addressRegion: item.city,
                          addressCountry: "TR",
                        },
                      }
                    : {}),
                  ...(item.ratingCount
                    ? {
                        aggregateRating: {
                          "@type": "AggregateRating",
                          ratingValue: item.ratingAvg,
                          reviewCount: item.ratingCount,
                          bestRating: 5,
                        },
                      }
                    : {}),
                }
          ),
        }}
      />
    </div>
  );
}

export async function findItemOr404(prefixType: Item["type"], slug: string): Promise<Item | null> {
  const bundle = await getBundle();
  return bundle.items.find((i) => i.slug === slugify(slug) && i.type === prefixType) ?? null;
}
