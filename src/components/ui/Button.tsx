import Link from "next/link";
import { cn } from "@/lib/cn";

/** §4.1 buton varyantları — servis.net tasarım sistemi. */
export type ButtonVariant =
  | "primary"
  | "gold"
  | "soft"
  | "gold-soft"
  | "outline"
  | "secondary"
  | "ghost"
  | "danger"
  | "link";

export type ButtonSize = "sm" | "default" | "lg" | "xl" | "icon" | "icon-sm";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand)] text-white shadow-[var(--shadow-primary)] hover:bg-[var(--brand-ink)] dark:text-[#0b1120]",
  gold: "bg-[var(--gold)] text-white shadow-[var(--shadow-gold)] hover:bg-[var(--gold-ink)]",
  soft: "bg-[var(--brand-soft)] text-[var(--brand-ink)] hover:opacity-70",
  "gold-soft": "bg-[var(--gold-soft)] text-[var(--gold-ink)] hover:opacity-70",
  outline:
    "bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] shadow-[var(--shadow-input)] hover:bg-[var(--mist)] hover:border-[var(--muted-2)]",
  secondary: "bg-[var(--mist-2)] text-[var(--ink)] hover:bg-[var(--line)]",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--mist)]",
  danger: "bg-[var(--down)] text-white hover:opacity-90",
  link: "text-[var(--brand)] hover:underline underline-offset-4",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  default: "h-10 px-4 text-sm rounded-[10px]",
  lg: "h-11 px-6 text-[15px] rounded-xl",
  xl: "h-12 px-7 text-base rounded-xl",
  icon: "h-10 w-10 rounded-[10px]",
  "icon-sm": "h-8 w-8 rounded-lg",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shine?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function buttonClasses({ variant = "primary", size = "default", shine, className }: CommonProps): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], shine && "btn-shine", className);
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, shine, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, shine, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & React.ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, shine, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, shine, className })} {...rest}>
      {children}
    </Link>
  );
}
