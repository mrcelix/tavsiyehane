"use client";

import { ArrowRight, Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "./ui/Button";
import { readCompare, writeCompare, type CompareEntry } from "./CompareButton";

export function CompareTray() {
  const [list, setList] = useState<CompareEntry[]>([]);

  useEffect(() => {
    const sync = () => setList(readCompare());
    sync();
    window.addEventListener("compare-changed", sync);
    return () => window.removeEventListener("compare-changed", sync);
  }, []);

  if (list.length === 0) return null;

  return (
    <>
      {/* Sabit şerit sayfanın altını örtmesin diye eşdeğer yükseklikte boşluk bırakılır. */}
      <div aria-hidden className="h-24 sm:h-16" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--brand)] bg-[color-mix(in_oklab,var(--paper)_95%,transparent)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
            <Scale size={15} className="text-[var(--brand)]" />
            Karşılaştır{" "}
            <span className="font-num text-[var(--muted)]">
              ({list.length}/4)
            </span>
          </span>
          {list.map((e) => (
            <button
              key={e.slug}
              onClick={() =>
                writeCompare(readCompare().filter((x) => x.slug !== e.slug))
              }
              className="group flex items-center gap-1 rounded-full bg-[var(--mist)] px-3 py-1 text-xs font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--down-soft)] hover:text-[var(--down)]"
              title="Listeden çıkar"
            >
              <span className="max-w-40 truncate">{e.title}</span>
              <X
                size={12}
                className="text-[var(--muted-2)] group-hover:text-[var(--down)]"
              />
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => writeCompare([])}
              className="text-xs"
            >
              Temizle
            </Button>
            {list.length >= 2 ? (
              <ButtonLink
                href={`/karsilastir?ids=${list.map((e) => e.slug).join(",")}`}
                variant="primary"
                size="sm"
              >
                Karşılaştır
                <ArrowRight size={14} />
              </ButtonLink>
            ) : (
              <span className="rounded-lg bg-[var(--mist-2)] px-4 py-1.5 text-xs font-semibold text-[var(--muted-2)]">
                En az 2 seçim gerekli
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
