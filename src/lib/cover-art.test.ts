import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { CoverArt } from "@/components/CoverArt";

/**
 * Üretilmiş kapağın tek sözü var: aynı kayıt her zaman aynı kapağı alır.
 * Bu bozulursa liste her yenilemede farklı görünür, kullanıcı kaydı tanıyamaz
 * ve sunucu ile istemci çıktısı ayrışıp hidratasyon uyarısı üretir.
 */
function ciz(slug: string, type: "urun" | "hizmet" | "mekan" = "urun") {
  return renderToStaticMarkup(
    createElement(CoverArt, { slug, type, categorySlug: "telefon" })
  );
}

describe("CoverArt", () => {
  it("aynı slug için aynı çıktıyı üretir", () => {
    expect(ciz("samsung-galaxy-s25-fe")).toBe(ciz("samsung-galaxy-s25-fe"));
  });

  it("farklı slug'lar için farklı kapak üretir", () => {
    const a = ciz("apple-iphone-17-256gb");
    const b = ciz("samsung-galaxy-a56-256gb");
    expect(a).not.toBe(b);
  });

  it("tipe göre farklı ton aralığı kullanır", () => {
    // Aynı slug, farklı tip: renk aralıkları ayrı olduğu için çıktı farklı olmalı.
    expect(ciz("ayni-slug", "urun")).not.toBe(ciz("ayni-slug", "mekan"));
  });

  it("desen kimliği geçerli bir SVG tanımlayıcısı üretir", () => {
    // Slug'daki Türkçe harfler ve boşluklar id'ye sızarsa SVG referansı kırılır.
    const html = ciz("çok-özel-slug-2026");
    const idler = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(idler.length).toBeGreaterThan(0);
    for (const id of idler) expect(id).toMatch(/^p-[a-z0-9]+(-g)?$/);
  });

  it("slug temizlense aynı kalacak iki kayda farklı kimlik verir", () => {
    // "cok-ozel" ve "çok-özel" harf ayıklandığında çakışabilirdi; kimlik
    // hash'ten üretildiği için artık çakışmıyor.
    const idAl = (s: string) => /id="(p-[a-z0-9]+)"/.exec(ciz(s))?.[1];
    expect(idAl("cok-ozel")).not.toBe(idAl("çok-özel"));
    expect(idAl("a-b")).not.toBe(idAl("ab"));
  });

  it("erişilebilirlik ağacından çıkarılır — dekoratif bir görseldir", () => {
    expect(ciz("x")).toContain('aria-hidden="true"');
  });
});
