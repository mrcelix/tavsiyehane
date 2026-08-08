import { describe, expect, it } from "vitest";
import { buildFacets, facetValueLabel } from "./facets";
import { buildEditorial } from "./scoring";
import type { Item } from "./types";

/**
 * Filtre boyutları elle tanımlanmaz, veriden çıkarılır. Buradaki asıl risk
 * "gürültü": her değeri tek kayda ait olan bir alan (Adres, İşlemci) filtre
 * gibi görünüp paneli işe yaramaz hale getirir. Testler eleme kuralını korur.
 */
function kayit(slug: string, attrs: Record<string, string>, over: Partial<Item> = {}): Item {
  return {
    id: slug,
    slug,
    title: slug,
    description: "",
    type: "urun",
    categorySlug: "test",
    brand: over.brand ?? "Marka",
    provenance: { kind: "editor" },
    editorial: buildEditorial("urun", { ozellikSeviyesi: 70 }),
    signals: null,
    score: 0,
    scoreBasis: "editor",
    scoreBreakdown: {},
    categoryRank: 0,
    categorySize: 0,
    whyRecommended: "",
    attrs,
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

describe("buildFacets", () => {
  it("boş kohortta boyut üretmez", () => {
    expect(buildFacets([])).toEqual([]);
  });

  it("rozet boyutunu tek değerde bile üretir", () => {
    // Diğer boyutlardan farklı: rozet kendi kutusunda gösteriliyor ve
    // "kategoride yalnızca sponsorlu var" da filtrelenebilir bir sonuçtur.
    const rozet = buildFacets([kayit("a", {}, { badges: ["sponsorlu"] }), kayit("b", {})]).find(
      (f) => f.param === "rozet"
    );
    expect(rozet?.values).toEqual([{ value: "sponsorlu", count: 1 }]);
  });

  it("rozetleri sayıya göre değil tanım sırasına göre dizer", () => {
    // Kutu kategoriden kategoriye yeniden dizilmemeli.
    const kohort = [
      kayit("a", {}, { badges: ["sponsorlu"] }),
      kayit("b", {}, { badges: ["sponsorlu"] }),
      kayit("c", {}, { badges: ["kategori-lideri"] }),
    ];
    const rozet = buildFacets(kohort).find((f) => f.param === "rozet");
    expect(rozet!.values.map((v) => v.value)).toEqual(["kategori-lideri", "sponsorlu"]);
  });

  it("rozeti olmayan kohortta rozet boyutu üretmez", () => {
    expect(buildFacets([kayit("a", {}), kayit("b", {})]).find((f) => f.param === "rozet")).toBeUndefined();
  });

  it("kayıtları gruplayan alanı filtre boyutu yapar", () => {
    const kohort = [
      kayit("a", { Garanti: "2 yıl distribütör" }),
      kayit("b", { Garanti: "2 yıl resmi distribütör" }),
      kayit("c", { Garanti: "3 yıl resmi distribütör" }),
      kayit("d", { Garanti: "2 yıl Apple Türkiye" }),
    ];
    const garanti = buildFacets(kohort).find((f) => f.param === "oz.Garanti");
    expect(garanti).toBeDefined();
    // Üç kayıt "2 yıl"da toplanır, biri "3 yıl"da.
    expect(garanti!.values.find((v) => v.value === "2 yıl")?.count).toBe(3);
  });

  it("her değeri tek kayda ait olan alanı eler", () => {
    // Dört farklı işlemci, dört kayıt: filtre değil, listedir.
    const kohort = [
      kayit("a", { İşlemci: "Exynos 1580" }),
      kayit("b", { İşlemci: "Apple A18" }),
      kayit("c", { İşlemci: "Tensor G4" }),
      kayit("d", { İşlemci: "Helio G100" }),
    ];
    expect(buildFacets(kohort).find((f) => f.param === "oz.İşlemci")).toBeUndefined();
  });

  it("iki kayıt tesadüfen eşleşse bile kayıtların yarısı gruplanmıyorsa eler", () => {
    // Sekiz kayıttan yalnızca ikisi aynı değerde — bu bir filtre boyutu değil.
    const kohort = [
      kayit("a", { Alan: "aynı" }),
      kayit("b", { Alan: "aynı" }),
      kayit("c", { Alan: "c" }),
      kayit("d", { Alan: "d" }),
      kayit("e", { Alan: "e" }),
      kayit("f", { Alan: "f" }),
      kayit("g", { Alan: "g" }),
      kayit("h", { Alan: "h" }),
    ];
    expect(buildFacets(kohort).find((f) => f.param === "oz.Alan")).toBeUndefined();
  });

  it("kayıtların yarısından azında bulunan alanı boyut yapmaz", () => {
    const kohort = [
      kayit("a", { Nadir: "x" }),
      kayit("b", {}),
      kayit("c", {}),
      kayit("d", {}),
    ];
    expect(buildFacets(kohort).find((f) => f.param === "oz.Nadir")).toBeUndefined();
  });

  it("tek değerli alanı boyut yapmaz — filtrelemek bir işe yaramaz", () => {
    const kohort = [
      kayit("a", { RAM: "8 GB" }),
      kayit("b", { RAM: "8 GB" }),
      kayit("c", { RAM: "8 GB" }),
    ];
    expect(buildFacets(kohort).find((f) => f.param === "oz.RAM")).toBeUndefined();
  });

  it("marka boyutunu ürün tipine göre etiketler", () => {
    const kohort = [kayit("a", {}, { brand: "A" }), kayit("b", {}, { brand: "B" })];
    expect(buildFacets(kohort).find((f) => f.param === "marka")?.label).toBe("Marka");

    const hizmetler = kohort.map((k) => ({ ...k, type: "hizmet" as const }));
    expect(buildFacets(hizmetler).find((f) => f.param === "marka")?.label).toBe("İşletme");
  });

  it("değerleri kayıt sayısına göre sıralar", () => {
    const kohort = [
      kayit("a", { Tip: "az" }),
      kayit("b", { Tip: "çok" }),
      kayit("c", { Tip: "çok" }),
      kayit("d", { Tip: "çok" }),
    ];
    const tip = buildFacets(kohort).find((f) => f.param === "oz.Tip");
    expect(tip!.values[0].value).toBe("Çok");
  });
});

describe("facetValueLabel", () => {
  it("rozet anahtarını okunur etikete çevirir", () => {
    expect(facetValueLabel("rozet", "toplulugun-secimi")).toBe("Topluluğun seçimi");
  });

  it("diğer değerleri olduğu gibi bırakır", () => {
    expect(facetValueLabel("marka", "Samsung")).toBe("Samsung");
  });
});
