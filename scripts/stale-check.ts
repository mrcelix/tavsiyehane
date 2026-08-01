/**
 * Yeniden doğrulanması gereken kayıtları listeler.
 *
 * Tazelik politikası (bkz. lib/freshness.ts) arayüzde uyarı gösteriyor ama
 * uyarıyı gören ziyaretçi, düzeltecek olan kişi değil. Bu script editör tarafına
 * bakılacak listeyi verir: en eskisi başta.
 *
 *   npx tsx scripts/stale-check.ts          — bayat + eskiyen kayıtlar
 *   npx tsx scripts/stale-check.ts --bayat  — yalnızca bayatlar
 *
 * Bayat kayıt varsa çıkış kodu 1 döner; istenirse CI'da veya zamanlanmış bir
 * işte eşik olarak kullanılabilir.
 */
import { getDemoBundle } from "../src/data/demo";
import { FRESHNESS_DAYS, ageInDays, freshnessOf, staleItems } from "../src/lib/freshness";
import type { ItemType } from "../src/lib/types";

const yalnizBayat = process.argv.includes("--bayat");
const { items } = getDemoBundle();

// Demo kayıtlarda doğrulama kavramı yok; bakım listesi gerçek katalog içindir.
const gercek = items.filter((i) => i.provenance.kind === "editor");
const liste = staleItems(gercek).filter((i) => !yalnizBayat || freshnessOf(i) === "bayat");

console.log(`Gerçek katalog: ${gercek.length} kayıt`);
console.log("Eşikler (gün):");
for (const t of ["urun", "hizmet", "mekan"] as ItemType[]) {
  console.log(`  ${t.padEnd(7)} eskiyor ${FRESHNESS_DAYS[t].eskiyor}, bayat ${FRESHNESS_DAYS[t].bayat}`);
}

if (liste.length === 0) {
  console.log("\nDoğrulama bekleyen kayıt yok.");
  process.exit(0);
}

console.log(`\n${liste.length} kayıt doğrulama bekliyor:\n`);
for (const i of liste) {
  const durum = freshnessOf(i) === "bayat" ? "BAYAT " : "eskiyor";
  console.log(`  ${durum} ${String(ageInDays(i)).padStart(4)} gün  ${i.categorySlug.padEnd(16)} ${i.title}`);
  for (const k of i.provenance.sources ?? []) {
    if (k.url) console.log(`${" ".repeat(32)}${k.label}: ${k.url}`);
  }
}

const bayatSayisi = gercek.filter((i) => freshnessOf(i) === "bayat").length;
process.exit(bayatSayisi > 0 ? 1 : 0);
