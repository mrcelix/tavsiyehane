import { describe, expect, it } from "vitest";
import { tahminiZiyaretci } from "./live-visitors";

/**
 * Tahmini sayının tek savunulabilir tarafı DETERMİNİSTİK olması: aynı sayfa
 * aynı saatte hep aynı sayıyı vermeli. Sayfa her açılışta başka bir sayı
 * gösterirse ziyaretçi bunun uydurma olduğunu ilk yenilemede anlar ve o an
 * sitenin bütün sayılarına duyduğu güven gider.
 */
describe("tahminiZiyaretci", () => {
  it("aynı sayfa ve saat için hep aynı sayıyı verir", () => {
    const a = tahminiZiyaretci("/urun/apple-iphone-17-256gb", 14);
    const b = tahminiZiyaretci("/urun/apple-iphone-17-256gb", 14);
    expect(a).toBe(b);
  });

  it("farklı sayfalar farklı sayı alır", () => {
    const sayilar = new Set(
      ["/urun/a", "/urun/b", "/hizmet/c", "/mekan/d", "/urun/e", "/urun/f"].map((y) => tahminiZiyaretci(y, 12))
    );
    // Çakışma olabilir ama hepsi aynı çıkarsa hash işe yaramıyor demektir.
    expect(sayilar.size).toBeGreaterThan(3);
  });

  it("saate göre dalgalanır ama aynı sayfada makul aralıkta kalır", () => {
    const gun = Array.from({ length: 24 }, (_, s) => tahminiZiyaretci("/urun/apple-iphone-17-256gb", s));
    expect(new Set(gun).size).toBeGreaterThan(1);
    expect(Math.max(...gun) - Math.min(...gun)).toBeLessThanOrEqual(8);
  });

  it("her zaman 3'ten küçük olmaz — '0 kişi bakıyor' anlamsız olurdu", () => {
    for (const yol of ["", "/", "a", "/urun/x", "cok-uzun-bir-sayfa-adresi-olabilir-bu"]) {
      for (let s = 0; s < 24; s++) expect(tahminiZiyaretci(yol, s)).toBeGreaterThanOrEqual(3);
    }
  });

  it("taban aralığı 8-45 içinde kalır (dalga öncesi)", () => {
    for (const yol of ["/a", "/b", "/c", "/d", "/e", "/f", "/g", "/h"]) {
      const v = tahminiZiyaretci(yol, 3); // dalga = 0 olan saat
      expect(v).toBeGreaterThanOrEqual(8);
      expect(v).toBeLessThanOrEqual(45);
    }
  });
});
