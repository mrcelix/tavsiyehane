/**
 * ÜYE KİMLİĞİ E-POSTADIR.
 *
 * Ayrı bir kullanıcı adı tutulmuyor: kayıt sırasında sorulmuyor, girişte
 * kullanılmıyor, yönetimde aranmıyor. Tek kimlik e-posta adresi.
 *
 * Ancak herkese açık sayfalarda TAM adres gösterilmez. Yorum listelerinde
 * yayımlanan e-postalar toplanıp spam ve kimlik avı için kullanılıyor; bu
 * sitenin yorumlarını da aynı riske açmanın hiçbir karşılığı yok. Bu yüzden:
 *
 *   - Üyenin kendisine (hesap sayfası, başlık) TAM adres gösterilir.
 *   - Herkese açık yerlerde (yorumlar, moderasyon listesi) MASKELİ gösterilir.
 */

/** `mustafa@gmail.com` -> `mus•••@gmail.com` */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  const yerel = email.slice(0, at);
  const alan = email.slice(at);
  // Çok kısa yerel kısımda ilk harften fazlasını göstermek maskeyi anlamsız kılar.
  const gorunen = yerel.length <= 3 ? yerel.slice(0, 1) : yerel.slice(0, 3);
  return `${gorunen}•••${alan}`;
}

/** Avatar baş harfleri — e-postanın yerel kısmından. */
export function emailInitials(email: string): string {
  const yerel = email.split("@")[0] ?? email;
  const harfler = yerel.replace(/[^\p{L}\p{N}]/gu, "");
  return (harfler.slice(0, 2) || "ÜY").toLocaleUpperCase("tr");
}
