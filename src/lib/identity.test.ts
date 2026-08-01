import { describe, expect, it } from "vitest";
import { emailInitials, maskEmail } from "./identity";
import { MIN_PASSWORD_SCORE, authErrorMessage, isValidEmail, passwordStrength } from "@/components/auth/authMessages";

/**
 * Maskeleme bir gizlilik önlemidir: herkese açık yorum listelerinde yayımlanan
 * e-postalar toplanıp spam için kullanılıyor. Maskenin bozulması sessizce olur
 * ve fark edildiğinde adresler çoktan dışarıdadır — bu yüzden test edilir.
 */
describe("maskEmail", () => {
  it("yerel kısmın ilk üç harfini bırakır, gerisini gizler", () => {
    expect(maskEmail("mustafa@gmail.com")).toBe("mus•••@gmail.com");
  });

  it("alan adını olduğu gibi korur", () => {
    expect(maskEmail("ayse@sirket.com.tr")).toContain("@sirket.com.tr");
  });

  it("kısa yerel kısımda yalnızca ilk harfi gösterir", () => {
    expect(maskEmail("ab@x.com")).toBe("a•••@x.com");
  });

  it("hiçbir durumda tam yerel kısmı sızdırmaz", () => {
    for (const e of ["mustafa@a.com", "ab@a.com", "a@a.com", "uzunbiradres@a.com"]) {
      const yerel = e.split("@")[0];
      if (yerel.length > 1) expect(maskEmail(e)).not.toContain(`${yerel}@`);
    }
  });

  it("e-posta değilse olduğu gibi döner", () => {
    expect(maskEmail("adres-degil")).toBe("adres-degil");
  });
});

describe("emailInitials", () => {
  it("yerel kısmın ilk iki harfini büyütür", () => {
    expect(emailInitials("mustafa@gmail.com")).toBe("MU");
  });

  it("Türkçe harfleri doğru büyütür", () => {
    expect(emailInitials("ilker@x.com")).toBe("İL");
  });

  it("harf yoksa varsayılana düşer", () => {
    expect(emailInitials("__@x.com")).toBe("ÜY");
  });
});

describe("isValidEmail", () => {
  it("geçerli adresleri kabul eder", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail(" a@b.com ")).toBe(true);
  });

  it("eksik adresleri reddeder", () => {
    for (const kotu of ["", "a", "a@", "@b.com", "a@b", "a b@c.com"]) {
      expect(isValidEmail(kotu)).toBe(false);
    }
  });
});

describe("passwordStrength", () => {
  it("boş şifreye puan vermez", () => {
    expect(passwordStrength("").score).toBe(0);
  });

  it("zayıf şifrede etiket boş kalmaz", () => {
    const g = passwordStrength("abc");
    expect(g.label).not.toBe("");
    expect(g.hint).toContain("en az 8 karakter");
  });

  it("eksik koşulları tek tek söyler", () => {
    expect(passwordStrength("abcdefgh").hint).toContain("büyük ve küçük harf");
    expect(passwordStrength("Abcdefgh").hint).toContain("rakam");
    expect(passwordStrength("Abcdefg1").hint).toContain("noktalama");
  });

  it("dört koşulu sağlayan şifreyi güçlü sayar", () => {
    const g = passwordStrength("Guclu.Sifre2026");
    expect(g.score).toBe(4);
    expect(g.label).toBe("Güçlü");
    expect(g.score).toBeGreaterThanOrEqual(MIN_PASSWORD_SCORE);
  });

  it("kayıt eşiğini sekiz karakterin altındaki şifre geçemez", () => {
    expect(passwordStrength("Ab1!").score).toBeLessThan(MIN_PASSWORD_SCORE);
  });
});

describe("authErrorMessage", () => {
  it("Supabase hatalarını Türkçeye çevirir", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"))).toContain("E-posta veya şifre hatalı");
    expect(authErrorMessage(new Error("Email not confirmed"))).toContain("doğrulamadınız");
    expect(authErrorMessage(new Error("User already registered"))).toContain("zaten bir hesap var");
    expect(authErrorMessage(new Error("Provider is not enabled"))).toContain("etkin değil");
  });

  it("tanımadığı hatayı gizlemez", () => {
    // Ham metni yutmak, sorunu bildiren kullanıcıyı da bizi de kör bırakır.
    expect(authErrorMessage(new Error("beklenmedik özel hata"))).toBe("beklenmedik özel hata");
  });

  it("boş hatada anlamlı bir metin döner", () => {
    expect(authErrorMessage(null)).toBe("Beklenmeyen bir hata oluştu.");
  });
});
