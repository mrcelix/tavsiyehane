/**
 * DIŞ SİNYAL İÇE AKTARIMI
 *
 * Arama ilgisi ve fiyat hareketi gibi ölçümleri dışarıdan alıp katalog
 * dosyalarına işler. Bu sayılar ELLE YAZILMAZ — kaynağı ve ölçüm tarihi
 * olmayan bir sinyal, uydurulmuş bir sinyalden ayırt edilemez.
 *
 * Girdi biçimi (JSON):
 * {
 *   "kaynak": { "label": "Google Trends", "url": "https://trends.google.com/...",
 *               "checkedAt": "2026-08-01" },
 *   "olcumler": {
 *     "apple-iphone-17-256gb":      { "aramaIlgi30": 78, "aramaIlgiOnceki30": 64 },
 *     "samsung-galaxy-s25-fe-256gb":{ "aramaIlgi30": 55, "aramaIlgiOnceki30": 58,
 *                                     "fiyatDegisim30": -4.2 }
 *   }
 * }
 *
 * Kullanım:
 *   node scripts/ingest-signals.mjs <olcumler.json> [--yaz]
 *
 * `--yaz` verilmezse yalnızca doğrular ve ne olacağını yazar (kuru çalıştırma).
 *
 * NEDEN AYRI SCRIPT: ölçüm kaynağı zamanla değişir (Google Trends dışa aktarımı,
 * ücretli API, e-ticaret sıralaması). Puanlama çekirdeğinin bu kaynaklardan
 * habersiz kalması, kaynak değiştiğinde modelin değişmemesini sağlar.
 */
import { globSync, readFileSync, writeFileSync } from "node:fs";

const [, , girdiYolu, ...bayraklar] = process.argv;
const yaz = bayraklar.includes("--yaz");

if (!girdiYolu) {
  console.error("kullanım: node scripts/ingest-signals.mjs <olcumler.json> [--yaz]");
  process.exit(1);
}

// Windows araçlarından (Excel dışa aktarımı, PowerShell Out-File) çıkan JSON
// dosyaları sık sık BOM taşır ve JSON.parse bunu okuyamaz. Hatanın kaynağını
// bulmak zor olduğu için baştan temizliyoruz.
let hamGirdi = readFileSync(girdiYolu, "utf8").replace(/^﻿/, "");
let girdi;
try {
  girdi = JSON.parse(hamGirdi);
} catch (e) {
  console.error(`JSON okunamadı (${girdiYolu}): ${e.message}`);
  process.exit(1);
}

// ---- Doğrulama: eksik kaynak = kabul yok ----
const hatalar = [];
if (!girdi.kaynak?.label) hatalar.push("kaynak.label zorunlu");
if (!girdi.kaynak?.checkedAt) hatalar.push("kaynak.checkedAt zorunlu (ölçüm tarihi)");
if (!girdi.olcumler || typeof girdi.olcumler !== "object") hatalar.push("olcumler nesnesi zorunlu");

for (const [slug, o] of Object.entries(girdi.olcumler ?? {})) {
  const say = (v) => typeof v === "number" && Number.isFinite(v);
  if (!say(o.aramaIlgi30) || o.aramaIlgi30 < 0 || o.aramaIlgi30 > 100) {
    hatalar.push(`${slug}: aramaIlgi30 0-100 arası sayı olmalı`);
  }
  if (!say(o.aramaIlgiOnceki30) || o.aramaIlgiOnceki30 < 0 || o.aramaIlgiOnceki30 > 100) {
    hatalar.push(`${slug}: aramaIlgiOnceki30 0-100 arası sayı olmalı`);
  }
  if (o.fiyatDegisim30 !== undefined && !say(o.fiyatDegisim30)) {
    hatalar.push(`${slug}: fiyatDegisim30 sayı olmalı (yüzde, negatif = ucuzladı)`);
  }
}

if (hatalar.length > 0) {
  console.error("Girdi geçersiz:");
  for (const h of hatalar) console.error(`  - ${h}`);
  process.exit(1);
}

// ---- Katalogdaki slug'ları bul ----
const dosyalar = globSync("src/data/catalog/*.ts").filter((f) => !f.endsWith("build.ts"));
const icerikler = new Map(dosyalar.map((f) => [f, readFileSync(f, "utf8")]));

const kaynakSatiri = (k) =>
  `{ label: ${JSON.stringify(k.label)}${k.url ? `, url: ${JSON.stringify(k.url)}` : ""}, checkedAt: ${JSON.stringify(k.checkedAt)} }`;

let islenen = 0;
const bulunamayan = [];

for (const [slug, o] of Object.entries(girdi.olcumler)) {
  const dosya = dosyalar.find((f) => icerikler.get(f).includes(`slug: "${slug}"`));
  if (!dosya) {
    bulunamayan.push(slug);
    continue;
  }

  const alanlar = [
    `      aramaIlgi30: ${o.aramaIlgi30},`,
    `      aramaIlgiOnceki30: ${o.aramaIlgiOnceki30},`,
    o.fiyatDegisim30 !== undefined ? `      fiyatDegisim30: ${o.fiyatDegisim30},` : null,
    `      kaynak: ${kaynakSatiri(girdi.kaynak)},`,
  ].filter(Boolean);
  const blok = `    external: {\n${alanlar.join("\n")}\n    },\n`;

  let metin = icerikler.get(dosya);
  // Kaydın gövdesini bul: slug satırından bir sonraki `    slug:` ya da dosya sonuna kadar.
  const baslangic = metin.indexOf(`    slug: "${slug}",`);
  const sonraki = metin.indexOf(`    slug: "`, baslangic + 10);
  const bitis = sonraki === -1 ? metin.length : sonraki;
  const govde = metin.slice(baslangic, bitis);

  const mevcut = /^ {4}external: \{[\s\S]*?^ {4}\},\n/m.exec(govde);
  const yeniGovde = mevcut
    ? govde.replace(mevcut[0], blok)
    : govde.replace(/^ {4}verifiedAt:/m, `${blok}    verifiedAt:`);

  if (yeniGovde === govde) {
    bulunamayan.push(`${slug} (yerleştirilecek nokta bulunamadı)`);
    continue;
  }

  icerikler.set(dosya, metin.slice(0, baslangic) + yeniGovde + metin.slice(bitis));
  islenen++;
}

console.log(`Kaynak : ${girdi.kaynak.label} (${girdi.kaynak.checkedAt})`);
console.log(`İşlenen: ${islenen} kayıt`);
if (bulunamayan.length > 0) {
  console.log(`Atlanan: ${bulunamayan.length} — ${bulunamayan.join(", ")}`);
}

if (!yaz) {
  console.log("\nKuru çalıştırma. Uygulamak için --yaz ekleyin.");
  process.exit(0);
}

for (const [dosya, icerik] of icerikler) writeFileSync(dosya, icerik, "utf8");
console.log("\nYazıldı. `npm run verify` ile doğrulayın.");
