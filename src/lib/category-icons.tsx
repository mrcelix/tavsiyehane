import { createElement } from "react";
import {
  BedDouble,
  Bot,
  Box,
  Cat,
  Coffee,
  Dumbbell,
  Hammer,
  Package,
  PawPrint,
  Scissors,
  Smartphone,
  SprayCan,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { ItemType } from "./types";

/** Kategori slug'ı → lucide ikonu. Emoji yerine tutarlı çizgi ikon seti kullanılır. */
const MAP: Record<string, LucideIcon> = {
  telefon: Smartphone,
  "robot-supurge": Bot,
  "kedi-mamasi": Cat,
  "kedi-kumu": Box,
  "kedi-aksesuar": PawPrint,
  "kisisel-bakim": Scissors,
  "ev-temizligi": SprayCan,
  nakliye: Truck,
  "teknik-servis": Wrench,
  "usta-tamirat": Hammer,
  restoran: UtensilsCrossed,
  kafe: Coffee,
  otel: BedDouble,
  "spor-tesisi": Dumbbell,
};

/**
 * Kategori ikonu. İkon `createElement` ile üretilir; böylece render sırasında
 * büyük harfli bir bileşen değişkeni oluşturulmaz (react-hooks/static-components).
 */
export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  return createElement(MAP[slug] ?? Package, props);
}

/** Tipe göre vurgu rengi — kart görselleri ve ikon zeminlerinde kullanılır. */
export const TYPE_ACCENT: Record<ItemType, { text: string; bg: string }> = {
  urun: { text: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]" },
  hizmet: { text: "text-[var(--up)]", bg: "bg-[var(--up-soft)]" },
  mekan: { text: "text-[var(--gold-ink)]", bg: "bg-[var(--gold-soft)]" },
};
