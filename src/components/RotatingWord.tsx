"use client";

import { useEffect, useState } from "react";

/**
 * §6.1 dönen kelime. Tüm kelimeler tek grid hücresinde üst üste durur (layout kaymaz),
 * 2200ms'de bir opaklıkla geçiş yapar. Azaltılmış hareket tercihinde ilk kelimede sabitlenir.
 */
export function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className="inline-grid" style={{ gridTemplateAreas: "'w'" }}>
      {words.map((w, idx) => (
        <span
          key={w}
          style={{ gridArea: "w" }}
          aria-hidden={idx !== i}
          className={`bg-gradient-to-r from-[var(--brand)] via-[var(--brand-ink)] to-[var(--gold)] bg-clip-text text-transparent transition-opacity duration-500 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
