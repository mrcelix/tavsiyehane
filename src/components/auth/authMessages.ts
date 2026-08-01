/**
 * Supabase hata mesajlarını Türkçeleştirir.
 *
 * Ham mesajlar İngilizce ve teknik ("Invalid login credentials"); kullanıcıya
 * ne yapması gerektiğini söylemezler. Eşleşmeyen bir hata olduğunda ham metni
 * gizlemek yerine gösteriyoruz — sorunu bildiren kullanıcıya yardımcı olur.
 */
const ESLEME: [RegExp, string][] = [
  [/invalid login credentials/i, "E-posta veya şifre hatalı. Şifrenizi unuttuysanız sıfırlayabilirsiniz."],
  [/email not confirmed/i, "E-postanızı henüz doğrulamadınız. Gelen kutunuzdaki bağlantıya tıklayın."],
  [/user already registered|already been registered/i, "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin."],
  [/password should be at least/i, "Şifre en az 8 karakter olmalı."],
  [/unable to validate email address|invalid email/i, "E-posta adresi geçerli görünmüyor."],
  [/for security purposes|rate limit|too many requests/i, "Çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin."],
  [/network|fetch failed/i, "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin."],
  [/provider is not enabled/i, "Google ile giriş bu ortamda etkin değil. Yönetici Supabase panelinden açmalı."],
];

export function authErrorMessage(err: unknown): string {
  const ham = err instanceof Error ? err.message : String(err ?? "");
  for (const [re, tr] of ESLEME) if (re.test(ham)) return tr;
  return ham || "Beklenmeyen bir hata oluştu.";
}

export interface PasswordStrength {
  /** 0-4 */
  score: number;
  label: string;
  /** Kullanıcıya somut eksik: "büyük harf ekleyin" gibi */
  hint: string;
}

/** Kayıt için kabul edilen en düşük güç — 8 karakter + iki koşul daha. */
export const MIN_PASSWORD_SCORE = 3;

/**
 * Şifre gücü. Amaç yasak koymak değil, eksiği söylemek: "zayıf" yazıp
 * nedenini söylememek kullanıcıyı tahmin etmeye zorlar.
 */
export function passwordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "", hint: "" };

  const kosullar = [
    { ok: pw.length >= 8, eksik: "en az 8 karakter" },
    { ok: /[a-zçğıöşü]/.test(pw) && /[A-ZÇĞİÖŞÜ]/.test(pw), eksik: "büyük ve küçük harf" },
    { ok: /\d/.test(pw), eksik: "rakam" },
    { ok: /[^\p{L}\d]/u.test(pw), eksik: "noktalama işareti" },
  ];

  const ham = kosullar.filter((k) => k.ok).length;
  // Uzunluk diğer koşullarla eşit ağırlıkta sayılamaz: "Ab1!" üç koşulu birden
  // sağlar ama dört karakterdir ve kaba kuvvetle saniyeler içinde kırılır.
  // Uzunluk sağlanmadan puan hiçbir zaman kayıt eşiğine ulaşmaz.
  const score = kosullar[0].ok ? ham : Math.min(ham, MIN_PASSWORD_SCORE - 1);
  const eksikler = kosullar.filter((k) => !k.ok).map((k) => k.eksik);
  // 0. eleman da doludur: hiçbir koşulu sağlamayan şifre "etiketsiz" değil, çok zayıftır.
  const label = ["Çok zayıf", "Çok zayıf", "Zayıf", "İyi", "Güçlü"][score];
  const hint = eksikler.length > 0 ? `Güçlendirmek için ${eksikler.join(", ")} ekleyin.` : "Bu şifre güçlü.";
  return { score, label, hint };
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
