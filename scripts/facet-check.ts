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

// Örnek bir filtre uygulaması
const telefonlar = bundle.items.filter((i) => i.categorySlug === "telefon");
const ram8 = filterItems(bundle, { categorySlug: "telefon", facets: { "oz.RAM": ["8 GB"] } });
const ikiDeger = filterItems(bundle, {
  categorySlug: "telefon",
  facets: { "oz.RAM": ["8 GB"], marka: ["Samsung"] },
});
console.log(`\nÖrnek: telefon ${telefonlar.length} kayıt`);
console.log(`   RAM=8 GB           -> ${ram8.length}`);
console.log(`   RAM=8 GB + Samsung -> ${ikiDeger.length}  (boyutlar arası VE)`);
