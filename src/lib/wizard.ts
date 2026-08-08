import { buildFacets, type Facet } from "./facets";
import { findPriority, PRIORITIES, priorityValue } from "./priorities";
import { effectivePrice, filterItems, sortItems } from "./query";
import { formatPrice } from "./format";
import type { DataBundle, Item, ItemType } from "./types";
import { isCategoryLive } from "./categories";

/**
 * TAVSİYE SİHİRBAZI — adım verisi.
 *
 * İki tasarım kararı sihirbazın tamamını belirliyor:
 *
 * 1. HER SEÇENEK ÖN TANIMLI VE VERİDEN GELİR. Eskiden bütçe adımı serbest sayı
 *    istiyordu; kullanıcı 3.000 yazıp boş sonuç ekranına düşebiliyordu. Artık
 *    bütçe aralıkları o kohortun gerçek fiyatlarından üretiliyor ve her seçeneğin
 *    yanında kaç sonuç bırakacağı yazıyor. Sıfır sonuç bırakan seçenek hiç
 *    gösterilmiyor — sihirbazın çıkmaz sokağı olmaz.
 *
 * 2. DURUM URL'DE. Adımlar istemci state'inde tutulsaydı ya tüm katalog tarayıcıya
 *    inecekti ya da sayımlar tahmin olacaktı. URL'de tutulunca her adım sunucuda
 *    gerçek veriyle hesaplanıyor, geri düğmesi çalışıyor ve yarım kalmış bir
 *    sihirbaz bağlantı olarak paylaşılabiliyor.
 */

/** Sihirbazın URL'den okunan tüm durumu. */
export interface WizardAnswers {
  type?: ItemType;
  categorySlug?: string;
  city?: string;
  /** Ürün/hizmette üst fiyat sınırı; mekânda 1-4 fiyat seviyesi. */
  budget?: number;
  priority?: string;
  /** `uygun` ve `oz.<Alan>` boyutları — liste sayfalarıyla aynı sözleşme. */
  facets: Record<string, string[]>;
  /**
   * "Fark etmez" denip geçilen adımların anahtarları. Cevapsız ile geçilmiş
   * ayrımı olmadan sihirbaz aynı soruya geri döner: cevap vermemek de bir cevap.
   */
  skipped: string[];
}

export type SearchParamRecord = Record<string, string | string[] | undefined>;

const FACET_PARAM = (k: string) => k === "uygun" || k.startsWith("oz.");

function dizi(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v.filter(Boolean);
  return v ? [v] : [];
}

export function parseWizardAnswers(sp: SearchParamRecord): WizardAnswers {
  const tip = typeof sp.tip === "string" ? sp.tip : undefined;
  const butce = Number(typeof sp.butce === "string" ? sp.butce : NaN);
  const facets: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (!FACET_PARAM(k)) continue;
    const d = dizi(v);
    if (d.length) facets[k] = d;
  }
  return {
    type: tip === "urun" || tip === "hizmet" || tip === "mekan" ? tip : undefined,
    categorySlug: typeof sp.kategori === "string" && sp.kategori ? sp.kategori : undefined,
    city: typeof sp.sehir === "string" && sp.sehir ? sp.sehir : undefined,
    budget: Number.isFinite(butce) && butce > 0 ? butce : undefined,
    priority: typeof sp.oncelik === "string" && sp.oncelik ? sp.oncelik : undefined,
    facets,
    skipped: dizi(sp.atla)
      .join(",")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/** Cevapları URL parametrelerine çevirir. */
export function answersToParams(a: WizardAnswers): URLSearchParams {
  const p = new URLSearchParams();
  if (a.type) p.set("tip", a.type);
  if (a.categorySlug) p.set("kategori", a.categorySlug);
  if (a.city) p.set("sehir", a.city);
  if (a.budget) p.set("butce", String(a.budget));
  if (a.priority) p.set("oncelik", a.priority);
  for (const [k, values] of Object.entries(a.facets)) for (const v of values) p.append(k, v);
  if (a.skipped.length) p.set("atla", a.skipped.join(","));
  return p;
}

/**
 * Bir cevabı değiştirip yeni sihirbaz adresini üretir.
 * `null` değer o cevabı siler. `sihirbaz=1` korunur; sonuç ekranına geçerken
 * `sonuc` bayrağıyla düşürülür.
 */
export function wizardHref(
  a: WizardAnswers,
  patch: Partial<Record<"tip" | "kategori" | "sehir" | "butce" | "oncelik", string | null>> = {},
  opts: {
    facetToggle?: { param: string; value: string };
    /** Bir boyutun tüm işaretlerini kaldır. */
    facetClear?: string;
    /** Bu adımı "geçildi" işaretle (fark etmez / devam). */
    skip?: string;
    /** İşareti kaldır — adım yeniden sorulur. */
    unskip?: string;
    sonuc?: boolean;
  } = {}
): string {
  const next: WizardAnswers = {
    type: a.type,
    categorySlug: a.categorySlug,
    city: a.city,
    budget: a.budget,
    priority: a.priority,
    facets: { ...a.facets },
    skipped: [...a.skipped],
  };

  for (const [k, v] of Object.entries(patch)) {
    if (k === "tip") next.type = (v as ItemType | null) ?? undefined;
    if (k === "kategori") next.categorySlug = v ?? undefined;
    if (k === "sehir") next.city = v ?? undefined;
    if (k === "butce") next.budget = v ? Number(v) : undefined;
    if (k === "oncelik") next.priority = v ?? undefined;
    // Cevap verilen adım artık geçilmiş sayılmaz.
    if (v) next.skipped = next.skipped.filter((s) => s !== k);
  }

  /*
   * Tip değişince alt cevaplar taşınamaz: başka tipin kategorisi, şehri ve
   * öncelik anahtarı bu tipte yoktur. Taşınırsa sihirbaz sessizce boş sonuç
   * üretir — hatası da görünmez, çünkü seçimler ekranda doğru görünür.
   */
  if (patch.tip !== undefined && patch.tip !== a.type) {
    next.categorySlug = undefined;
    next.city = undefined;
    next.budget = undefined;
    next.priority = undefined;
    next.facets = {};
    next.skipped = [];
  }
  // Kategori değişince o kategoriye özel özellik filtreleri de düşer.
  if (patch.kategori !== undefined && patch.kategori !== a.categorySlug) {
    next.facets = {};
    next.skipped = next.skipped.filter((s) => s !== "uygun" && !s.startsWith("oz."));
  }

  if (opts.skip) next.skipped = [...new Set([...next.skipped, opts.skip])];
  if (opts.unskip) next.skipped = next.skipped.filter((s) => s !== opts.unskip);

  if (opts.facetClear) {
    next.facets = { ...next.facets };
    delete next.facets[opts.facetClear];
  }

  if (opts.facetToggle) {
    const { param, value } = opts.facetToggle;
    const mevcut = next.facets[param] ?? [];
    const yeni = mevcut.includes(value) ? mevcut.filter((v) => v !== value) : [...mevcut, value];
    next.facets = { ...next.facets };
    if (yeni.length) next.facets[param] = yeni;
    else delete next.facets[param];
  }

  const p = answersToParams(next);
  if (!opts.sonuc) p.set("sihirbaz", "1");
  return `/ara?${p.toString()}`;
}

/** Cevaplara uyan kayıtlar; öncelik seçiliyse ona göre sıralanır. */
export function wizardMatches(bundle: DataBundle, a: WizardAnswers): Item[] {
  const items = filterItems(bundle, {
    type: a.type,
    categorySlug: a.categorySlug,
    city: a.city,
    maxPrice: a.type !== "mekan" ? a.budget : undefined,
    maxPriceLevel: a.type === "mekan" ? a.budget : undefined,
    facets: a.facets,
  });
  const p = a.type ? findPriority(a.type, a.priority) : undefined;
  if (p) {
    // Eşitlikte genel puan belirler: öncelik bileşeni aynı olan iki kaydı
    // rastgele sıralamak, sıralamanın tamamına duyulan güveni bozar.
    return [...items].sort((x, y) => priorityValue(y, p) - priorityValue(x, p) || y.score - x.score);
  }
  return sortItems(items, "puan");
}

/** Sayımı, o seçenek işaretlenmiş gibi hesaplar. */
function sayimla(bundle: DataBundle, a: WizardAnswers, patch: Partial<WizardAnswers>): number {
  return wizardMatches(bundle, { ...a, ...patch }).length;
}

export interface WizardOption {
  label: string;
  /** Seçenek işaretlenirse kalacak sonuç sayısı. */
  count: number;
  href: string;
  /** Çoklu seçimli adımlarda işaretli mi. */
  selected?: boolean;
  /** Kategori simgesi için slug; yoksa simge çizilmez. */
  iconSlug?: string;
  hint?: string;
}

export interface WizardStep {
  key: "tip" | "kategori" | "sehir" | "butce" | "oncelik" | string;
  title: string;
  /** Neden sorulduğu — kullanıcı adımı atlamayı bilinçli seçebilsin. */
  hint?: string;
  options: WizardOption[];
  /** Çoklu seçim: adım seçenek işaretlense de kapanmaz. */
  multi?: boolean;
  /** Bu adımda verilmiş cevabın etiketi; verilmemişse undefined. */
  answered?: string;
  /** "Fark etmez" bağlantısı; tip adımında yoktur (her şey ona bağlı). */
  skipHref?: string;
  /** Cevabı silip adımı yeniden açan bağlantı. */
  resetHref?: string;
  /**
   * Adım kapandı mı. Çoklu seçimli adımda ilk işaret adımı kapatmaz — kullanıcı
   * ikinci değeri işaretlemeye devam edebilmeli; kapanışı "Devam" belirler.
   */
  done?: boolean;
}

/** 12.340 -> 15.000 gibi: eşikler yuvarlak sayı olmadıkça bütçe seçeneği inandırıcı olmuyor. */
function yuvarla(n: number): number {
  if (n <= 0) return 0;
  const basamak = Math.pow(10, Math.floor(Math.log10(n)));
  const adim = basamak / 2;
  return Math.ceil(n / adim) * adim;
}

/** Kohortun gerçek fiyatlarından kümülatif bütçe eşikleri üretir. */
function butceEsikleri(items: Item[]): number[] {
  const fiyatlar = items
    .map((i) => effectivePrice(i))
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);
  if (fiyatlar.length < 3) return [];

  const esikler = new Set<number>();
  for (const oran of [0.25, 0.5, 0.75]) {
    const ham = fiyatlar[Math.min(fiyatlar.length - 1, Math.floor(fiyatlar.length * oran))];
    const y = yuvarla(ham);
    // En yüksek fiyatı da kapsayan eşik "sınır yok" ile aynı şeydir, eklemiyoruz.
    if (y > 0 && y < fiyatlar[fiyatlar.length - 1]) esikler.add(y);
  }
  return [...esikler].sort((a, b) => a - b);
}

const PRICE_LEVEL_LABEL = ["₺ — Ekonomik", "₺₺ — Orta", "₺₺₺ — Yüksek", "₺₺₺₺ — Premium"];

/**
 * Sihirbazın adım listesi. Sıra bilinçli: en çok daraltan soru önce gelir
 * (tip → kategori → şehir), zevk soruları sonra. Seçenek bırakmayan adım hiç
 * gösterilmez, tek seçenekli adım da gösterilmez — soru sormak, cevabı
 * değiştirmiyorsa kullanıcıyı oyalamaktır.
 */
export function wizardSteps(bundle: DataBundle, a: WizardAnswers): WizardStep[] {
  const steps: WizardStep[] = [];

  // 1 — Tip
  steps.push({
    key: "tip",
    title: "Ne arıyorsun?",
    options: (["urun", "hizmet", "mekan"] as ItemType[]).map((t) => ({
      label: t === "urun" ? "Ürün" : t === "hizmet" ? "Hizmet" : "Mekân",
      hint:
        t === "urun"
          ? "Telefon, robot süpürge, kedi ürünleri…"
          : t === "hizmet"
            ? "Temizlik, nakliye, teknik servis…"
            : "Restoran, kafe, otel…",
      count: sayimla(bundle, a, { type: t, categorySlug: undefined, city: undefined, budget: undefined, facets: {} }),
      href: wizardHref(a, { tip: t }),
    })).filter((o) => o.count > 0),
    answered: a.type ? (a.type === "urun" ? "Ürün" : a.type === "hizmet" ? "Hizmet" : "Mekân") : undefined,
  });

  if (!a.type) return steps;

  const kohortTip = filterItems(bundle, { type: a.type });

  // 2 — Kategori
  const kategoriler = bundle.categories.filter((c) => c.type === a.type && isCategoryLive(c));
  const kategoriSecenekleri = kategoriler
    .map((c) => ({
      label: c.name,
      iconSlug: c.slug,
      count: sayimla(bundle, a, { categorySlug: c.slug, facets: {} }),
      href: wizardHref(a, { kategori: c.slug }),
    }))
    .filter((o) => o.count > 0);
  if (kategoriSecenekleri.length > 1) {
    steps.push({
      key: "kategori",
      title: "Hangi kategori?",
      options: kategoriSecenekleri,
      answered: a.categorySlug ? kategoriler.find((c) => c.slug === a.categorySlug)?.name : undefined,
      skipHref: wizardHref(a, { kategori: null }, { skip: "kategori" }),
      resetHref: wizardHref(a, { kategori: null }, { unskip: "kategori" }),
    });
  }

  // 3 — Şehir (ürünlerde konum kavramı yok)
  if (a.type !== "urun") {
    const sehirler = [...new Set(kohortTip.map((i) => i.city).filter(Boolean) as string[])].sort((x, y) =>
      x.localeCompare(y, "tr")
    );
    const sehirSecenekleri = sehirler
      .map((c) => ({ label: c, count: sayimla(bundle, a, { city: c }), href: wizardHref(a, { sehir: c }) }))
      .filter((o) => o.count > 0);
    if (sehirSecenekleri.length > 1) {
      steps.push({
        key: "sehir",
        title: "Hangi şehirde?",
        options: sehirSecenekleri,
        answered: a.city,
        skipHref: wizardHref(a, { sehir: null }, { skip: "sehir" }),
        resetHref: wizardHref(a, { sehir: null }, { unskip: "sehir" }),
      });
    }
  }

  // 4 — Bütçe: ön tanımlı, kohortun gerçek fiyatlarından
  if (a.type === "mekan") {
    const seviyeler = [...new Set(kohortTip.map((i) => i.priceLevel).filter(Boolean) as number[])].sort();
    const secenekler = seviyeler
      .filter((s) => s < 4)
      .map((s) => ({
        label: `${PRICE_LEVEL_LABEL[s - 1]} ve altı`,
        count: sayimla(bundle, a, { budget: s }),
        href: wizardHref(a, { butce: String(s) }),
      }))
      .filter((o) => o.count > 0);
    if (secenekler.length > 0) {
      steps.push({
        key: "butce",
        title: "Fiyat aralığı?",
        hint: "Mekânlarda fiyat seviyesi olarak tutuluyor",
        options: secenekler,
        answered: a.budget ? `${PRICE_LEVEL_LABEL[a.budget - 1]} ve altı` : undefined,
        skipHref: wizardHref(a, { butce: null }, { skip: "butce" }),
        resetHref: wizardHref(a, { butce: null }, { unskip: "butce" }),
      });
    }
  } else {
    // Bütçe eşikleri, kategori seçiminden SONRAKİ kohorttan çıkar: telefon ile
    // kedi maması aynı aralıkları paylaşmaz.
    const kohort = filterItems(bundle, { type: a.type, categorySlug: a.categorySlug, city: a.city });
    const secenekler = butceEsikleri(kohort)
      .map((esik) => ({
        label: `${formatPrice(esik)} ve altı`,
        count: sayimla(bundle, a, { budget: esik }),
        href: wizardHref(a, { butce: String(esik) }),
      }))
      .filter((o) => o.count > 0);
    if (secenekler.length > 0) {
      steps.push({
        key: "butce",
        title: "Bütçen ne kadar?",
        options: secenekler,
        answered: a.budget ? `${formatPrice(a.budget)} ve altı` : undefined,
        skipHref: wizardHref(a, { butce: null }, { skip: "butce" }),
        resetHref: wizardHref(a, { butce: null }, { unskip: "butce" }),
      });
    }
  }

  // 5 — Öncelik: sonucu sıralar, daraltmaz
  steps.push({
    key: "oncelik",
    title: "En önemli önceliğin?",
    hint: "Sonucu daraltmaz, sıralamayı bu bileşene göre değiştirir",
    options: PRIORITIES[a.type].map((o) => ({
      label: o.label,
      count: sayimla(bundle, a, { priority: o.key }),
      href: wizardHref(a, { oncelik: o.key }),
    })),
    answered: findPriority(a.type, a.priority)?.label,
    skipHref: wizardHref(a, { oncelik: null }, { skip: "oncelik" }),
    resetHref: wizardHref(a, { oncelik: null }, { unskip: "oncelik" }),
  });

  /*
   * 6+ — Kategoriye özel boyutlar. Elle tanımlanmıyor: kohortun kendi
   * alanlarından çıkıyor (telefonda RAM, otelde konsept). Filtre olarak anlamsız
   * alanları buildFacets zaten eliyor.
   */
  const kohort = filterItems(bundle, {
    type: a.type,
    categorySlug: a.categorySlug,
    city: a.city,
    maxPrice: a.type !== "mekan" ? a.budget : undefined,
    maxPriceLevel: a.type === "mekan" ? a.budget : undefined,
  });
  const facetler: Facet[] = buildFacets(kohort).filter((f) => f.param === "uygun" || f.param.startsWith("oz."));

  // "Kimler için uygun" önce: özellik adlarından önce gelen, herkesin
  // cevaplayabileceği soru.
  facetler.sort((x, y) => (x.param === "uygun" ? -1 : y.param === "uygun" ? 1 : 0));

  for (const f of facetler.slice(0, 3)) {
    const secili = a.facets[f.param] ?? [];
    const secenekler = f.values
      .map((v) => {
        const isaretli = secili.includes(v.value);
        return {
          label: v.value,
          selected: isaretli,
          count: sayimla(bundle, a, {
            facets: {
              ...a.facets,
              [f.param]: isaretli ? secili.filter((s) => s !== v.value) : [...secili, v.value],
            },
          }),
          href: wizardHref(a, {}, { facetToggle: { param: f.param, value: v.value } }),
        };
      })
      // İşaretli seçenek 0 sonuç bırakıyorsa da gösterilir: kaldırılabilmesi gerek.
      .filter((o) => o.count > 0 || o.selected)
      .slice(0, 8);
    if (secenekler.length < 2) continue;

    steps.push({
      key: f.param,
      title: f.param === "uygun" ? "Kimler için uygun olsun?" : `${f.label} tercihi`,
      hint: "Birden fazla seçebilirsin",
      multi: true,
      options: secenekler,
      answered: secili.length ? secili.join(", ") : undefined,
      skipHref: wizardHref(a, {}, { skip: f.param }),
      // Çoklu adımda "sıfırla" hem işaretleri hem geçildi damgasını kaldırır.
      resetHref: wizardHref(a, {}, { facetClear: f.param, unskip: f.param }),
    });
  }

  for (const s of steps) {
    s.done = s.multi ? a.skipped.includes(s.key) : Boolean(s.answered) || a.skipped.includes(s.key);
  }

  return steps;
}

/** Sırada sorulacak adım: kapanmamış ilk adım. */
export function activeStep(steps: WizardStep[]): WizardStep | undefined {
  return steps.find((s) => !s.done);
}

/** Tamamlanma oranı. */
export function wizardProgress(steps: WizardStep[]): { done: number; total: number } {
  return { done: steps.filter((s) => s.done).length, total: steps.length };
}
