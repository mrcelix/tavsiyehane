import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getBundle } from "@/lib/data";
import { formatPrice, locationText, priceSummary, formatDate } from "@/lib/format";
import { itemHref } from "@/lib/routes";
import type { Item } from "@/lib/types";
import { ScoreRing } from "@/components/ScoreRing";
import { BadgeChip } from "@/components/BadgeChip";
import { StarRating } from "@/components/StarRating";

export const metadata: Metadata = pageMetadata({
  title: "Karşılaştır",
  description: "Ürün, hizmet ve mekânları yan yana karşılaştırın: fiyat, özellikler, artılar ve eksiler tek tabloda.",
  path: "/karsilastir",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-[var(--line)]">
      <th className="w-44 bg-[var(--mist)] px-4 py-3 text-left align-top text-sm font-semibold text-[var(--muted)]">
        {label}
      </th>
      {children}
    </tr>
  );
}

export default async function KarsilastirPage({ searchParams }: Props) {
  const { ids } = await searchParams;
  const bundle = await getBundle();
  const slugs = (ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const items = slugs.map((s) => bundle.items.find((i) => i.slug === s)).filter((i): i is Item => Boolean(i)).slice(0, 4);

  if (items.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-5xl">⚖️</div>
        <h1 className="mt-4 text-2xl font-extrabold">Karşılaştırma</h1>
        <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
          Karşılaştırmak için listelerdeki kartlarda <strong>&quot;+ Karşılaştır&quot;</strong> düğmesini kullanın (aynı tipten 2-4 seçim).
          Seçimleriniz sayfanın altındaki şeritte birikir.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/urunler" className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-ink)]">Ürünlere git</Link>
          <Link href="/hizmetler" className="rounded-lg bg-[var(--mist-2)] px-4 py-2 text-sm font-semibold hover:bg-[var(--line)]">Hizmetlere git</Link>
          <Link href="/mekanlar" className="rounded-lg bg-[var(--mist-2)] px-4 py-2 text-sm font-semibold hover:bg-[var(--line)]">Mekânlara git</Link>
        </div>
      </div>
    );
  }

  const type = items[0].type;
  const attrKeys = [...new Set(items.flatMap((i) => Object.keys(i.attrs)))];
  const catMap = new Map(bundle.categories.map((c) => [c.slug, c]));

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Karşılaştırma</h1>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        {items.length} {type === "urun" ? "ürün" : type === "hizmet" ? "hizmet" : "mekân"} yan yana — kriterler kategori tipine göre düzenlenir.
      </p>

      <div className="mt-6 overflow-x-auto rounded-[14px] border border-[var(--line)] bg-[var(--card)]">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="w-44 bg-[var(--mist)]" />
              {items.map((it) => (
                <th key={it.id} className="px-4 py-4 text-left align-top">
                  <div className="text-3xl">{catMap.get(it.categorySlug)?.icon}</div>
                  <Link href={itemHref(it)} className="mt-1 block font-bold leading-snug hover:text-[var(--brand)]">
                    {it.title}
                  </Link>
                  <p className="mt-0.5 text-xs font-normal text-[var(--muted-2)]">
                    {it.brand}
                    {locationText(it) ? ` · ${locationText(it)}` : ""}
                  </p>
                  {it.isSponsored && <div className="mt-1"><BadgeChip badge="sponsorlu" small /></div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <Row label="Tavsiye puanı">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3"><ScoreRing score={it.score} size={52} /></td>
              ))}
            </Row>
            <Row label="Kullanıcı puanı">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3"><StarRating value={it.ratingAvg} count={it.ratingCount} small /></td>
              ))}
            </Row>
            <Row label={type === "mekan" ? "Fiyat seviyesi" : type === "hizmet" ? "Fiyat aralığı" : "Fiyat"}>
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3 font-bold text-[var(--brand)]">{priceSummary(it) || "—"}</td>
              ))}
            </Row>
            {type === "urun" && (
              <Row label="En uygun satıcı">
                {items.map((it) => {
                  const offers = bundle.offers.filter((o) => o.itemId === it.id && o.inStock).sort((a, b) => a.price - b.price);
                  const best = offers[0];
                  return (
                    <td key={it.id} className="px-4 py-3">
                      {best ? (
                        <>
                          <span className="font-medium">{best.sellerName}</span>
                          <span className="block text-xs text-[var(--muted-2)]">{formatPrice(best.price)} · ⭐ {best.sellerRating.toFixed(1)}</span>
                        </>
                      ) : "—"}
                    </td>
                  );
                })}
              </Row>
            )}
            <Row label="Rozetler">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {it.badges.filter((b) => b !== "sponsorlu").map((b) => <BadgeChip key={b} badge={b} small />)}
                  </div>
                </td>
              ))}
            </Row>
            <Row label="Avantajlar">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3">
                  <ul className="space-y-1">
                    {it.pros.slice(0, 4).map((p) => (
                      <li key={p} className="flex gap-1.5"><span className="text-[var(--up)]">✓</span>{p}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </Row>
            <Row label="Dezavantajlar">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3">
                  <ul className="space-y-1">
                    {it.cons.slice(0, 3).map((c) => (
                      <li key={c} className="flex gap-1.5"><span className="text-[var(--down)]">✗</span>{c}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </Row>
            <Row label="Kimler için">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3 text-[var(--muted)]">{it.suitableFor.join(", ")}</td>
              ))}
            </Row>
            {attrKeys.map((k) => (
              <Row key={k} label={k}>
                {items.map((it) => (
                  <td key={it.id} className="px-4 py-3">{it.attrs[k] ?? "—"}</td>
                ))}
              </Row>
            ))}
            <Row label="Son güncelleme">
              {items.map((it) => (
                <td key={it.id} className="px-4 py-3 text-[var(--muted-2)]">{formatDate(it.updatedAt)}</td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}
