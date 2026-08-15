"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Facet } from "@/lib/facets";
import { facetValueLabel } from "@/lib/facets";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";

/**
 * Gelişmiş filtreleme. Boyutlar kategorinin kendi verisinden çıkarıldığı için
 * telefonda "RAM", otelde "Konsept" görünür — elle tanımlanan bir liste yoktur.
 * Aynı boyut içinde VEYA, boyutlar arasında VE mantığı geçerlidir.
 */
export function AdvancedFilters({ facets }: { facets: Facet[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  if (facets.length === 0) return null;

  function selected(param: string): string[] {
    return params.getAll(param);
  }

  const aktifSayi = facets.reduce((n, f) => n + selected(f.param).length, 0);

  function toggle(param: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const mevcut = next.getAll(param);
    next.delete(param);
    const yeni = mevcut.includes(value) ? mevcut.filter((v) => v !== value) : [...mevcut, value];
    yeni.forEach((v) => next.append(param, v));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    facets.forEach((f) => next.delete(f.param));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="h-9 shrink-0 gap-1.5">
        <SlidersHorizontal size={14} />
        Gelişmiş filtreleme
        {aktifSayi > 0 && (
          <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1 font-num text-[10px] font-bold text-white">
            {aktifSayi}
          </span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Filtre panelini kapat"
            onClick={() => setOpen(false)}
            className="overlay-veil absolute inset-0"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[330px] max-w-[88vw] animate-fade-in flex-col border-r border-[var(--line)] bg-[var(--paper)]">
            <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <SlidersHorizontal size={17} className="text-[var(--brand)]" />
                Gelişmiş filtreleme
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)]"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {facets.map((f) => {
                const secili = selected(f.param);
                return (
                  <section key={f.param} className="mb-5">
                    <h3 className="mb-2 flex items-baseline justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {f.label}
                      {secili.length > 0 && (
                        <span className="font-num text-[var(--brand)]">{secili.length} seçili</span>
                      )}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {f.values.map((v) => {
                        const isOn = secili.includes(v.value);
                        return (
                          <label
                            key={v.value}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors",
                              isOn ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]" : "hover:bg-[var(--mist)]"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isOn}
                              onChange={() => toggle(f.param, v.value)}
                              className="h-4 w-4 shrink-0 accent-[var(--brand)]"
                            />
                            <span className="flex-1 font-medium">{facetValueLabel(f.param, v.value)}</span>
                            <span className="font-num text-[11px] text-[var(--muted-2)]">{v.count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <footer className="flex items-center gap-2 border-t border-[var(--line)] px-4 py-3">
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={aktifSayi === 0} className="flex-1">
                Tümünü temizle
              </Button>
              <Button variant="primary" size="sm" onClick={() => setOpen(false)} className="flex-1">
                Sonuçları gör
              </Button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
