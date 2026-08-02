"use client";

import { Search } from "lucide-react";
import { aramayiAc } from "@/components/SearchPalette";

/**
 * Arama tetikleyicisi.
 *
 * Artık bir form değil, paleti açan bir düğme. Sebebi: kutuya yazıp Enter'a
 * basmak kullanıcıyı arama sayfasına atıyordu; palet ise yazarken sonuç
 * gösteriyor ve doğrudan kayda gidiyor. İki ayrı arama girişi tutmak
 * (kutu + palet) ikisinin farklı davranması demek olurdu.
 *
 * Masaüstünde kutu görünümünü koruyor — kullanıcı orada bir arama alanı
 * bekliyor. Mobilde yalnızca simge: dar ekranda kutu, hamburger ve logo aynı
 * satıra sığmıyor.
 */
export function HeaderSearch() {
  return (
    <>
      {/* Masaüstü: kutu görünümlü tetikleyici */}
      <button
        type="button"
        onClick={aramayiAc}
        aria-label="Ara"
        className="group relative hidden h-10 w-full items-center rounded-md border border-transparent bg-[var(--mist)] pl-9 pr-16 text-left text-sm text-[var(--muted-2)] transition-colors hover:border-[var(--line)] hover:bg-[var(--paper)] sm:flex"
      >
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)] transition-colors group-hover:text-[var(--brand)]"
        />
        Ne arıyorsun?
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-6 -translate-y-1/2 items-center rounded border border-[var(--line)] bg-[var(--paper)] px-1.5 text-[10px] font-medium text-[var(--muted)] lg:flex">
          Ctrl K
        </kbd>
      </button>

      {/* Mobil: yalnızca simge */}
      <button
        type="button"
        onClick={aramayiAc}
        aria-label="Ara"
        className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] sm:hidden"
      >
        <Search size={20} />
      </button>
    </>
  );
}
