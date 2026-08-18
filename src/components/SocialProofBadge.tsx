"use client";

import { Heart, Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * SON 24 SAAT ETKİLEŞİM ROZETİ
 *
 * Canlı ziyaretçi rozetinin hemen üstünde duran ikinci kart: bu kayıt son 24
 * saatte kaç kez karşılaştırmaya eklendi ve kaç kez favorilendi.
 *
 * SAYILAR TAMAMEN GERÇEK. Uydurma yedeği YOK — çünkü burada uydurmaya gerek
 * de yok: veri `events` tablosunda gerçekten duruyor (düğmeler yazıyor).
 * Etkileşim yoksa rozet HİÇ ÇİZİLMİYOR; "0 kişi favoriledi" yazmak sosyal
 * kanıt olmadığını ilan etmenin en gürültülü yoludur.
 *
 * Görsel dil canlı ziyaretçi rozetiyle aynı: cam efekti, konik gradyan halka,
 * glow ve ping. İki rozet aynı aileden görünmeli.
 */

export interface SocialProofBadgeProps {
  /** Sayımın yapılacağı kayıt. */
  itemId: string;
  /** Rozetin görünmesi için gereken en az toplam etkileşim. */
  esik?: number;
}

const KAPATMA_ANAHTARI = "tavsiyehane:etkilesim-rozet-kapali";

export function SocialProofBadge({ itemId, esik = 1 }: SocialProofBadgeProps) {
  const [gorunur, setGorunur] = useState(false);
  const [sayilar, setSayilar] = useState<{ karsilastirma: number; favori: number } | null>(null);

  useEffect(() => {
    let iptal = false;
    try {
      if (sessionStorage.getItem(KAPATMA_ANAHTARI) === "1") return;
    } catch {
      /* sessionStorage yoksa rozet yine çalışır */
    }

    (async () => {
      try {
        const r = await fetch(`/api/etkilesim?itemId=${encodeURIComponent(itemId)}`);
        const v = await r.json();
        if (iptal || !v?.gercek) return;
        const toplam = (v.karsilastirma ?? 0) + (v.favori ?? 0);
        if (toplam < esik) return; // Etkileşim yoksa sessiz kal.
        setSayilar({ karsilastirma: v.karsilastirma, favori: v.favori });
        setGorunur(true);
      } catch {
        /* ölçüm alınamadı: rozet hiç çıkmaz, uydurma sayı gösterilmez */
      }
    })();

    return () => {
      iptal = true;
    };
  }, [itemId, esik]);

  function kapat() {
    setGorunur(false);
    try {
      sessionStorage.setItem(KAPATMA_ANAHTARI, "1");
    } catch {
      /* kapatma hatırlanamadı */
    }
  }

  if (!gorunur || !sayilar) return null;

  const parcalar: string[] = [];
  if (sayilar.karsilastirma > 0) parcalar.push(`${sayilar.karsilastirma} kez karşılaştırıldı`);
  if (sayilar.favori > 0) parcalar.push(`${sayilar.favori} kez favorilendi`);

  return (
    <>
      <div
        className={cn(
          "pointer-events-auto flex max-w-full items-center gap-2.5 rounded-full py-2 pl-3 pr-2",
          "border border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_78%,transparent)]",
          "shadow-[var(--shadow-pop)] backdrop-blur-md",
          "animate-fade-in"
        )}
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg, var(--brand), color-mix(in oklab, var(--brand) 25%, transparent), var(--brand))",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[2px] rounded-full bg-[color-mix(in_oklab,var(--paper)_92%,transparent)]"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-50 blur-[6px]"
            style={{ background: "radial-gradient(circle, var(--brand), transparent 65%)" }}
          />
          <span aria-hidden className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[var(--brand)] opacity-50" />
          {sayilar.favori >= sayilar.karsilastirma ? (
            <Heart size={12} className="relative fill-[var(--brand)] text-[var(--brand)]" />
          ) : (
            <Scale size={12} className="relative text-[var(--brand)]" />
          )}
        </span>

        {/* `nowrap` DEĞİL: 390px'lik ekranda bu cümle 435px yer kaplıyordu,
            kart iki uçtan taşıyor ve kapatma düğmesi ekran dışında kalıyordu.
            Sarmalı serbest bırakmak kartı iki satıra çıkarır — okunur kalır. */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="min-w-0 text-[13px] font-semibold leading-snug text-[var(--ink-2)]"
        >
          Son 24 saatte {parcalar.join(", ")}
        </p>

        <button
          type="button"
          onClick={kapat}
          aria-label="Etkileşim rozetini kapat"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] max-sm:h-11 max-sm:w-11"
        >
          <X size={14} />
        </button>
      </div>
    </>
  );
}
