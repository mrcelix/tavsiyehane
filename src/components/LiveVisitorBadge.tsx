"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { tahminiZiyaretci } from "@/lib/live-visitors";

/**
 * CANLI ZİYARETÇİ ROZETİ
 *
 * Sayfanın altında ortalanmış, kapatılabilir küçük bir kart.
 *
 * VERİ KAYNAĞI İKİ TÜRLÜ ve ikisi AYNI GÖRÜNMÜYOR:
 *
 *  1. ÖLÇÜLMÜŞ (`gercek: true`) — son 5 dakikada bu yolda görüntüleme bırakan
 *     tekil oturum sayısı (bkz. api/canli). Metin "şu anda N kişi görüntülüyor".
 *
 *  2. TAHMİNİ — ölçüm yoksa sayfa adresinden türetilen deterministik bir sayı.
 *     Bu bir ÖLÇÜM DEĞİLDİR ve öyleymiş gibi sunulmuyor: rozette "tahmini"
 *     ibaresi ve açıklayıcı `title` yer alıyor. Sitenin Şeffaflık Karnesi
 *     "sayılar güzelleştirilmiyor" diyor; ölçülmemiş bir sayıyı ölçülmüş gibi
 *     göstermek o cümleyi çürütürdü.
 *
 * Kapatma sekme boyunca hatırlanır (sessionStorage) — kapattığı bir şeyin her
 * gezinmede geri gelmesi, rahatsız etmemesi istenen bir bileşen için en kötüsü.
 */

export interface LiveVisitorBadgeProps {
  /** Deterministik sayı ve ölçüm sorgusu için sayfa anahtarı (genelde yol). */
  pageKey: string;
  /** Özel metin; `{n}` sayıyla değiştirilir. */
  label?: string;
  /**
   * Ölçüm yokken tahmini sayı gösterilsin mi. Kapatılırsa rozet yalnızca
   * gerçek veri varken çıkar.
   */
  tahminiGoster?: boolean;
}

const KAPATMA_ANAHTARI = "tavsiyehane:canli-rozet-kapali";

export function LiveVisitorBadge({ pageKey, label, tahminiGoster = true }: LiveVisitorBadgeProps) {
  const [gorunur, setGorunur] = useState(false);
  const [sayi, setSayi] = useState<number | null>(null);
  const [gercek, setGercek] = useState(false);

  // Açılış: kapatılmışsa hiç çizme, değilse veriyi getir.
  useEffect(() => {
    let iptal = false;
    try {
      if (sessionStorage.getItem(KAPATMA_ANAHTARI) === "1") return;
    } catch {
      /* sessionStorage yoksa rozet yine çalışır */
    }

    async function getir() {
      try {
        const r = await fetch(`/api/canli?yol=${encodeURIComponent(pageKey)}`);
        const v = await r.json();
        if (iptal) return;
        if (v?.gercek && v.sayi > 0) {
          setSayi(v.sayi);
          setGercek(true);
          setGorunur(true);
          return;
        }
      } catch {
        /* ölçüm alınamadı; aşağıdaki tahmine düşülür */
      }
      if (iptal) return;
      if (tahminiGoster) {
        setSayi(tahminiZiyaretci(pageKey, new Date().getUTCHours()));
        setGercek(false);
        setGorunur(true);
      }
    }
    void getir();
    return () => {
      iptal = true;
    };
  }, [pageKey, tahminiGoster]);

  // Canlılık: 20–40 saniyede bir tazele. Ölçülmüş sayıda gerçekten yeniden
  // sorulur; tahminî sayıda ±1-2 oynatılır.
  useEffect(() => {
    if (!gorunur) return;
    let zaman: ReturnType<typeof setTimeout>;

    const planla = () => {
      const gecikme = 20_000 + Math.random() * 20_000;
      zaman = setTimeout(async () => {
        if (gercek) {
          try {
            const r = await fetch(`/api/canli?yol=${encodeURIComponent(pageKey)}`);
            const v = await r.json();
            if (v?.gercek) setSayi(v.sayi);
          } catch {
            /* geçici hata: eldeki sayı kalsın */
          }
        } else {
          setSayi((s) => {
            if (s === null) return s;
            const adim = Math.random() < 0.5 ? -1 : 1;
            const miktar = Math.random() < 0.3 ? 2 : 1;
            return Math.max(3, s + adim * miktar);
          });
        }
        planla();
      }, gecikme);
    };
    planla();
    return () => clearTimeout(zaman);
  }, [gorunur, gercek, pageKey]);

  function kapat() {
    setGorunur(false);
    try {
      sessionStorage.setItem(KAPATMA_ANAHTARI, "1");
    } catch {
      /* kapatma hatırlanamadı; en fazla bir sonraki sayfada geri gelir */
    }
  }

  if (!gorunur || sayi === null) return null;

  const metin = label
    ? label.replace("{n}", String(sayi))
    : `Şu anda ${sayi} kişi bu sayfayı görüntülüyor`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2.5 rounded-full py-2 pl-3 pr-2",
          // Cam efekti: arkasındaki içerik bulanıklaşır, rozet sayfanın üstünde
          // yüzer. Açık ve koyu modda ayrı zemin — tek renk ikisinde de doğru
          // görünmüyordu.
          "border border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_78%,transparent)]",
          "shadow-[var(--shadow-pop)] backdrop-blur-md",
          "animate-fade-in"
        )}
      >
        {/* Konik gradyan halka + glow + ping. Halka dönen bir gradyan, içi
            sayfanın zemini; ortadaki nokta nabız atıyor. */}
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, var(--up), color-mix(in oklab, var(--up) 30%, transparent), var(--up))",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[2px] rounded-full bg-[color-mix(in_oklab,var(--paper)_92%,transparent)]"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60 blur-[6px]"
            style={{ background: "radial-gradient(circle, var(--up), transparent 65%)" }}
          />
          <span aria-hidden className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[var(--up)] opacity-60" />
          <span aria-hidden className="relative h-2 w-2 animate-pulse rounded-full bg-[var(--up)]" />
        </span>

        {/* `aria-live=polite`: sayı değiştiğinde ekran okuyucu araya girmeden
            haber verir. Sayfa okunurken sözü kesmemeli. */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="whitespace-nowrap text-[13px] font-semibold text-[var(--ink-2)]"
        >
          {metin}
          {!gercek && (
            <span
              className="ml-1.5 rounded-full bg-[var(--mist-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--muted)]"
              title="Bu sayı ölçüm değil, sayfa adresinden üretilmiş tahmini bir değerdir."
            >
              tahmini
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={kapat}
          aria-label="Canlı ziyaretçi rozetini kapat"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] max-sm:h-11 max-sm:w-11"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
