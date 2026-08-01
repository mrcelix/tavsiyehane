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
