"use client";

import { Moon, Sun } from "lucide-react";

/**
 * §5 Kat 1 tema düğmesi: 28×28px, rounded-full, line kenarlık, paper zemin.
 * Hangi ikonun görüneceğini CSS belirler (React state yok) — hidrasyon uyuşmazlığı olmaz.
 */
export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      title="Açık/koyu tema"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] transition-colors hover:bg-[var(--mist)]"
    >
      <Sun size={14} className="hidden text-[var(--gold)] dark:block" />
      <Moon size={14} className="block text-[var(--brand-ink)] dark:hidden" />
    </button>
  );
}
