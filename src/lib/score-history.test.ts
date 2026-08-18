import { describe, expect, it } from "vitest";
import { baskinBilesenBul, bilesenEtiketi } from "./score-history";

/**
 * Puan Günlüğü'nün asıl iddiası "puan düştü" değil, "ŞU BİLEŞEN yüzünden
 * düştü". Grafiğin altındaki o cümle yanlışsa özellik yanlış bilgi veriyor
 * demektir; testler onu koruyor.
 */
describe("baskinBilesenBul", () => {
  it("en çok oynayan bileşeni seçer", () => {
    const b = baskinBilesenBul(
      "urun",
      { fiyatKarsiligi: 80, ozellikSeviyesi: 70, garantiDestek: 60 },
      { fiyatKarsiligi: 72, ozellikSeviyesi: 73, garantiDestek: 60 }
    );
    expect(b).toEqual({ etiket: "Fiyat karşılığı", fark: -8 });
  });

  it("yön fark etmez: en büyük MUTLAK değişim kazanır", () => {
    const b = baskinBilesenBul("urun", { fiyatKarsiligi: 50, ozellikSeviyesi: 50 }, { fiyatKarsiligi: 53, ozellikSeviyesi: 61 });
    expect(b).toEqual({ etiket: "Özellik seviyesi", fark: 11 });
  });

  it("hiçbir bileşen değişmediyse null döner — uydurma sebep gösterilmez", () => {
    expect(baskinBilesenBul("urun", { fiyatKarsiligi: 80 }, { fiyatKarsiligi: 80 })).toBeNull();
  });

  it("yalnızca bir tarafta olan bileşeni de sayar", () => {
    const b = baskinBilesenBul("mekan", {}, { amacaUygunluk: 40 });
    expect(b).toEqual({ etiket: "Amaca uygunluk", fark: 40 });
  });

  it("boş kümelerde null döner", () => {
    expect(baskinBilesenBul("hizmet", {}, {})).toBeNull();
  });
});

describe("bilesenEtiketi", () => {
  it("topluluk, editör ve dış sinyal modellerinin hepsinden etiket bulur", () => {
    expect(bilesenEtiketi("urun", "topluluk")).toBe("Topluluk oyu");
    expect(bilesenEtiketi("urun", "fiyatKarsiligi")).toBe("Fiyat karşılığı");
    expect(bilesenEtiketi("urun", "disIvme")).toBe("Arama ilgisindeki artış");
  });

  it("tanınmayan anahtarı olduğu gibi bırakır — uydurma etiket üretmez", () => {
    expect(bilesenEtiketi("urun", "bilinmeyenAnahtar")).toBe("bilinmeyenAnahtar");
  });
});
