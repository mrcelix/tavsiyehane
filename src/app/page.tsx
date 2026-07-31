import Link from "next/link";
import { ArrowRight, Handshake, MapPinned, Package, ShieldCheck, Sparkles } from "lucide-react";
import { getBundle } from "@/lib/data";
import { sortItems, uniqueCities } from "@/lib/query";
import { categoryHref } from "@/lib/menu";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SearchBox } from "@/components/SearchBox";
import { HeroPicker } from "@/components/HeroPicker";
import { RotatingWord } from "@/components/RotatingWord";
import { ItemGrid } from "@/components/ItemGrid";
import { Overline } from "@/components/ui/Card";

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

export default async function HomePage() {
  const bundle = await getBundle();
  const editorPicks = sortItems(
    bundle.items.filter((i) => i.badges.includes("editor-secimi")),
    "puan"
  ).slice(0, 4);

  const typeCounts = (t: ItemType) => bundle.items.filter((i) => i.type === t).length;

  // Hero formu için kompakt veri — tüm bundle istemciye taşınmaz.
  const pickerCategories = bundle.categories.map((c) => ({ slug: c.slug, name: c.name, type: c.type }));
  const citiesByType = {
    urun: [],
    hizmet: uniqueCities(bundle, "hizmet"),
    mekan: uniqueCities(bundle, "mekan"),
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--mist)] py-16">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--brand) 28%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 30%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-[34px] font-extrabold leading-tight tracking-tight md:text-[44px]">
            <RotatingWord words={["Ne alacağına", "Kimi seçeceğine", "Nereye gideceğine"]} />
            <br />
            kolay karar ver
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
            Ürün, hizmet ve mekân tavsiyelerinde her alanda en iyiler. Şeffaf puanlama, kategoriye özel kriterler,
            doğrulanmış yorumlar.
          </p>

          <div className="mt-8">
            <SearchBox />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/ara?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-sm font-medium text-[var(--ink-2)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {q}
              </Link>
            ))}
          </div>

          {/* Aramayı bilmeyenler için yapılandırılmış seçim */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">
              veya seçerek bul
            </span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <div className="mt-5">
            <HeroPicker categories={pickerCategories} citiesByType={citiesByType} />
          </div>

          <Link
            href="/ara?sihirbaz=1"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] hover:underline"
          >
            <Sparkles size={15} className="text-[var(--gold)]" />
            Adım adım ilerlemeyi tercih ederim
            <ArrowRight size={14} />
          </Link>
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {bundle.categories.map((c) => {
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
          <h2 className="text-2xl font-extrabold tracking-tight">Editör Seçimleri</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Her kategoride bağımsız incelemeyle öne çıkanlar</p>
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
