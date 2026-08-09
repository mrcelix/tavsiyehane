"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, LayoutGrid, ShieldCheck, TrendingUp } from "lucide-react";
import type { MenuGroup } from "@/lib/menu";
import { CategoryIcon, TYPE_ACCENT } from "@/lib/category-icons";
import { Badge } from "@/components/ui/Badge";

/** §5 mega menü: panel 960px, radius 22px, mega gölge, üç sütunlu grid. */
export function CategoryMenu({ groups }: { groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState(groups[0]?.type);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const active = groups.find((g) => g.type === activeType) ?? groups[0];
  const total = groups.reduce((n, g) => n + g.entries.reduce((m, e) => m + e.count, 0), 0);

  return (
    <div ref={wrapRef} className="relative" onMouseLeave={() => setOpen(false)}>
      {/* §5: dolu buton, h36/px12/radius10/14px-700/gap6; sayaç rozeti bg-white/20, 10px mono */}
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-[10px] bg-[var(--brand)] px-3 text-[13px] font-bold text-white shadow-[var(--shadow-primary)] transition-colors hover:bg-[var(--brand-ink)] dark:text-[#0b1120]"
      >
        <LayoutGrid size={15} />
        Kategoriler
        <span className="flex h-5 items-center rounded-full bg-white/20 px-1.5 font-num text-[10px] font-semibold">
          {total}
        </span>
        <ChevronDown size={13} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="w-[960px] max-w-[calc(100vw-2rem)] animate-scale-in overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-mega)]">
            <div className="grid grid-cols-[240px_1fr_220px]">
              {/* Sol: tipler */}
              <div className="border-r border-[var(--line)] bg-[var(--mist)] p-3">
                {groups.map((g) => (
                  <button
                    key={g.type}
                    onMouseEnter={() => setActiveType(g.type)}
                    onFocus={() => setActiveType(g.type)}
                    className={`mb-1 flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                      g.type === active.type
                        ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                        : "text-[var(--ink-2)] hover:bg-white/70 hover:text-[var(--brand)] dark:hover:bg-white/5"
                    }`}
                  >
                    {g.label}
                    <ArrowRight size={14} />
                  </button>
                ))}
                <Link
                  href="/listeler"
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
                >
                  <TrendingUp size={14} />
                  En iyi listeleri
                </Link>
              </div>

              {/* Orta: kategoriler */}
              <div className="p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {active.label} kategorileri
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {active.entries.map((e) => {
                    const accent = TYPE_ACCENT[active.type];
                    return (
                      <Link
                        key={e.slug}
                        href={e.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--brand)]"
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                          <CategoryIcon slug={e.slug} size={15} />
                        </span>
                        <span className="flex-1">{e.name}</span>
                        <span className="font-num text-[11px] text-[var(--muted)] group-hover:text-[var(--brand)]">{e.count}</span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href={active.hub}
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 text-[11px] font-bold text-[var(--brand)] hover:underline"
                >
                  Tüm {active.label.toLocaleLowerCase("tr")} <ArrowRight size={13} />
                </Link>
              </div>

              {/* Sağ: güven notu */}
              <div className="border-l border-[var(--line)] bg-[var(--mist)] p-4">
                <Badge variant="halo" className="mb-3">
                  Şeffaf puanlama
                </Badge>
                <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                  Her kategori tipinin kendi puanlama modeli var. Bir telefonla bir temizlik firması aynı ölçütle
                  sıralanmaz.
                </p>
                <div className="mt-4 flex items-start gap-2 text-[11px] text-[var(--ink-2)]">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--up)]" />
                  <span>Görünürlük satılabilir; tavsiye puanı satılmaz.</span>
                </div>
                <Link
                  href="/ara?sihirbaz=1"
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand)] hover:underline"
                >
                  Tavsiye Sihirbazı&apos;nı dene <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
