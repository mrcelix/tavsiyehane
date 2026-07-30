import Link from "next/link";
import { getBundle } from "@/lib/data";
import { alternativesFor } from "@/lib/query";
import { REVIEW_CRITERIA } from "@/lib/criteria";
import { SCORE_TONE_LABEL, scoreTone } from "@/lib/scoring";
import { TYPE_LABELS, type Item } from "@/lib/types";
import { formatDate, formatPrice, locationText, priceSummary, slugify } from "@/lib/format";
import { TYPE_GRADIENT } from "@/lib/routes";
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

const ATTRS_TITLE = { urun: "Teknik Özellikler", hizmet: "Hizmet Bilgileri", mekan: "Mekân Bilgileri" } as const;

export async function ItemDetail({ item }: { item: Item }) {
  const bundle = await getBundle();
  const category = bundle.categories.find((c) => c.slug === item.categorySlug);
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

  const hubHref = TYPE_LABELS[item.type].hub;
  const catHref =
    item.type === "urun"
      ? `${hubHref}/${item.categorySlug}`
      : item.type === "hizmet"
        ? `${hubHref}/tumu/${item.categorySlug}`
        : `${hubHref}/tumu/tumu/${item.categorySlug}`;

  const mapsQuery = item.type === "mekan" ? encodeURIComponent(`${item.attrs["Adres"] ?? item.title} ${item.city ?? ""}`) : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Kırıntı */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-zinc-400">
        <Link href={hubHref} className="hover:text-indigo-600">{TYPE_LABELS[item.type].plural}</Link>
        <span>/</span>
        <Link href={catHref} className="hover:text-indigo-600">{category?.name}</Link>
        {loc && (
          <>
            <span>/</span>
            <span>{loc}</span>
          </>
        )}
      </nav>

      {/* Başlık kartı */}
      <div
        className={`rounded-2xl border bg-white p-6 dark:bg-zinc-900 ${
          item.isSponsored
            ? "border-orange-300 ring-1 ring-orange-200 dark:border-orange-500/50 dark:ring-orange-500/20"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className={`flex h-28 w-28 shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-br text-6xl ${TYPE_GRADIENT[item.type]}`}>
            {category?.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              {item.badges.map((b) => (
                <BadgeChip key={b} badge={b} small />
              ))}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {item.brand}
              {loc ? ` · ${loc}` : ""} · Son güncelleme: {formatDate(item.updatedAt)}
            </p>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{item.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <StarRating value={item.ratingAvg} count={item.ratingCount} />
              {priceSummary(item) && (
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{priceSummary(item)}</span>
              )}
              <CompareButton item={{ slug: item.slug, type: item.type, title: item.title }} />
              <FavoriteButton item={{ slug: item.slug, type: item.type, title: item.title }} large />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1 self-start">
            <ScoreRing score={item.score} size={84} />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{SCORE_TONE_LABEL[scoreTone(item.score)]}</span>
            <span className="text-[10px] text-zinc-400">Tavsiye Puanı</span>
          </div>
        </div>

        {/* Neden tavsiye ediyoruz */}
        <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20">
          <span className="font-bold">Neden tavsiye ediyoruz? </span>
          {item.whyRecommended}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sol kolon */}
        <div className="space-y-6 lg:col-span-2">
          {/* Artılar / Eksiler */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/5">
              <h2 className="mb-3 font-bold text-emerald-700 dark:text-emerald-400">Avantajlar</h2>
              <ul className="space-y-2 text-sm">
                {item.pros.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-500/30 dark:bg-rose-500/5">
              <h2 className="mb-3 font-bold text-rose-700 dark:text-rose-400">Dezavantajlar</h2>
              <ul className="space-y-2 text-sm">
                {item.cons.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-rose-500">✗</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Kimler için */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="mb-2 font-bold">Kimler için uygun?</h2>
                <div className="flex flex-wrap gap-1.5">
                  {item.suitableFor.map((s) => (
                    <span key={s} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-2 font-bold">Kimler için uygun değil?</h2>
                <div className="flex flex-wrap gap-1.5">
                  {item.notSuitableFor.map((s) => (
                    <span key={s} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tipe özel alanlar */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-bold">{ATTRS_TITLE[item.type]}</h2>
            <dl className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
              {Object.entries(item.attrs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {item.type === "mekan" && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-semibold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                🗺️ Haritada göster
              </a>
            )}
          </section>

          {/* Ürün: satıcılar + fiyat geçmişi */}
          {item.type === "urun" && offers.length > 0 && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 font-bold">Satıcılar ve Güncel Fiyatlar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-700">
                      <th className="py-2 pr-3">Satıcı</th>
                      <th className="py-2 pr-3">Satıcı Puanı</th>
                      <th className="py-2 pr-3">Stok</th>
                      <th className="py-2 text-right">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {offers.map((o, i) => (
                      <tr key={o.id}>
                        <td className="py-2.5 pr-3 font-medium">
                          {o.sellerName}
                          {i === 0 && o.inStock && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              En uygun
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums">⭐ {o.sellerRating.toFixed(1)}/10</td>
                        <td className="py-2.5 pr-3">
                          {o.inStock ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Stokta</span>
                          ) : (
                            <span className="text-rose-500">Tükendi</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-bold tabular-nums">{formatPrice(o.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.length > 1 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-bold">Fiyat Geçmişi</h3>
                  <PriceHistoryChart points={history} />
                </div>
              )}
            </section>
          )}

          {/* Yorumlar */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1 font-bold">Kullanıcı Değerlendirmeleri ({reviews.length})</h2>
            <p className="mb-4 text-xs text-zinc-400">
              Doğrulanmış yorumlar puana daha yüksek ağırlıkla yansır. Kriterler kategoriye özeldir.
            </p>

            {criteriaAvg.some((c) => c.avg > 0) && (
              <div className="mb-5 grid gap-2 rounded-xl bg-zinc-50 p-4 sm:grid-cols-2 dark:bg-zinc-800/50">
                {criteriaAvg.map((c) => (
                  <div key={c.key} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{c.label}</span>
                    <StarRating value={Math.round(c.avg * 10) / 10} small />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {reviews.map((r) => (
                <article key={r.id} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.userName}</span>
                    {r.isVerified && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
                        ✓ Doğrulanmış {item.type === "urun" ? "satın alma" : item.type === "hizmet" ? "işlem" : "ziyaret"}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-zinc-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-1">
                    <StarRating value={r.rating} small />
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{r.comment}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <h3 className="mb-3 font-bold">Deneyiminizi paylaşın</h3>
              <ReviewForm itemId={item.id} type={item.type} />
            </div>
          </section>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1 font-bold">Puan Nasıl Oluştu?</h2>
            <p className="mb-4 text-xs text-zinc-400">
              {TYPE_LABELS[item.type].singular} kategorisinin ağırlıklı puanlama modeli
            </p>
            <BreakdownBars item={item} />
          </section>

          {item.type === "hizmet" && (
            <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/5">
              <h2 className="mb-1 font-bold">Teklif Al</h2>
              <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                {item.brand} firmasından ücretsiz fiyat teklifi isteyin.
              </p>
              <QuoteForm businessName={item.brand} />
            </section>
          )}

          {item.type === "mekan" && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-2 font-bold">Ziyaret Bilgisi</h2>
              {item.attrs["Çalışma Saatleri"] && (
                <p className="flex justify-between py-1"><span className="text-zinc-500">Saatler</span><span className="text-right font-medium">{item.attrs["Çalışma Saatleri"]}</span></p>
              )}
              {item.attrs["Rezervasyon"] && (
                <p className="flex justify-between py-1"><span className="text-zinc-500">Rezervasyon</span><span className="text-right font-medium">{item.attrs["Rezervasyon"]}</span></p>
              )}
              {item.priceLevel && (
                <p className="flex justify-between py-1"><span className="text-zinc-500">Fiyat seviyesi</span><span className="font-medium">{"₺".repeat(item.priceLevel)}<span className="text-zinc-300 dark:text-zinc-600">{"₺".repeat(4 - item.priceLevel)}</span></span></p>
              )}
            </section>
          )}

          {item.isSponsored && (
            <p className="rounded-xl bg-orange-50 p-4 text-xs text-orange-800 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30">
              <strong>Sponsorlu içerik:</strong> Bu işletme görünürlük için ücret ödemiştir. Tavsiye puanı ve sıralama bundan etkilenmez.
            </p>
          )}
        </div>
      </div>

      {/* Alternatifler */}
      {alternatives.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">Alternatifler</h2>
          <ItemGrid items={alternatives} categories={bundle.categories} />
        </section>
      )}

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
                    ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.ratingAvg, reviewCount: item.ratingCount, bestRating: 5 } }
                    : {}),
                  ...(offers.length
                    ? { offers: { "@type": "AggregateOffer", priceCurrency: "TRY", lowPrice: Math.min(...offers.map((o) => o.price)), highPrice: Math.max(...offers.map((o) => o.price)), offerCount: offers.length } }
                    : {}),
                }
              : {
                  "@context": "https://schema.org",
                  "@type": "LocalBusiness",
                  name: item.title,
                  description: item.description,
                  ...(item.city ? { address: { "@type": "PostalAddress", addressLocality: item.district ?? item.city, addressRegion: item.city, addressCountry: "TR" } } : {}),
                  ...(item.ratingCount
                    ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.ratingAvg, reviewCount: item.ratingCount, bestRating: 5 } }
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
