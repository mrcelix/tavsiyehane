/**
 * Canlı ziyaretçi rozetinin TAHMİNİ sayısı.
 *
 * Ölçüm yoksa kullanılan yedek. Ayrı dosyada çünkü sözleşmesi test edilebilir
 * olmalı: aynı adres aynı saatte HER ZAMAN aynı sayıyı vermeli. Sayfa her
 * açılışta farklı bir sayı gösterirse ziyaretçi bunun uydurma olduğunu ilk
 * yenilemede anlar.
 *
 * Bu bir ÖLÇÜM DEĞİLDİR ve arayüzde "tahmini" ibaresiyle gösterilir.
 */
export function tahminiZiyaretci(pageKey: string, saatUTC: number): number {
  let h = 2166136261;
  for (let i = 0; i < pageKey.length; i++) {
    h ^= pageKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const taban = 8 + (Math.abs(h) % 38); // 8–45
  // Saatlik dalga: gece daha az, gündüz daha çok.
  const dalga = Math.round(Math.sin(((saatUTC - 3) / 24) * Math.PI * 2) * 4);
  return Math.max(3, taban + dalga);
}
