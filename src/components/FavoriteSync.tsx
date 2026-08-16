"use client";

import { useEffect } from "react";
import { favorileriEsitle } from "./FavoriteButton";

/**
 * Sayfa açıldığında favorileri buluttan çeker ve yerelle birleştirir.
 *
 * Düzende tek örnek: eşitleme oturum başına bir kez yeterli, her favori
 * bileşeninin ayrı ayrı sorması gereksiz istek olurdu.
 *
 * Çıktısı yok — iş yerel depoyu güncelleyip `favs-changed` olayını yayınlamak.
 * Dinleyen bileşenler (kalp düğmeleri, /favoriler sayfası) kendiliğinden
 * tazeleniyor.
 */
export function FavoriteSync() {
  useEffect(() => {
    void favorileriEsitle();
  }, []);
  return null;
}
