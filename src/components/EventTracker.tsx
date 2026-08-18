"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { olayGonder } from "@/lib/olay";

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

export function EventTracker({ itemId }: { itemId?: string }) {
  const yol = usePathname();

  useEffect(() => {
    olayGonder({ tur: "goruntuleme", yol, itemId });
  }, [yol, itemId]);

  useEffect(() => {
    function tiklama(e: MouseEvent) {
      const hedef = (e.target as HTMLElement | null)?.closest("a");
      if (!hedef) return;
      const href = hedef.getAttribute("href") ?? "";
      // Yalnızca dış bağlantılar "çıkış" sayılır; iç gezinme zaten görüntülenme üretir.
      if (!/^https?:\/\//i.test(href)) return;
      if (href.includes(location.host)) return;
      olayGonder({ tur: "cikis", yol, itemId, hedef: href });
    }
    document.addEventListener("click", tiklama, { capture: true });
    return () => document.removeEventListener("click", tiklama, { capture: true });
  }, [yol, itemId]);

  return null;
}
