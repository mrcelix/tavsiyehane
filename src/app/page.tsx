import Link from "next/link";
import { getBundle } from "@/lib/data";
import { sortItems } from "@/lib/query";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { SearchBox } from "@/components/SearchBox";
import { ItemGrid } from "@/components/ItemGrid";
import { formatDate } from "@/lib/format";

const EXAMPLE_QUERIES = [
  "25.000 TL altı telefon",
  "Alerjik kediler için mama",
  "İstanbul ev temizliği",
  "Uzaktan çalışmaya uygun kafe",
  "Çocuklu aileye otel",
];

export default async function HomePage() {
  const bundle = await getBundle();
  const editorPicks = sortItems(
    bundle.items.filter((i) => i.badges.includes("editor-secimi")),
    "puan"
  ).slice(0, 4);

  const typeCounts = (t: ItemType) => bundle.items.filter((i) => i.type === t).length;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-gradient-to-b from-indigo-50 via-white to-white py-14 dark:border-zinc-800 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Her konuda <span className="text-indigo-600 dark:text-indigo-400">doğru tavsiye</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver. Şeffaf puanlama, kategoriye özel kriterler, doğrulanmış yorumlar.
          </p>
          <div className="mt-8">
            <SearchBox />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/ara?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500"
              >
                {q}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/ara?sihirbaz=1" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              🧭 Kararsız mısın? İhtiyaç sihirbazını dene →
            </Link>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Kategoriler</h2>
          <div className="flex gap-3 text-sm text-zinc-400">
            <span>{typeCounts("urun")} ürün</span>·<span>{typeCounts("hizmet")} hizmet</span>·<span>{typeCounts("mekan")} mekân</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {bundle.categories.map((c) => {
            const hub = TYPE_LABELS[c.type].hub;
            const href =
              c.type === "urun" ? `${hub}/${c.slug}` : c.type === "hizmet" ? `${hub}/tumu/${c.slug}` : `${hub}/tumu/tumu/${c.slug}`;
            return (
              <Link
                key={c.id}
                href={href}
                className="card-hover flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="text-sm font-semibold leading-tight">{c.name}</span>
                <span className="text-[11px] uppercase tracking-wide text-zinc-400">{TYPE_LABELS[c.type].singular}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Editör seçimleri */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Editör Seçimleri</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Her kategoride bağımsız incelemeyle öne çıkanlar</p>
        </div>
        <ItemGrid items={editorPicks} categories={bundle.categories} />
      </section>

      {/* Popüler listeler */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Popüler Listeler</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">İhtiyaca göre derlenmiş &quot;en iyi&quot; rehberleri</p>
          </div>
          <Link href="/listeler" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Tümü →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bundle.lists.slice(0, 4).map((l) => (
            <Link
              key={l.id}
              href={`/liste/${l.slug}`}
              className="card-hover flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="font-bold leading-snug">{l.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-500 dark:text-zinc-400">{l.description}</p>
              <p className="mt-3 text-xs text-zinc-400">
                {l.itemSlugs.length} öneri · Güncelleme: {formatDate(l.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nasıl puanlıyoruz */}
      <section className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold">Nasıl puanlıyoruz?</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Bir telefonla bir diş kliniği aynı modelle sıralanmaz — her kategori tipinin kendi algoritması vardır.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="text-2xl">📦</div>
              <h3 className="mt-2 font-semibold">Ürünler</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                %25 fiyat-performans, %20 kullanıcı memnuniyeti, %15 teknik özellikler, %15 satıcı güvenilirliği; kalanı garanti, fiyat güncelliği ve editör.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="text-2xl">🤝</div>
              <h3 className="mt-2 font-semibold">Hizmetler</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                %25 doğrulanmış müşteri değerlendirmesi, %20 uzmanlık ve deneyim, %15 şikâyet çözümü, %15 fiyat şeffaflığı; kalanı ulaşılabilirlik, belge ve editör.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="text-2xl">📍</div>
              <h3 className="mt-2 font-semibold">Mekânlar</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                %25 son dönem kullanıcı ilgisi, %20 değerlendirme kalitesi, %15 güncellik, %15 amaca uygunluk; kalanı fiyat, konum ve editör.
              </p>
            </div>
          </div>
          <p className="mt-6 rounded-xl bg-orange-50 p-4 text-sm text-orange-800 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30">
            <strong>Şeffaflık ilkemiz:</strong> Sponsorlu içerikler turuncu çerçeve ve &quot;Sponsorlu&quot; etiketiyle açıkça ayrılır.
            İşletmeler görünürlük satın alabilir; <strong>tavsiye puanı ve sıralama asla satılmaz.</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
