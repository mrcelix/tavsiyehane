import type { Metadata } from "next";
import Link from "next/link";
import { getBundle } from "@/lib/data";
import { searchItems, uniqueCities, wizardResults } from "@/lib/query";
import { SCORE_MODELS } from "@/lib/scoring";
import type { ItemType } from "@/lib/types";
import { SearchBox } from "@/components/SearchBox";
import { Wizard } from "@/components/Wizard";
import { ItemGrid } from "@/components/ItemGrid";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ara ve Keşfet",
  description: "İhtiyacını yaz ya da sihirbazla adım adım daralt: sana özel tavsiye listesi oluşturalım.",
};

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AraPage({ searchParams }: Props) {
  const sp = await searchParams;
  const bundle = await getBundle();
  const q = sp.q?.trim();
  const isWizardResult = Boolean(sp.tip);

  // Sihirbaz sonucu
  if (isWizardResult) {
    const type = sp.tip as ItemType;
    const budget = Number(sp.butce) || undefined;
    const results = wizardResults(bundle, {
      type,
      categorySlug: sp.kategori || undefined,
      budget,
      priority: sp.oncelik || undefined,
      city: sp.sehir || undefined,
    });
    const priorityLabel = SCORE_MODELS[type]?.find((c) => c.key === sp.oncelik)?.label;
    const catName = bundle.categories.find((c) => c.slug === sp.kategori)?.name;

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Sana özel tavsiye</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {catName ?? (type === "urun" ? "Ürünler" : type === "hizmet" ? "Hizmetler" : "Mekânlar")}
          {sp.sehir ? ` · ${sp.sehir}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          {budget ? (type === "mekan" ? `Bütçe: ${"₺".repeat(Math.min(4, budget))}` : `Bütçe: ${formatPrice(budget)} altı`) : "Bütçe sınırsız"}
          {priorityLabel ? ` · Öncelik: ${priorityLabel}` : ""} · {results.length} sonuç, önceliğine göre sıralandı
        </p>
        <div className="mt-4">
          <Link href="/ara?sihirbaz=1" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            ↻ Sihirbazı yeniden başlat
          </Link>
        </div>
        <div className="mt-6">
          <ItemGrid items={results} categories={bundle.categories} />
        </div>
      </div>
    );
  }

  // Metin araması
  if (q) {
    const results = searchItems(bundle, q);
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Arama: &quot;{q}&quot;</h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{results.length} sonuç bulundu</p>
        <div className="mt-4 max-w-2xl">
          <SearchBox initial={q} />
        </div>
        <div className="mt-6">
          <ItemGrid items={results} categories={bundle.categories} />
        </div>
        {results.length === 0 && (
          <p className="mt-6 text-center">
            <Link href="/ara?sihirbaz=1" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              🧭 Sihirbazla adım adım aramayı deneyin →
            </Link>
          </p>
        )}
      </div>
    );
  }

  // Varsayılan: sihirbaz
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">İhtiyaç Sihirbazı</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Birkaç soruyla ihtiyacını daralt; sana kişiselleştirilmiş bir tavsiye listesi oluşturalım.
        </p>
      </div>
      <Wizard categories={bundle.categories} cities={uniqueCities(bundle)} />
      <div className="mx-auto mt-8 max-w-xl text-center text-sm text-zinc-400">
        veya doğrudan ara: <div className="mt-3"><SearchBox /></div>
      </div>
    </div>
  );
}
