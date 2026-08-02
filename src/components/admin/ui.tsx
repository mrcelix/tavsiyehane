import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Panel arayüz ilkelleri.
 *
 * Sitenin genel bileşenlerinden ayrı tutuldu: panelde öncelik yoğunluk ve hız,
 * vitrinde ise ferahlık. Aynı bileşeni iki amaca birden uydurmaya çalışmak,
 * ikisini de bozar.
 */

export function Kart({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5", className)}>
      {children}
    </section>
  );
}

export function Baslik({ children, aciklama }: { children: ReactNode; aciklama?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-extrabold tracking-tight">{children}</h2>
      {aciklama && <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{aciklama}</p>}
    </div>
  );
}

export const GIRDI =
  "w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export function Alan({
  etiket,
  ipucu,
  children,
  genis,
}: {
  etiket: string;
  ipucu?: string;
  children: ReactNode;
  genis?: boolean;
}) {
  return (
    <label className={cn("block", genis && "sm:col-span-2")}>
      <span className="mb-1 block text-xs font-semibold text-[var(--ink-2)]">{etiket}</span>
      {children}
      {ipucu && <span className="mt-1 block text-[11px] leading-relaxed text-[var(--muted-2)]">{ipucu}</span>}
    </label>
  );
}

export function Dugme({
  children,
  tur = "birincil",
  ...rest
}: {
  children: ReactNode;
  tur?: "birincil" | "sessiz" | "tehlike";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const stil = {
    birincil: "bg-[var(--brand)] text-white hover:bg-[var(--brand-ink)]",
    sessiz: "bg-[var(--mist-2)] text-[var(--ink-2)] hover:bg-[var(--line)]",
    tehlike: "bg-[var(--down-soft)] text-[var(--down)] hover:opacity-80",
  }[tur];
  return (
    <button
      {...rest}
      className={cn(
        "rounded-[10px] px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        stil,
        rest.className
      )}
    >
      {children}
    </button>
  );
}

export function Tablo({ basliklar, children }: { basliklar: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[11px] uppercase tracking-wider text-[var(--muted-2)]">
            {basliklar.map((b) => (
              <th key={b} className="py-2 pr-3 font-bold">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">{children}</tbody>
      </table>
    </div>
  );
}

export function Bos({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">{children}</p>;
}

