import type { DataBundle, ItemType } from "./types";
import { TYPE_LABELS } from "./types";

export interface MenuEntry {
  slug: string;
  name: string;
  count: number;
  href: string;
}

export interface MenuGroup {
  type: ItemType;
  label: string;
  hub: string;
  entries: MenuEntry[];
}

export function categoryHref(type: ItemType, slug: string, citySlug = "tumu"): string {
  const hub = TYPE_LABELS[type].hub;
  if (type === "urun") return `${hub}/${slug}`;
  if (type === "hizmet") return `${hub}/${citySlug}/${slug}`;
  return `${hub}/${citySlug}/tumu/${slug}`;
}

/** Header mega menüsü için kompakt yapı — tüm item listesi istemciye taşınmaz. */
export function buildMenu(bundle: DataBundle): MenuGroup[] {
  return (["urun", "hizmet", "mekan"] as ItemType[]).map((type) => ({
    type,
    label: TYPE_LABELS[type].plural,
    hub: TYPE_LABELS[type].hub,
    entries: bundle.categories
      .filter((c) => c.type === type)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        count: bundle.items.filter((i) => i.categorySlug === c.slug).length,
        href: categoryHref(type, c.slug),
      })),
  }));
}
