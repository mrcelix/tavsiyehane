import { SearchX } from "lucide-react";
import type { Item } from "@/lib/types";
import { ItemCard } from "./ItemCard";

export function ItemGrid({ items, kisisel }: { items: Item[]; kisisel?: Record<string, number> }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-[var(--line)] p-12 text-center text-[var(--muted)]">
        <SearchX size={28} className="text-[var(--muted-2)]" />
        Bu kriterlere uyan sonuç bulunamadı. Filtreleri gevşetmeyi deneyin.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} kisisel={kisisel?.[item.slug]} />
      ))}
    </div>
  );
}
