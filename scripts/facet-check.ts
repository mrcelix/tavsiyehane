/**
 * Her kategoride gelişmiş filtrelemenin hangi boyutları sunduğunu listeler.
 * Kullanım: npx tsx scripts/facet-check.ts
 */
import { getDemoBundle } from "../src/data/demo";
import { buildFacets } from "../src/lib/facets";
import { filterItems } from "../src/lib/query";

const bundle = getDemoBundle();

for (const cat of bundle.categories) {
  const items = bundle.items.filter((i) => i.categorySlug === cat.slug);
  const facets = buildFacets(items);
  console.log(`\n${cat.name} (${items.length} kayıt) — ${facets.length} filtre boyutu`);
  for (const f of facets) {
    const ornek = f.values
      .slice(0, 3)
      .map((v) => `${v.value}(${v.count})`)
      .join(", ");
    console.log(`   ${f.label.padEnd(18)} ${String(f.values.length).padStart(2)} değer  ·  ${ornek}`);
  }
}

// Örnek filtre uygulamaları. Panelde gösterilen değerler normalize edilmiştir
// (bkz. lib/attrs.ts); eşleştirmenin de aynı normalizasyondan geçtiğini
// buradan doğruluyoruz — "120 Hz" hiçbir kayıtta birebir yazmıyor.
const say = (categorySlug: string, facets: Record<string, string[]>) =>
  filterItems(bundle, { categorySlug, facets }).length;

console.log(`\nÖrnek filtreler (telefon ${bundle.items.filter((i) => i.categorySlug === "telefon").length} kayıt)`);
console.log(`   Ekran=120 Hz                    -> ${say("telefon", { "oz.Ekran": ["120 Hz"] })}`);
console.log(`   Ekran=120 Hz + Depolama=256 GB  -> ${say("telefon", { "oz.Ekran": ["120 Hz"], "oz.Depolama": ["256 GB"] })}  (boyutlar arası VE)`);
console.log(`   Kamera=50 MP veya 108 MP        -> ${say("telefon", { "oz.Kamera": ["50 MP", "108 MP"] })}  (boyut içinde VEYA)`);
console.log(`\nÖrnek filtreler (usta-tamirat)`);
console.log(`   Deneyim=15 yıl ve üzeri         -> ${say("usta-tamirat", { "oz.Deneyim": ["15 yıl ve üzeri"] })}`);
console.log(`   Keşif=Ücretsiz                  -> ${say("usta-tamirat", { "oz.Keşif": ["Ücretsiz"] })}`);
