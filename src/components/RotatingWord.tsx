"use client";

import { useEffect, useState } from "react";

export interface RotatingItem {
  /** Görünen kelime */
  word: string;
  /** Kelimeye özel gradyan (background-image) */
  gradient: string;
  /** drop-shadow rengi */
  glow: string;
}

/**
 * §6.1 dönen kelime. Tüm kelimeler tek grid hücresinde üst üste durur (layout kaymaz),
 * 2200ms'de bir opaklıkla geçiş yapar; aktif kelime scale-in ile girer.
 * Her kelimenin kendi gradyanı ve ışıması vardır.
 */
export function RotatingWord({ items }: { items: RotatingItem[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 2200);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <span className="inline-grid" style={{ gridTemplateAreas: "'w'" }}>
      {items.map((it, idx) => (
        <span
          key={it.word}
          style={{
            gridArea: "w",
            backgroundImage: it.gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 2px 10px ${it.glow})`,
          }}
          aria-hidden={idx !== i}
          className={`transition-opacity duration-500 ${idx === i ? "animate-scale-in opacity-100" : "opacity-0"}`}
        >
          {it.word}
        </span>
      ))}
    </span>
  );
}
