"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bot doğrulaması — sağlayıcıdan bağımsız.
 *
 * Oylama sitesinin baş tehdidi Sybil saldırısıdır: toplu hesap açıp toplu oy
 * vermek. `vote_weight` hesap yaşı ve oy çeşitliliğine bakarak bunu pahalı hale
 * getiriyor ama önündeki kapıyı kapatmıyordu.
 *
 * Doğrulama KAYIT akışına konuldu, oy anına değil. Kök neden toplu hesap açmak;
 * her oyda bot testi çıkarmak gerçek kullanıcıyı sürekli sınava sokar ve
 * oylamayı öldürür. Oy tarafı hız sınırıyla korunuyor (0006_vote_rate_limit).
 *
 * NEDEN SOYUTLAMA VAR: başta Cloudflare Turnstile kullanılıyordu, Cloudflare
 * hesabı kapanınca hCaptcha'ya geçmek gerekti. İki sağlayıcının API'si neredeyse
 * aynı (Turnstile hCaptcha'yı örnek almış); tek fark script adresi ve global
 * nesne adı. Bunu bir tabloya çekmek, sağlayıcı bir daha değiştiğinde tek satır
 * iş bırakıyor. Supabase her ikisini de `captchaToken` alanıyla kabul ediyor.
 */

interface CaptchaApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}

declare global {
  interface Window {
    hcaptcha?: CaptchaApi;
    turnstile?: CaptchaApi;
  }
}

type Saglayici = "hcaptcha" | "turnstile";

const SAGLAYICILAR: Record<Saglayici, { src: string; global: "hcaptcha" | "turnstile" }> = {
  hcaptcha: { src: "https://js.hcaptcha.com/1/api.js?render=explicit", global: "hcaptcha" },
  turnstile: {
    src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    global: "turnstile",
  },
};

export const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? "";

const SAGLAYICI: Saglayici =
  process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER === "turnstile" ? "turnstile" : "hcaptcha";

export function captchaEnabled(): boolean {
  return CAPTCHA_SITE_KEY.length > 0;
}

export function Captcha({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    if (!captchaEnabled()) return;
    const el = ref.current;
    if (!el) return;

    const { src, global } = SAGLAYICILAR[SAGLAYICI];
    const scriptId = `captcha-${global}`;
    let iptal = false;

    function ciz() {
      const api = window[global];
      if (iptal || !el || !api || widgetId.current) return;
      widgetId.current = api.render(el, {
        sitekey: CAPTCHA_SITE_KEY,
        // İki sağlayıcı dil parametresini farklı adlandırıyor; fazlalık anahtar
        // ikisinde de sessizce yok sayılıyor.
        hl: "tr",
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

    const mevcut = document.getElementById(scriptId);
    if (window[global]) {
      ciz();
    } else if (!mevcut) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = src;
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
      const api = window[global];
      if (widgetId.current && api) {
        api.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onToken]);

  if (!captchaEnabled()) return null;

  return (
    <div>
      <div ref={ref} className="min-h-[78px]" />
      {hata && (
        <p className="mt-1 text-xs text-[var(--down)]">
          Bot doğrulaması yüklenemedi. Reklam engelleyicinizi kapatıp sayfayı yenileyin.
        </p>
      )}
    </div>
  );
}
