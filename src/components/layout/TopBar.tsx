import Link from "next/link";
import { Building2, ChevronDown, MapPin } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

/**
 * §5 Kat 1 — üst yardımcı şerit.
 * 32px, mist zemin, blur yok, akışta (sticky değil), yalnızca ≥768px.
 */
export function TopBar() {
  return (
    <div className="hidden border-b border-[var(--line)] bg-[var(--mist)] md:block">
      <div className="mx-auto flex h-8 max-w-[1280px] items-center justify-between px-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 transition-colors hover:text-[var(--brand)]">
            <MapPin size={14} />
            <span>Türkiye geneli</span>
            <ChevronDown size={12} />
          </button>
          <span className="h-3 w-px bg-[var(--line)]" aria-hidden />
          <Link href="/isletme" className="flex items-center gap-1.5 transition-colors hover:text-[var(--brand)]">
            <Building2 size={14} />
            <span>İşletme misiniz?</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline">Tavsiye puanı satılmaz — sponsorlu içerik ayrı işaretlenir.</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
