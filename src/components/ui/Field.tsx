import { cn } from "@/lib/cn";

/**
 * §4.2 input/select temeli: h 40px, radius 10px, paper zemin, line kenarlık,
 * focus'ta marka kenarlığı + brand-soft ring.
 */
export const FIELD_BASE =
  "h-10 w-full rounded-[10px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] " +
  "shadow-[var(--shadow-input)] px-3 py-2 text-sm outline-none transition-colors " +
  "placeholder:text-[var(--muted-2)] " +
  "focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(FIELD_BASE, "cursor-pointer", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_BASE, "h-auto min-h-20 py-2.5", className)} {...rest} />;
}
