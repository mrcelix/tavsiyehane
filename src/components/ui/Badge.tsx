import { cn } from "@/lib/cn";

/**
 * §4.4 rozet. `outline` ve `neutral` dışındaki varyantlar `.badge-invert` alır —
 * yani çevreleyen temanın tersinde render edilir (bkz. globals.css §5).
 */
export type BadgeVariant =
  | "default"
  | "soft"
  | "gold"
  | "gold-soft"
  | "up"
  | "down"
  | "neutral"
  | "outline"
  | "count"
  | "glow"
  | "halo"
  | "gold-halo";

const BASE =
  "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-[var(--brand)] text-white border-transparent",
  soft: "bg-[var(--brand-soft)] text-[var(--brand-ink)] border-transparent",
  gold: "bg-[var(--gold)] text-white border-transparent",
  "gold-soft": "bg-[var(--gold-soft)] text-[var(--gold-ink)] border-transparent",
  up: "bg-[var(--up-soft)] text-[var(--up)] border-transparent",
  down: "bg-[var(--down-soft)] text-[var(--down)] border-transparent",
  neutral: "bg-[var(--mist)] text-[var(--muted)] border-[var(--line)]",
  outline: "bg-transparent text-[var(--ink)] border-[var(--line)]",
  count:
    "bg-[var(--down)] text-white border-transparent min-w-4 h-4 px-1 text-[10px] rounded-full justify-center",
  glow: "bg-[var(--brand)] text-white border-transparent halo-glow",
  halo: "bg-[var(--brand)] text-white border-transparent halo-ring halo-glow",
  "gold-halo": "bg-[var(--gold)] text-white border-transparent halo-ring halo-glow-gold",
};

// Saydam varyantlar ters temaya çevrilmez.
const NO_INVERT: BadgeVariant[] = ["outline", "neutral"];

export function Badge({
  variant = "default",
  className,
  title,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(BASE, VARIANTS[variant], !NO_INVERT.includes(variant) && "badge-invert", className)}
    >
      {children}
    </span>
  );
}

/** Filtre pill'i (§4.4 sonu) — seçili durumda marka rengine geçer. */
export function Chip({
  active,
  className,
  children,
  ...rest
}: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
        active
          ? "bg-[var(--brand-soft)] text-[var(--brand-ink)] border-[var(--brand)]"
          : "bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--brand)] hover:text-[var(--brand)]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
