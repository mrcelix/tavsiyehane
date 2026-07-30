import type { Item, ItemType } from "./types";

export const DETAIL_PREFIX: Record<ItemType, string> = {
  urun: "/urun",
  hizmet: "/hizmet",
  mekan: "/mekan",
};

export function itemHref(item: Pick<Item, "type" | "slug">): string {
  return `${DETAIL_PREFIX[item.type]}/${item.slug}`;
}

/** Kart görselleri yerine kullanılan tipe özel gradyanlar (tam kendine yeterli, dış görsel yok). */
export const TYPE_GRADIENT: Record<ItemType, string> = {
  urun: "from-indigo-500/15 via-sky-500/10 to-indigo-500/5 dark:from-indigo-500/25 dark:via-sky-500/15 dark:to-indigo-500/10",
  hizmet: "from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-emerald-500/10",
  mekan: "from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-500/25 dark:via-orange-500/15 dark:to-amber-500/10",
};
