"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { MenuGroup } from "@/lib/menu";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";

/** §5 mobil çekmece: link radius 10px, px12/py10, 14px/600, hover mist. */
export function MobileMenu({ groups }: { groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="overlay-veil absolute inset-0"
          />
          <div className="absolute right-0 top-0 flex h-full w-[300px] max-w-[85vw] animate-fade-in flex-col overflow-y-auto border-l border-[var(--line)] bg-[var(--paper)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">
                <span className="text-[var(--ink)]">Tavsiye</span>
                <span className="text-[var(--gold)]">Hane</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--mist)]"
              >
                <X size={18} />
              </button>
            </div>

            {groups.map((g) => (
              <div key={g.type} className="mb-4">
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {g.label}
                </p>
                {g.entries.map((e) => {
                  const accent = TYPE_ACCENT[g.type];
                  return (
                    <Link
                      key={e.slug}
                      href={e.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)]"
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                        <CategoryIcon slug={e.slug} size={15} />
                      </span>
                      <span className="flex-1">{e.name}</span>
                      <span className="font-num text-[11px] text-[var(--muted)]">{e.count}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="mt-auto border-t border-[var(--line)] pt-3">
              {[
                { href: "/listeler", label: "En iyi listeleri" },
                { href: "/ara?sihirbaz=1", label: "Tavsiye Sihirbazı" },
                { href: "/karsilastir", label: "Karşılaştırma" },
                { href: "/favoriler", label: "Favorilerim" },
                { href: "/isletme", label: "İşletmeniz için" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
