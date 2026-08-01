import { describe, expect, it } from "vitest";
import {
  MIN_VOTES_PER_ITEM,
  buildEditorial,
  editorialScore,
  hasCommunityData,
  scoreCategory,
} from "./scoring";
import type { Item, ItemSignals } from "./types";

/**
 * Puanlamanın taşıdığı iddia şu: gösterilen sayının dayanağı her zaman doğru
 * etiketlenir ve olmayan veri uydurulmaz. Buradaki testler o iddiayı korur.
 */

function sinyal(p: Partial<ItemSignals> = {}): ItemSignals {
  return {
    interest30: 100,
    interestPrev30: 100,
    votesUp: 10,
    votesDown: 2,
    votesInterest: 5,
    weeksTracked: 20,
    weeksTop: 10,
    editor: 70,
    ...p,
  };
}

function kayit(slug: string, over: Partial<Item> = {}): Item {
  return {
    id: slug,
    slug,
    title: slug,
    description: "",
    type: "urun",
    categorySlug: "test",
    brand: "M",
    provenance: { kind: "editor" },
    editorial: buildEditorial("urun", {
      ozellikSeviyesi: 80,
      fiyatKarsiligi: 80,
      garantiDestek: 80,
      erisilebilirlik: 80,
      bilgiGuvenilirligi: 80,
    }),
    signals: sinyal(),
    score: 0,
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

describe("editorialScore", () => {
  it("kriterleri ağırlıklarıyla toplar", () => {
    const s = editorialScore("urun", {
      ozellikSeviyesi: 100,
      fiyatKarsiligi: 100,
      garantiDestek: 100,
      erisilebilirlik: 100,
      bilgiGuvenilirligi: 100,
    });
    expect(s).toBe(100);
  });

  it("girilmemiş kriteri varsayılan sayıyla doldurmaz, kalan ağırlığa böler", () => {
    // Yalnızca iki kriter verildi; ikisi de 60 ise sonuç 60 olmalı — eksik
    // kriterler 50 sayılsaydı sonuç 60'ın altına düşerdi.
    const s = editorialScore("urun", { ozellikSeviyesi: 60, fiyatKarsiligi: 60 });
    expect(s).toBe(60);
  });

  it("hiç kriter yoksa 0 döner", () => {
    expect(editorialScore("urun", {})).toBe(0);
  });
});

describe("hasCommunityData", () => {
  it("sinyal yoksa topluluk verisi yoktur", () => {
    expect(hasCommunityData(kayit("a", { signals: null }))).toBe(false);
  });

  it("eşiğin altındaki oy sayısı yeterli değildir", () => {
    const az = sinyal({ votesUp: 1, votesDown: 0, votesInterest: 1 });
    expect(hasCommunityData(kayit("a", { signals: az }))).toBe(false);
  });

  it("eşiğe ulaşan oy sayısı yeterlidir", () => {
    const tam = sinyal({ votesUp: MIN_VOTES_PER_ITEM, votesDown: 0, votesInterest: 0 });
    expect(hasCommunityData(kayit("a", { signals: tam }))).toBe(true);
  });
});

describe("scoreCategory — dayanak seçimi", () => {
  it("hiç oy yoksa tüm kohort editör dayanağıyla puanlanır", () => {
    const kohort = [kayit("a", { signals: null }), kayit("b", { signals: null })];
    const puanli = scoreCategory(kohort);
    expect(puanli.every((i) => i.scoreBasis === "editor")).toBe(true);
    // Editör dayanağında puan mutlaktır: kriterler 80 ise puan da 80.
    expect(puanli[0].score).toBe(80);
  });

  it("editör dayanağında kırılım editör kriterlerini gösterir", () => {
    const puanli = scoreCategory([kayit("a", { signals: null })]);
    expect(Object.keys(puanli[0].scoreBreakdown)).toContain("ozellikSeviyesi");
    expect(Object.keys(puanli[0].scoreBreakdown)).not.toContain("topluluk");
  });

  it("yeterli oy varsa topluluk dayanağına geçer", () => {
    const kohort = [kayit("a"), kayit("b"), kayit("c"), kayit("d")];
    const puanli = scoreCategory(kohort);
    expect(puanli.every((i) => i.scoreBasis === "topluluk")).toBe(true);
    expect(Object.keys(puanli[0].scoreBreakdown)).toContain("topluluk");
  });

  it("kohortun yarısından azı oy almışsa editör dayanağında kalır", () => {
    // Dört kayıttan yalnızca biri oy almış: karışık dayanak sıralamayı bozar,
    // bu yüzden tamamı editör moduna düşmeli.
    const kohort = [
      kayit("a"),
      kayit("b", { signals: null }),
      kayit("c", { signals: null }),
      kayit("d", { signals: null }),
    ];
    expect(scoreCategory(kohort).every((i) => i.scoreBasis === "editor")).toBe(true);
  });

  it("her kayda kategori sırası ve kohort büyüklüğü yazar", () => {
    const kohort = [
      kayit("dusuk", { signals: null, editorial: buildEditorial("urun", { ozellikSeviyesi: 20 }) }),
      kayit("yuksek", { signals: null, editorial: buildEditorial("urun", { ozellikSeviyesi: 95 }) }),
    ];
    const puanli = scoreCategory(kohort);
    const lider = puanli.find((i) => i.slug === "yuksek")!;
    expect(lider.categoryRank).toBe(1);
    expect(lider.categorySize).toBe(2);
  });

  it("boş kohortta çökmez", () => {
    expect(scoreCategory([])).toEqual([]);
  });
});

describe("scoreCategory — dış sinyal dayanağı", () => {
  const disSinyal = (ilgi: number, onceki: number, fiyat?: number) => ({
    aramaIlgi30: ilgi,
    aramaIlgiOnceki30: onceki,
    ...(fiyat !== undefined ? { fiyatDegisim30: fiyat } : {}),
    kaynak: { label: "Google Trends", checkedAt: "2026-08-01" },
  });

  it("oy yokken ama dış ölçüm varken dış sinyal dayanağına geçer", () => {
    const kohort = [
      kayit("a", { signals: null, external: disSinyal(80, 40) }),
      kayit("b", { signals: null, external: disSinyal(30, 35) }),
    ];
    const puanli = scoreCategory(kohort);
    expect(puanli.every((i) => i.scoreBasis === "dis-sinyal")).toBe(true);
  });

  it("dış ölçüm de yoksa editör dayanağında kalır", () => {
    const kohort = [kayit("a", { signals: null }), kayit("b", { signals: null })];
    expect(scoreCategory(kohort).every((i) => i.scoreBasis === "editor")).toBe(true);
  });

  it("oy varsa dış sinyali değil topluluğu kullanır — öncelik sırası korunur", () => {
    const kohort = [
      kayit("a", { external: disSinyal(90, 10) }),
      kayit("b", { external: disSinyal(10, 90) }),
    ];
    expect(scoreCategory(kohort).every((i) => i.scoreBasis === "topluluk")).toBe(true);
  });

  it("kohortun yarısından azında dış ölçüm varsa editöre düşer", () => {
    const kohort = [
      kayit("a", { signals: null, external: disSinyal(80, 40) }),
      kayit("b", { signals: null }),
      kayit("c", { signals: null }),
      kayit("d", { signals: null }),
    ];
    expect(scoreCategory(kohort).every((i) => i.scoreBasis === "editor")).toBe(true);
  });

  it("ivmesi yüksek olan kaydı üste çıkarır", () => {
    const kohort = [
      kayit("yukselen", { signals: null, external: disSinyal(90, 30) }),
      kayit("dusen", { signals: null, external: disSinyal(30, 90) }),
    ];
    const puanli = scoreCategory(kohort);
    const y = puanli.find((i) => i.slug === "yukselen")!;
    const d = puanli.find((i) => i.slug === "dusen")!;
    expect(y.score).toBeGreaterThan(d.score);
  });

  it("ucuzlayan ürünü pahalılaşandan üste koyar", () => {
    // Arama sinyalleri aynı; tek fark fiyat yönü.
    const kohort = [
      kayit("ucuzladi", { signals: null, external: disSinyal(50, 50, -10) }),
      kayit("zamlandi", { signals: null, external: disSinyal(50, 50, 10) }),
    ];
    const puanli = scoreCategory(kohort);
    const u = puanli.find((i) => i.slug === "ucuzladi")!;
    const z = puanli.find((i) => i.slug === "zamlandi")!;
    expect(u.score).toBeGreaterThan(z.score);
  });

  it("kırılımda dış sinyal kriterlerini gösterir, oy sinyallerini değil", () => {
    const puanli = scoreCategory([
      kayit("a", { signals: null, external: disSinyal(60, 50) }),
      kayit("b", { signals: null, external: disSinyal(40, 50) }),
    ]);
    const anahtarlar = Object.keys(puanli[0].scoreBreakdown);
    expect(anahtarlar).toContain("disIvme");
    expect(anahtarlar).not.toContain("topluluk");
    expect(anahtarlar).not.toContain("memnuniyet");
  });
});

describe("dış sinyal oy yerine geçmez", () => {
  it("dış sinyalli kaydın oy sayısı sıfır kalır", () => {
    const item = kayit("a", {
      signals: null,
      external: {
        aramaIlgi30: 95,
        aramaIlgiOnceki30: 20,
        kaynak: { label: "Google Trends", checkedAt: "2026-08-01" },
      },
    });
    // Arayüz oy sayısını buradan okur; dış sinyal ne kadar yüksek olursa olsun
    // bir oy üretmez.
    expect(item.signals).toBeNull();
    expect(hasCommunityData(item)).toBe(false);
  });
});
