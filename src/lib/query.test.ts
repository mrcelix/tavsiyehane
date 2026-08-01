import { describe, expect, it } from "vitest";
import { filterItems, parseSearchQuery, searchItems } from "./query";
import { buildEditorial } from "./scoring";
import type { Category, DataBundle, Item } from "./types";

/**
 * Arama, ihtiyaç odaklı sorguları karşılamak zorunda ("25.000 TL altı telefon").
 * Bütçe ayıklama ve ek toleransı bir kez bozulduğunda kullanıcı sıfır sonuç
 * görür ve sitenin çalışmadığını düşünür — sessiz ve pahalı bir bozulma.
 */
function kayit(over: Partial<Item> & { slug: string }): Item {
  return {
    id: over.slug,
    title: over.slug,
    description: "",
    type: "urun",
    categorySlug: "telefon",
    brand: "Marka",
    provenance: { kind: "editor" },
    editorial: buildEditorial("urun", { ozellikSeviyesi: 70 }),
    signals: null,
    score: 50,
    scoreBasis: "editor",
    scoreBreakdown: {},
    categoryRank: 0,
    categorySize: 0,
    whyRecommended: "",
    attrs: {},
    pros: [],
    cons: [],
    suitableFor: [],
    notSuitableFor: [],
    badges: [],
    isSponsored: false,
    updatedAt: new Date().toISOString(),
    ratingAvg: 0,
    ratingCount: 0,
    ...over,
  };
}

const KATEGORILER: Category[] = [
  { id: "telefon", slug: "telefon", name: "Telefon", type: "urun", icon: "", description: "" },
  { id: "kafe", slug: "kafe", name: "Kafe", type: "mekan", icon: "", description: "" },
];

function paket(items: Item[]): DataBundle {
  return {
    categories: KATEGORILER,
    items,
    reviews: [],
    offers: [],
    priceHistory: {},
    lists: [],
    source: "demo",
  };
}

describe("parseSearchQuery", () => {
  it("bütçeyi sorgudan ayıklar", () => {
    const { words, maxPrice } = parseSearchQuery("25.000 TL altı telefon");
    expect(maxPrice).toBe(25000);
    expect(words).toContain("telefon");
    expect(words).not.toContain("tl");
  });

  it("'bin' ekini çarpan olarak okur", () => {
    expect(parseSearchQuery("30 bin altı telefon").maxPrice).toBe(30000);
  });

  it("küçük sayıları fiyat sanmaz", () => {
    // "5 kişilik masa" bir bütçe değildir.
    expect(parseSearchQuery("5 kişilik masa").maxPrice).toBeUndefined();
  });

  it("anlam taşımayan ekleri düşürür", () => {
    const { words } = parseSearchQuery("en iyi kedi maması için öneri");
    expect(words).not.toContain("en");
    expect(words).not.toContain("iyi");
    expect(words).not.toContain("için");
  });
});

describe("searchItems", () => {
  const bundle = paket([
    kayit({ slug: "ucuz", title: "Ucuz Telefon", price: 10000 }),
    kayit({ slug: "pahali", title: "Pahalı Telefon", price: 90000 }),
    kayit({ slug: "kafe", title: "Sahil Kahve", type: "mekan", categorySlug: "kafe" }),
  ]);

  it("bütçe üstündeki kayıtları eler", () => {
    const sonuc = searchItems(bundle, "25.000 TL altı telefon");
    expect(sonuc.map((i) => i.slug)).toEqual(["ucuz"]);
  });

  it("kategori adıyla da eşleşir", () => {
    expect(searchItems(bundle, "kafe").map((i) => i.slug)).toContain("kafe");
  });

  it("başlık eşleşmesini açıklama eşleşmesinin üstünde sıralar", () => {
    const b = paket([
      kayit({ slug: "aciklamada", title: "Bir Ürün", description: "kamera performansı iyi" }),
      kayit({ slug: "baslikta", title: "Kamera Telefonu" }),
    ]);
    expect(searchItems(b, "kamera")[0].slug).toBe("baslikta");
  });

  it("Türkçe ek toleransı gösterir", () => {
    const b = paket([kayit({ slug: "kedi", title: "Kedi Maması" })]);
    expect(searchItems(b, "kediler").map((i) => i.slug)).toContain("kedi");
  });

  it("boş sorguda hepsini döndürür", () => {
    expect(searchItems(bundle, "").length).toBe(3);
  });

  it("eşleşme yoksa boş döner, rastgele sonuç uydurmaz", () => {
    expect(searchItems(bundle, "bulunmayanbirsey")).toEqual([]);
  });
});

describe("filterItems — facet mantığı", () => {
  const bundle = paket([
    kayit({ slug: "a", brand: "Samsung", attrs: { Garanti: "2 yıl distribütör" } }),
    kayit({ slug: "b", brand: "Samsung", attrs: { Garanti: "3 yıl resmi distribütör" } }),
    kayit({ slug: "c", brand: "Apple", attrs: { Garanti: "2 yıl Apple Türkiye" } }),
  ]);

  it("aynı boyut içinde VEYA uygular", () => {
    const s = filterItems(bundle, { facets: { marka: ["Samsung", "Apple"] } });
    expect(s.length).toBe(3);
  });

  it("boyutlar arasında VE uygular", () => {
    const s = filterItems(bundle, { facets: { marka: ["Samsung"], "oz.Garanti": ["2 yıl"] } });
    expect(s.map((i) => i.slug)).toEqual(["a"]);
  });

  it("normalize edilmiş değerle eşleşir — ham metin hiçbir kayıtta birebir yazmaz", () => {
    const s = filterItems(bundle, { facets: { "oz.Garanti": ["2 yıl"] } });
    expect(s.map((i) => i.slug).sort()).toEqual(["a", "c"]);
  });

  it("boş seçim listesi filtre uygulamaz", () => {
    expect(filterItems(bundle, { facets: { marka: [] } }).length).toBe(3);
  });
});
