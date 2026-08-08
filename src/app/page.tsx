import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Handshake, MapPinned, Package, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { getBundle } from "@/lib/data";
import { sortItems } from "@/lib/query";
import { categoryHref } from "@/lib/menu";
import { itemHref } from "@/lib/routes";
import { liveCategories } from "@/lib/categories";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { jsonLd, pageMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import { HeroExplorer, type HeroCategory } from "@/components/HeroExplorer";
import { RotatingWord } from "@/components/RotatingWord";
import { ItemGrid } from "@/components/ItemGrid";
import { Overline } from "@/components/ui/Card";

// Her kelimenin kendi gradyanı ve ışıması var (§6.1).
const HERO_WORDS = [
  {
    word: "Ne alacağına",
    gradient: "linear-gradient(90deg, #8E97FF 0%, #C7CEE8 100%)",
    glow: "rgba(58,69,224,.55)",
  },
  {
    word: "Kimi seçeceğine",
    gradient: "linear-gradient(90deg, #4ADE80 0%, #C7F9DA 100%)",
    glow: "rgba(21,162,74,.45)",
  },
  {
    word: "Nereye gideceğine",
    gradient: "linear-gradient(90deg, #EFA013 0%, #FFE1A6 100%)",
    glow: "rgba(239,160,19,.5)",
  },
];

const EXAMPLE_QUERIES = [
  "25.000 TL altı telefon",
  "Alerjik kediler için mama",
  "İstanbul ev temizliği",
  "Uzaktan çalışmaya uygun kafe",
  "Çocuklu aileye otel",
];

const MODELS: { type: ItemType; icon: React.ReactNode; title: string; text: string }[] = [
  {
    type: "urun",
    icon: <Package size={20} />,
    title: "Ürünler",
    text: "%25 fiyat-performans, %20 kullanıcı memnuniyeti, %15 teknik özellikler, %15 satıcı güvenilirliği; kalanı garanti, fiyat güncelliği ve editör.",
  },
  {
    type: "hizmet",
    icon: <Handshake size={20} />,
    title: "Hizmetler",
    text: "%25 doğrulanmış müşteri değerlendirmesi, %20 uzmanlık ve deneyim, %15 şikâyet çözümü, %15 fiyat şeffaflığı; kalanı ulaşılabilirlik, belge ve editör.",
  },
  {
    type: "mekan",
    icon: <MapPinned size={20} />,
    title: "Mekânlar",
    text: "%25 son dönem kullanıcı ilgisi, %20 değerlendirme kalitesi, %15 güncellik, %15 amaca uygunluk; kalanı fiyat, konum ve editör.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const bundle = await getBundle();
  // Kategori liderleri: her kategoride birinci sıradakiler, puana göre.
  const editorPicks = sortItems(
    bundle.items.filter((i) => i.categoryRank === 1),
    "puan"
  ).slice(0, 4);

  const typeCounts = (t: ItemType) => bundle.items.filter((i) => i.type === t).length;
  const yayindaki = liveCategories(bundle.categories);

  // Hero güven şeridi — sayılar demo veriden gerçek olarak hesaplanır.
  const rated = bundle.items.filter((i) => i.ratingCount > 0);
  const avgRating = rated.length
    ? Math.round((rated.reduce((s, i) => s + i.ratingAvg, 0) / rated.length) * 10) / 10
    : 0;
  const HERO_STATS = [
    { icon: BadgeCheck, value: String(bundle.items.length), label: "incelenmiş tavsiye" },
    { icon: Users, value: String(bundle.reviews.length), label: "kullanıcı değerlendirmesi" },
    { icon: Star, value: avgRating.toFixed(1).replace(".", ","), label: "ortalama kullanıcı puanı" },
    { icon: ShieldCheck, value: String(yayindaki.length), label: "kategoride şeffaf puanlama" },
  ];

  /*
   * Hero keşif kartı için kompakt veri — tüm bundle istemciye taşınmaz.
   * Kategori başına yalnızca ilk beş kayıt ve kaydın kartta görünen alanları
   * gidiyor. Yalnızca yayındaki kategoriler: kart kullanıcıyı boş bir sayfaya
   * götürmemeli.
   */
  const heroCategories: HeroCategory[] = yayindaki.map((c) => {
    const kayitlar = sortItems(
      bundle.items.filter((i) => i.categorySlug === c.slug),
      "puan"
    );
    return {
      slug: c.slug,
      name: c.name,
      type: c.type,
      count: kayitlar.length,
      href: categoryHref(c.type, c.slug),
      top: kayitlar.slice(0, 5).map((i) => ({
        slug: i.slug,
        title: i.title,
        brand: i.brand,
        score: i.score,
        href: itemHref(i),
      })),
    };
  });

  return (
    <div>
      {/* Site geneli yapılandırılmış veri: arama kutusu ve yayıncı kimliği */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              inLanguage: "tr-TR",
              ...(SITE_URL ? { url: SITE_URL } : {}),
              ...(SITE_URL
                ? {
                    potentialAction: {
                      "@type": "SearchAction",
                      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/ara?q={search_term_string}` },
                      "query-input": "required name=search_term_string",
                    },
                  }
                : {}),
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              description: SITE_TAGLINE,
              ...(SITE_URL ? { url: SITE_URL, logo: `${SITE_URL}/og.png` } : {}),
            },
          ]),
        }}
      />

      {/* Hero — §1.3'teki token dışı sabit renkler; her iki temada da koyu kalır */}
      <section
        className="relative overflow-hidden py-12 sm:py-16"
        style={{ background: "linear-gradient(165deg, #16203A 0%, #1E2B4D 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(58,69,224,.28), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-4 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(239,160,19,.16), transparent 70%)" }}
        />

        {/* İki sütun: solda mesaj, sağda canlı keşif kartı. Dar ekranda alt alta
            düşer. Kart iki panelli olduğu için mesajdan geniş: eski formun 420px
            sütununda kategori listesi ile ilk beş yan yana sığmıyor. */}
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-10 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="text-center lg:text-left">
            <h1 className="text-[34px] font-black leading-tight tracking-tight text-white md:text-[40px]">
              <RotatingWord items={HERO_WORDS} />
              <br />
              kolay karar ver
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg lg:mx-0" style={{ color: "#B6BEDC" }}>
              Ürün, hizmet ve mekân tavsiyelerinde her alanda en iyiler. Şeffaf puanlama, kategoriye özel kriterler,
              doğrulanmış yorumlar.
            </p>

            {/* Beş çip telefonda dört satıra sarıp 202px yer kaplıyordu.
                Mobilde ilk üçü görünüyor — üçü de farklı bir tipi örnekliyor,
                yani örneğin işini yapmaya devam ediyor. */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {EXAMPLE_QUERIES.map((q, i) => (
                <Link
                  key={q}
                  href={`/ara?q=${encodeURIComponent(q)}`}
                  className={cn(
                    "rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium transition-colors hover:border-white/40 hover:bg-white/10",
                    i >= 3 && "hidden sm:inline-block"
                  )}
                  style={{ color: "#C7CEE8" }}
                >
                  {q}
                </Link>
              ))}
            </div>

            <Link
              href="/ara?sihirbaz=1"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white/90 transition-colors hover:text-white"
            >
              <Sparkles size={15} className="text-[#EFA013]" />
              Tavsiye Sihirbazı&apos;yla adım adım ilerle
              <ArrowRight size={14} />
            </Link>
          </div>

          <HeroExplorer categories={heroCategories} />
        </div>

        {/* Hero güven şeridi */}
        <div className="relative mx-auto mt-10 max-w-[1220px] px-6">
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[12.5px] font-semibold lg:justify-start"
            style={{ color: "#8C96B8" }}
          >
            {HERO_STATS.map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <s.icon size={14} className="text-[#EFA013]" />
                <span className="font-num text-white">{s.value}</span> {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="mx-auto max-w-[1220px] px-6 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight">Kategoriler</h2>
          <div className="flex gap-3 font-num text-sm text-[var(--muted)]">
            <span>{typeCounts("urun")} ürün</span>·<span>{typeCounts("hizmet")} hizmet</span>·
            <span>{typeCounts("mekan")} mekân</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {yayindaki.map((c) => {
            const accent = TYPE_ACCENT[c.type];
            return (
              <Link
                key={c.id}
                href={categoryHref(c.type, c.slug)}
                className="card-hover flex flex-col items-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4 text-center shadow-[var(--shadow-card)]"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
                  <CategoryIcon slug={c.slug} size={22} strokeWidth={1.75} />
                </span>
                <span className="text-sm font-bold leading-tight">{c.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted-2)]">
                  {TYPE_LABELS[c.type].singular}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Editör seçimleri */}
      <section className="mx-auto max-w-[1220px] px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Kategori Liderleri</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Kendi kategorisinde birinci sırada olanlar — sıralama her gün yeniden hesaplanır
          </p>
        </div>
        <ItemGrid items={editorPicks} />
      </section>

      {/* Popüler listeler */}
      <section className="mx-auto max-w-[1220px] px-6 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Popüler Listeler</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">İhtiyaca göre derlenmiş &quot;en iyi&quot; rehberleri</p>
          </div>
          <Link
            href="/listeler"
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand)] hover:underline"
          >
            Tümü <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bundle.lists.slice(0, 4).map((l) => (
            <Link
              key={l.id}
              href={`/liste/${l.slug}`}
              className="card-hover flex flex-col rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-base font-bold leading-snug">{l.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--muted)]">{l.description}</p>
              <p className="mt-3 text-xs text-[var(--muted-2)]">
                <span className="font-num">{l.itemSlugs.length}</span> öneri · Güncelleme: {formatDate(l.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nasıl puanlıyoruz */}
      <section className="border-t border-[var(--line)] bg-[var(--mist)] py-12">
        <div className="mx-auto max-w-[1220px] px-6">
          <Overline>Metodoloji</Overline>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Nasıl puanlıyoruz?</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Bir telefonla bir diş kliniği aynı modelle sıralanmaz — her kategori tipinin kendi algoritması vardır.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {MODELS.map((m) => {
              const accent = TYPE_ACCENT[m.type];
              return (
                <div key={m.type} className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
                    {m.icon}
                  </span>
                  <h3 className="mt-3 text-base font-bold">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{m.text}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-6 flex gap-2.5 rounded-xl bg-[var(--gold-soft)] p-4 text-sm leading-relaxed text-[var(--gold-ink)]">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <span>
              <strong>Şeffaflık ilkemiz:</strong> Sponsorlu içerikler altın çerçeve ve &quot;Sponsorlu&quot; etiketiyle
              açıkça ayrılır. İşletmeler görünürlük satın alabilir;{" "}
              <strong>tavsiye puanı ve sıralama asla satılmaz.</strong>
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
