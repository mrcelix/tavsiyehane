import { cn } from "@/lib/cn";

/** §4.3 kart — radius 14px, paper zemin, line kenarlık, kart gölgesi. */
export const CARD_BASE =
  "rounded-[14px] bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--line)] shadow-[var(--shadow-card)]";

export function Card({
  className,
  hoverable,
  children,
  ...rest
}: { hoverable?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(CARD_BASE, hoverable && "card-hover", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

/** Bölüm başlığı üstünde kullanılan küçük overline etiketi (§2.2). */
export function Overline({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]", className)}>{children}</p>
  );
}
