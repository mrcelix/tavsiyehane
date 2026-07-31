/**
 * Puan dağılımını kategori kategori yazdırır.
 * Kohort küçükken puanlar 50'ye doğru büzüldüğü için (bkz. lib/scoring.ts),
 * veri arttıkça aralığın gerçekten açıldığını buradan doğrularız.
 *
 *   npx tsx scripts/score-check.ts
 */
import { getDemoBundle } from "../src/data/demo";

const { items, categories, lists } = getDemoBundle();

const puanlar = items.map((i) => i.score).sort((a, b) => a - b);
console.log(
  `${items.length} kayıt · ${categories.length} kategori · puan aralığı ${puanlar[0]} – ${puanlar[puanlar.length - 1]}\n`,
);

for (const c of categories) {
  const kohort = items.filter((i) => i.categorySlug === c.slug).sort((a, b) => b.score - a.score);
  const satir = kohort.map((i) => `${String(i.score).padStart(3)} ${i.title}`).join("\n     ");
  console.log(`${c.name} (${kohort.length})\n     ${satir}\n`);
}

console.log("Yaşayan listeler:");
for (const l of lists) console.log(`   ${l.title.padEnd(34)} ${l.itemSlugs.length} kayıt`);
