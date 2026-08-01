import { describe, expect, it } from "vitest";
import { FRESHNESS_DAYS, ageInDays, freshnessOf, freshnessWarning, staleItems } from "./freshness";
import { buildEditorial } from "./scoring";
import type { Item, ItemType } from "./types";

/**
 * Tazelik eşikleri sessizce kayarsa kimse fark etmez: bayat fiyat güncel gibi
 * görünmeye devam eder. Testler eşikleri ve uyarı metnini sabitler.
 */
const SIMDI = new Date("2026-08-01T12:00:00Z").getTime();
const GUN = 86_400_000;

function kayit(type: ItemType, gunOnce: number): Item {
  const tarih = new Date(SIMDI - gunOnce * GUN).toISOString();
  return {
    id: "x",
    slug: "x",
    title: "X",
    description: "",
    type,
    categorySlug: "c",
    brand: "M",
    provenance: { kind: "editor", verifiedAt: tarih },
    editorial: buildEditorial(type, {}),
    signals: null,
    score: 0,
    scoreBasis: "editor",
    scoreBreakdown: {},
    categoryRank: 0,
    categorySize: 1,
    whyRecommended: "",
    attrs: {},
    pros: [],
    cons: [],
    suitableFor: [],
    notSuitableFor: [],
    badges: [],
    isSponsored: false,
    updatedAt: tarih,
    ratingAvg: 0,
    ratingCount: 0,
  };
}

describe("freshnessOf", () => {
  it("bugün doğrulanmış kayıt tazedir", () => {
    expect(freshnessOf(kayit("urun", 0), SIMDI)).toBe("taze");
  });

  it("ürün fiyatı bir haftada eskimeye başlar", () => {
    expect(freshnessOf(kayit("urun", 6), SIMDI)).toBe("taze");
    expect(freshnessOf(kayit("urun", 7), SIMDI)).toBe("eskiyor");
    expect(freshnessOf(kayit("urun", 30), SIMDI)).toBe("bayat");
  });

  it("mekân bilgisi üründen çok daha yavaş eskir", () => {
    // Aynı yaş, farklı sonuç: 30 günlük fiyat bayat, 30 günlük çalışma saati taze.
    expect(freshnessOf(kayit("urun", 30), SIMDI)).toBe("bayat");
    expect(freshnessOf(kayit("mekan", 30), SIMDI)).toBe("taze");
  });

  it("her tipin eşikleri artan sırada", () => {
    for (const t of ["urun", "hizmet", "mekan"] as ItemType[]) {
      expect(FRESHNESS_DAYS[t].eskiyor).toBeLessThan(FRESHNESS_DAYS[t].bayat);
    }
  });

  it("doğrulama tarihi yoksa son güncelleme tarihine düşer", () => {
    const item = kayit("urun", 45);
    item.provenance = { kind: "demo" };
    expect(freshnessOf(item, SIMDI)).toBe("bayat");
  });
});

describe("ageInDays", () => {
  it("gelecek tarihli doğrulamada negatif yaş üretmez", () => {
    expect(ageInDays(kayit("urun", -5), SIMDI)).toBe(0);
  });
});

describe("freshnessWarning", () => {
  it("taze kayıtta uyarı yok — her kayda uyarı koymak uyarıyı gürültüye çevirir", () => {
    expect(freshnessWarning(kayit("urun", 1), SIMDI)).toBeNull();
  });

  it("bayat kayıtta değişmiş olabileceğini söyler", () => {
    const m = freshnessWarning(kayit("urun", 40), SIMDI);
    expect(m).toContain("40 gün");
    expect(m).toContain("değişmiş olabilir");
  });

  it("tipe göre neyin eskidiğini söyler", () => {
    expect(freshnessWarning(kayit("urun", 40), SIMDI)).toContain("Fiyat ve özellikler");
    expect(freshnessWarning(kayit("mekan", 200), SIMDI)).toContain("Saatler ve menü");
  });
});

describe("staleItems", () => {
  it("en eskisini başa alır ve tazeleri listeye almaz", () => {
    const liste = [kayit("urun", 1), kayit("urun", 100), kayit("urun", 40)];
    const bayat = staleItems(liste, SIMDI);
    expect(bayat.length).toBe(2);
    expect(ageInDays(bayat[0], SIMDI)).toBe(100);
  });
});
