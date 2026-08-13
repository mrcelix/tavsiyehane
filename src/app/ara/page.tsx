import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import { getBundle } from "@/lib/data";
import { searchItems } from "@/lib/query";
import { parseWizardAnswers, wizardHref, wizardMatches, type SearchParamRecord } from "@/lib/wizard";
import { findPriority } from "@/lib/priorities";
import { SearchBox } from "@/components/SearchBox";
import { Wizard } from "@/components/Wizard";
import { ItemGrid } from "@/components/ItemGrid";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Ara ve Keşfet",
  description: "İhtiyacını yaz ya da Tavsiye Sihirbazı'yla adım adım daralt: sana özel tavsiye listesi oluşturalım.",
  path: "/ara",
  noIndex: true,
  /*
   * Sihirbazın her seçeneği benzersiz sorgu dizisi taşıyan gerçek bir bağlantı;
   * tip × kategori × şehir × bütçe × öncelik × çoklu seçim facet'leri çarpılınca
   * adres uzayı pratikte sınırsız. `follow` açık kalırsa tarayıcı bu uzayda
   * gezer ve her adım sunucuda yeniden hesaplanır.
   */
  noFollow: true,
});

interface Props {
  searchParams: Promise<SearchParamRecord>;
}

export default async function AraPage({ searchParams }: Props) {
  const sp = await searchParams;
  const bundle = await getBundle();
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const answers = parseWizardAnswers(sp);
  const sihirbazModu = sp.sihirbaz === "1";

  // Sihirbaz sonucu: `tip` var, `sihirbaz` yok.
  if (!sihirbazModu && answers.type) {
    const results = wizardMatches(bundle, answers);
    const priorityLabel = findPriority(answers.type, answers.priority)?.label;
    const catName = bundle.categories.find((c) => c.slug === answers.categorySlug)?.name;
    // Kategoriye özel seçimler de başlıkta görünür; yoksa kullanıcı hangi
    // filtrenin sonucu daralttığını bilemez.
    const facetEtiketleri = Object.entries(answers.facets).flatMap(([, values]) => values);

    return (
      <div className="mx-auto max-w-[1220px] px-6 py-10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">Sana özel tavsiye</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[28px]">
          {catName ?? (answers.type === "urun" ? "Ürünler" : answers.type === "hizmet" ? "Hizmetler" : "Mekânlar")}
          {answers.city ? ` · ${answers.city}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          {answers.budget
            ? answers.type === "mekan"
              ? `Bütçe: ${"₺".repeat(Math.min(4, answers.budget))}`
              : `Bütçe: ${formatPrice(answers.budget)} altı`
            : "Bütçe sınırsız"}
          {priorityLabel ? ` · Öncelik: ${priorityLabel}` : ""}
          {facetEtiketleri.length > 0 ? ` · ${facetEtiketleri.join(", ")}` : ""} ·{" "}
          <span className="font-num font-semibold text-[var(--ink-2)]">{results.length}</span> sonuç
          {priorityLabel ? ", önceliğine göre sıralandı" : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {/* Cevapları koruyarak sihirbaza dönüş: baştan başlamak zorunda
              kalmadan tek bir cevabı değiştirebilmeli. */}
          <Link
            href={wizardHref(answers)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] hover:underline"
          >
            <Wand2 size={14} /> Cevapları değiştir
          </Link>
          <Link
            href="/ara?sihirbaz=1"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
          >
            Sihirbazı yeniden başlat
          </Link>
        </div>
        <div className="mt-6">
          <ItemGrid items={results} />
        </div>
        {results.length === 0 && (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Bu seçimlerle eşleşen kayıt yok. Bir cevabı gevşetmek için “Cevapları değiştir”e dokunun.
          </p>
        )}
      </div>
    );
  }

  // Metin araması
  if (!sihirbazModu && q) {
    const results = searchItems(bundle, q);
    return (
      <div className="mx-auto max-w-[1220px] px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">Arama: &quot;{q}&quot;</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          <span className="font-num font-semibold text-[var(--ink-2)]">{results.length}</span> sonuç bulundu
        </p>
        <div className="mt-4 max-w-2xl">
          <SearchBox initial={q} />
        </div>
        <div className="mt-6">
          <ItemGrid items={results} />
        </div>
        {results.length === 0 && (
          <p className="mt-6 text-center">
            <Link
              href="/ara?sihirbaz=1"
              className="inline-flex items-center gap-1.5 font-bold text-[var(--brand)] hover:underline"
            >
              <Sparkles size={15} className="text-[var(--gold)]" /> Tavsiye Sihirbazı&apos;yla adım adım daraltın
            </Link>
          </p>
        )}
      </div>
    );
  }

  /*
   * Varsayılan: sihirbaz. Başlık bilinçli olarak kısa ve tek satır — sihirbazın
   * kendisi üç sütun ve ekranda görünen alanda kalmalı; uzun bir giriş metni,
   * asıl işi ekranın altına itiyordu.
   */
  return (
    <div className="mx-auto max-w-[1320px] px-6 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">Tavsiye Sihirbazı</p>
          <h1 className="mt-0.5 text-[22px] font-extrabold tracking-tight">Sana uygun olanı bulalım</h1>
        </div>
        <p className="max-w-md text-[13px] text-[var(--muted)]">
          Her soru ön tanımlı seçeneklerle geliyor; seçeneğin yanındaki sayı kaç tavsiye bırakacağını gösteriyor. Boş
          sonuca düşmeden daraltırsın.
        </p>
      </div>

      <Wizard bundle={bundle} answers={answers} stepKey={typeof sp.adim === "string" ? sp.adim : undefined} />

      <div className="mx-auto mt-8 max-w-xl text-center text-sm text-[var(--muted-2)]">
        veya doğrudan ara:
        <div className="mt-3">
          <SearchBox />
        </div>
      </div>
    </div>
  );
}
