"use client";

/**
 * Tema düğmesi. Hangi simgenin görüneceğini React state'i değil CSS belirler (`dark:` varyantı) —
 * böylece hidrasyon uyuşmazlığı ve ilk render'da görünen geçici simge oluşmaz.
 * Sayfa yüklenirken tema, layout'taki satır içi script tarafından uygulanır.
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
      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      <span className="hidden dark:inline">☀️</span>
      <span className="inline dark:hidden">🌙</span>
    </button>
  );
}
