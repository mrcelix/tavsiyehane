/**
 * Olay gönderimi — istemci tarafı.
 *
 * `EventTracker` içindeydi, buraya çıkarıldı: görüntülenme dışındaki olayları
 * (karşılaştırma, favori) düğmelerin kendisi bildiriyor ve aynı gönderim
 * mantığının iki kopyası olmamalı.
 *
 * GİZLİLİK: IP, user-agent ve kullanıcı kimliği gönderilmez/saklanmaz.
 * `oturum` sekmeye özel ve kimliğe bağlanamaz (bkz. 0012).
 */

const OTURUM_ANAHTARI = "tavsiyehane:oturum";

export function oturumKimligi(): string | undefined {
  try {
    let k = sessionStorage.getItem(OTURUM_ANAHTARI);
    if (!k) {
      k = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(OTURUM_ANAHTARI, k);
    }
    return k;
  } catch {
    return undefined;
  }
}

export function olayGonder(veri: Record<string, unknown>) {
  try {
    const govde = JSON.stringify({ ...veri, oturum: oturumKimligi() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/olay", new Blob([govde], { type: "application/json" }));
    } else {
      void fetch("/api/olay", {
        method: "POST",
        body: govde,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    /* ölçüm başarısız olursa kullanıcı bunu hissetmemeli */
  }
}
