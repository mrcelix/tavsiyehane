/**
 * Supabase bağlantısını ve şemayı doğrular.
 *
 * .env.local'i okur, anon anahtarla REST API'ye gider ve her tablonun okunabilir
 * olup olmadığını söyler. Anahtar hiçbir zaman ekrana yazılmaz.
 *
 *   node scripts/supabase-check.mjs
 */
import { readFileSync } from "node:fs";

function envOku(dosya = ".env.local") {
  const out = {};
  for (const satir of readFileSync(dosya, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(satir.trim());
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = envOku();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || url.includes("XXXXX")) {
  console.error("NEXT_PUBLIC_SUPABASE_URL tanımlı değil.");
  process.exit(1);
}
if (!key) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil — site demo veriyle çalışır.");
  process.exit(1);
}
console.log(`Proje: ${url}`);
console.log(`Anahtar: ${key.slice(0, 12)}… (${key.length} karakter)\n`);

/** 0001 ve 0002 migration'larının oluşturması gereken nesneler. */
const TABLOLAR = [
  "categories",
  "items",
  "offers",
  "price_history",
  "reviews",
  "favorites",
  "profiles",
  "lists",
  "list_items",
  "votes",
  "item_stats",
  "item_vote_stats",
];

let eksik = 0;
for (const t of TABLOLAR) {
  const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
  });
  const adet = r.headers.get("content-range")?.split("/")[1] ?? "?";
  if (r.ok) {
    console.log(`  ✓ ${t.padEnd(16)} okunabilir · ${adet} kayıt`);
  } else {
    eksik++;
    const govde = await r.text();
    console.log(`  ✗ ${t.padEnd(16)} HTTP ${r.status} — ${govde.slice(0, 120)}`);
  }
}

console.log();
if (eksik > 0) {
  console.log(`${eksik} nesne okunamadı. Migration'ları SQL Editor'da yeniden çalıştırın.`);
  process.exit(1);
}
console.log("Şema tamam. Site artık Supabase verisini okuyabilir.");
console.log("Not: items tablosu boşsa `npm run seed` ile demo veri yüklenebilir;");
console.log("gerçek katalog (telefon) koddan gelir, veritabanına gerek duymaz.");
