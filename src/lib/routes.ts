import type { Item, ItemType } from "./types";

export const DETAIL_PREFIX: Record<ItemType, string> = {
  urun: "/urun",
  hizmet: "/hizmet",
  mekan: "/mekan",
};

export function itemHref(item: Pick<Item, "type" | "slug">): string {
  return `${DETAIL_PREFIX[item.type]}/${item.slug}`;
}
