import type { Category, Item } from "@/lib/types";
import { ItemCard } from "./ItemCard";

export function ItemGrid({ items, categories }: { items: Item[]; categories: Category[] }) {
  const catMap = new Map(categories.map((c) => [c.slug, c]));
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
        <div className="mb-2 text-3xl">🔎</div>
        Bu kriterlere uyan sonuç bulunamadı. Filtreleri gevşetmeyi deneyin.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} category={catMap.get(item.categorySlug)} />
      ))}
    </div>
  );
}
