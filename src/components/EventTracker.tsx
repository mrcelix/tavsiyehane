"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sayfa görüntülenmelerini ve dış bağlantı tıklamalarını kaydeder.
 *
 * Üçüncü taraf bir analitik yerine kendi uç noktamız: bu sitenin ölçmesi
 * gereken şey ziyaretçinin kim olduğu değil, hangi kaydın ilgi çektiği.
 * Onu ölçmek için çerez de kimlik de gerekmiyor (bkz. api/olay).
 *
 * `sendBeacon` kullanılıyor: sayfa kapanırken bile istek tamamlanır ve
 * gezinmeyi geciktirmez.
 */

/**
 * Sekmeye özel, kimliğe bağlanamayan oturum kimliği.
 *
 * "Şu anda kaç kişi bakıyor" sorusu için gerekli: onsuz bir kişinin beş kez
 * yenilemesi ile beş kişinin bakması aynı görünür. `sessionStorage` olduğu için
 * sekme kapanınca kaybolur — kalıcı çerez değil, cihaza ya da kişiye geri
 * bağlanamaz.
 */
function oturumKimligi(): string | undefined {
  try {
    const ANAHTAR = "tavsiyehane:oturum";
    let k = sessionStorage.getItem(ANAHTAR);
    if (!k) {
      k = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(ANAHTAR, k);
    }
    return k;
  } catch {
    return undefined;
  }
}

function gonder(veri: Record<string, unknown>) {
  try {
    const govde = JSON.stringify(veri);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/olay", new Blob([govde], { type: "application/json" }));
    } else {
      void fetch("/api/olay", { method: "POST", body: govde, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {
    /* ölçüm başarısız olursa kullanıcı bunu hissetmemeli */
  }
}

export function EventTracker({ itemId }: { itemId?: string }) {
  const yol = usePathname();

  useEffect(() => {
    gonder({ tur: "goruntuleme", yol, itemId, oturum: oturumKimligi() });
  }, [yol, itemId]);

  useEffect(() => {
    function tiklama(e: MouseEvent) {
      const hedef = (e.target as HTMLElement | null)?.closest("a");
      if (!hedef) return;
      const href = hedef.getAttribute("href") ?? "";
      // Yalnızca dış bağlantılar "çıkış" sayılır; iç gezinme zaten görüntülenme üretir.
      if (!/^https?:\/\//i.test(href)) return;
      if (href.includes(location.host)) return;
      gonder({ tur: "cikis", yol, itemId, hedef: href, oturum: oturumKimligi() });
    }
    document.addEventListener("click", tiklama, { capture: true });
    return () => document.removeEventListener("click", tiklama, { capture: true });
  }, [yol, itemId]);

  return null;
}
