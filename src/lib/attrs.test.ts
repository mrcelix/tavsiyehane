import { describe, expect, it } from "vitest";
import { attrFacetValues, isFilterableAttr } from "./attrs";

/**
 * Normalizasyon iki yerde birden kullanılıyor (facets.ts panel üretir,
 * query.ts eşleştirir). Kural değişirse ikisi ayrışır ve panelde görünen
 * seçenek hiçbir kaydı getirmez — sessiz, fark edilmesi zor bir bozulma.
 * Buradaki testler o kuralı sabitler.
 */
describe("attrFacetValues", () => {
  it("virgülle ayrılmış listeyi ayrı değerlere böler", () => {
    expect(attrFacetValues("Uzmanlık", "Bilgisayar, ağ kurulumu, yedekleme")).toEqual([
      "Bilgisayar",
      "Ağ kurulumu",
      "Yedekleme",
    ]);
  });

  it("parantez içi açıklamayı atar", () => {
    expect(attrFacetValues("Paspas", "Var (basit ped)")).toEqual(["Var"]);
  });

  it("sayı + birimi baştan alır, kalan metni atar", () => {
    expect(attrFacetValues("Garanti", "2 yıl resmi distribütör")).toEqual(["2 yıl"]);
    expect(attrFacetValues("Garanti", "6 ay işçilik + parça garantisi")).toEqual(["6 ay"]);
  });

  it("aynı şeyi söyleyen farklı garanti metinlerini tek değere indirger", () => {
    const a = attrFacetValues("Garanti", "2 yıl resmi distribütör");
    const b = attrFacetValues("Garanti", "2 yıl Apple Türkiye");
    const c = attrFacetValues("Garanti", "2 yıl distribütör");
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  it("sözlükteki ifadeleri alan adından bağımsız aynı etikete çevirir", () => {
    expect(attrFacetValues("Otopark", "Var, ücretsiz")).toEqual(["Var", "Ücretsiz"]);
    expect(attrFacetValues("Keşif", "Ücretsiz yerinde keşif")).toEqual(["Ücretsiz"]);
    expect(attrFacetValues("İstasyon", "Yok (şarj dock)")).toEqual(["Yok"]);
  });

  it("aralık tanımlı alanlarda sayıyı kovaya oturtur", () => {
    expect(attrFacetValues("Deneyim", "12 yıl")).toEqual(["10-14 yıl"]);
    expect(attrFacetValues("Deneyim", "20 yıl")).toEqual(["15 yıl ve üzeri"]);
    expect(attrFacetValues("Emiş Gücü", "10.000 Pa")).toEqual(["8.000 Pa ve üzeri"]);
    expect(attrFacetValues("Emiş Gücü", "3200 Pa")).toEqual(["5.000 Pa altı"]);
  });

  it("aralığın birimi tutmuyorsa değeri olduğu gibi bırakır", () => {
    // "Çalışma Süresi" dk için tanımlı; diş fırçasındaki "14 gün" kovaya girmemeli.
    expect(attrFacetValues("Çalışma Süresi", "14 gün")).toEqual(["14 gün"]);
    expect(attrFacetValues("Çalışma Süresi", "240 dk")).toEqual(["180 dk ve üzeri"]);
  });

  it("ekran gibi bileşik değerlerde yenileme hızını ayrı filtre değeri yapar", () => {
    expect(attrFacetValues("Ekran", '6,67" AMOLED, 120 Hz')).toContain("120 Hz");
  });

  it("kamerada ana çözünürlüğü alır", () => {
    expect(attrFacetValues("Kamera", "50 MP (OIS) + 12 MP + 5 MP")).toEqual(["50 MP"]);
  });

  it("adres filtre alanı değildir", () => {
    expect(isFilterableAttr("Adres")).toBe(false);
    expect(attrFacetValues("Adres", "Moda Cad., Kadıköy / İstanbul")).toEqual([]);
  });

  it("boş değer üretmez", () => {
    expect(attrFacetValues("Garanti", undefined)).toEqual([]);
    expect(attrFacetValues("Garanti", "")).toEqual([]);
  });

  it("aynı etiketi iki kez döndürmez", () => {
    const v = attrFacetValues("Duş / Dolap", "Var, havlu ücretsiz, ücretsiz kilit");
    expect(new Set(v).size).toBe(v.length);
  });
});
