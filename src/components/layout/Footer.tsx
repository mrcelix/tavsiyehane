import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Keşfet",
    links: [
      { href: "/urunler", label: "Ürünler" },
      { href: "/hizmetler", label: "Hizmetler" },
      { href: "/mekanlar", label: "Mekânlar" },
      { href: "/listeler", label: "En iyi listeleri" },
    ],
  },
  {
    title: "Araçlar",
    links: [
      { href: "/ara?sihirbaz=1", label: "İhtiyaç sihirbazı" },
      { href: "/karsilastir", label: "Karşılaştırma" },
      { href: "/favoriler", label: "Favoriler" },
      { href: "/metodoloji", label: "Nasıl puanlıyoruz" },
      { href: "/isletme", label: "İşletmeniz için" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--paper)] py-10 text-sm">
      <div className="mx-auto grid max-w-[1220px] gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-2 font-display text-xl font-extrabold tracking-tight">
            <span className="text-[var(--ink)]">Tavsiye</span>
            <span className="text-[var(--gold)]">Hane</span>
          </div>
          <p className="text-[var(--muted)]">Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{col.title}</h3>
            <ul className="space-y-1.5 text-[var(--ink-2)]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link className="transition-colors hover:text-[var(--brand)]" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Şeffaflık</h3>
          <p className="flex gap-2 text-[var(--muted)]">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--up)]" />
            <span>
              Sponsorlu içerikler açıkça işaretlenir. Görünürlük satılabilir;{" "}
              <span className="font-semibold text-[var(--ink-2)]">tavsiye puanı asla satılmaz.</span>
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1220px] px-6 text-xs text-[var(--muted-2)]">
        © 2026 TavsiyeHane — Demo sürüm. Puan ve yorumlar örnek veridir.
      </div>
    </footer>
  );
}
