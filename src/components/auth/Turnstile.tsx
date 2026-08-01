"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile — bot doğrulaması.
 *
 * Oylama sitesinin baş tehdidi Sybil saldırısıdır: toplu hesap açıp toplu oy
 * vermek. `vote_weight` hesap yaşı ve oy çeşitliliğine bakarak bunu pahalı hale
 * getiriyor ama önündeki kapıyı kapatmıyordu.
 *
 * Doğrulama KAYIT akışına konuldu, oy anına değil. Sebebi: kök neden toplu hesap
 * açmak. Her oyda bot testi çıkarmak gerçek kullanıcıyı sürekli sınava sokar ve
 * oylamayı öldürür; oy tarafı hız sınırıyla korunuyor (0006_vote_rate_limit).
 *
 * Anahtar tanımlı değilse bileşen hiçbir şey çizmez ve jeton `null` kalır —
 * Supabase captcha koruması kapalıyken akış aynen çalışır.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function turnstileEnabled(): boolean {
  return TURNSTILE_SITE_KEY.length > 0;
}

export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    if (!turnstileEnabled()) return;
    const el = ref.current;
    if (!el) return;

    let iptal = false;

    function ciz() {
      if (iptal || !el || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        language: "tr",
        callback: (token: string) => onToken(token),
        // Jetonun süresi dolduğunda elde eski jeton kalmamalı: sunucu onu
        // reddeder ve kullanıcı sebebini anlamadan hata görür.
        "expired-callback": () => onToken(null),
        "error-callback": () => {
          setHata(true);
          onToken(null);
        },
      });
    }

    const mevcut = document.getElementById(SCRIPT_ID);
    if (window.turnstile) {
      ciz();
    } else if (!mevcut) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = ciz;
      s.onerror = () => setHata(true);
      document.head.appendChild(s);
    } else {
      mevcut.addEventListener("load", ciz, { once: true });
    }

    return () => {
      iptal = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onToken]);

  if (!turnstileEnabled()) return null;

  return (
    <div>
      <div ref={ref} className="min-h-[65px]" />
      {hata && (
        <p className="mt-1 text-xs text-[var(--down)]">
          Bot doğrulaması yüklenemedi. Reklam engelleyicinizi kapatıp sayfayı yenileyin.
        </p>
      )}
    </div>
  );
}
