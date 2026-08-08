/**
 * DIŞ SİNYAL İÇE AKTARIMI
 *
 * Arama ilgisi ve fiyat hareketi gibi ölçümleri dışarıdan alıp kayıtlara işler.
 * Bu sayılar ELLE YAZILMAZ — kaynağı ve ölçüm tarihi olmayan bir sinyal,
 * uydurulmuş bir sinyalden ayırt edilemez.
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
 *   node scripts/ingest-signals.mjs --sablon <kategori> [--cikti <dosya>]
 *   node scripts/ingest-signals.mjs <olcumler.json> [--db] [--yaz]
 *
 * Şablon stdout'a BASILMAZ, doğrudan dosyaya yazılır. Sebebi Windows: PowerShell
 * 5.1'de `> dosya.json` yönlendirmesi çıktıyı UTF-16 LE olarak kaydeder ve
 * `npm run` kendi başlık satırlarını da stdout'a yazar — ikisi birden JSON'u
 * okunamaz hale getirir. Dosyayı script'in kendisi yazınca ikisi de olmuyor.
 *
 * `--yaz` verilmezse yalnızca doğrular ve ne olacağını yazar (kuru çalıştırma).
 *
 * İKİ HEDEF VAR, çünkü içerik iki yerde durabiliyor:
 *  - Katalog dosyaları (`src/data/catalog/*.ts`) — kodda tutulan gerçek katalog.
 *    Varsayılan hedef budur.
 *  - Supabase `items.external_signals` — sitenin gerçekten okuduğu yer.
 *    `--db` ile açılır.
 * `--db` verildiğinde ikisi de güncellenir: yalnızca veritabanına yazılan bir
 * ölçüm, bir sonraki `npm run seed` (ya da panelden "yerleşik içeriği aktar")
 * çalıştığında sessizce silinir — çünkü aktarım kaynağı koddur.
 *
 * NEDEN AYRI SCRIPT: ölçüm kaynağı zamanla değişir (Google Trends dışa aktarımı,
 * ücretli API, e-ticaret sıralaması). Puanlama çekirdeğinin bu kaynaklardan
 * habersiz kalması, kaynak değiştiğinde modelin değişmemesini sağlar.
 */
import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// `quiet` olmadan dotenv stdout'a bir bilgi satırı basar ve `--sablon` çıktısı
// bir dosyaya yönlendirildiğinde JSON'un başına düşüp dosyayı bozar.
config({ path: ".env.local", quiet: true });

const [, , ilkArg, ...bayraklar] = process.argv;
const tumArgumanlar = [ilkArg, ...bayraklar];
const yaz = tumArgumanlar.includes("--yaz");
const dbHedefi = tumArgumanlar.includes("--db");
const sablonIndex = tumArgumanlar.indexOf("--sablon");

const KULLANIM = [
  "kullanım:",
  "  node scripts/ingest-signals.mjs --sablon <kategori> [--cikti <dosya>]",
  "  node scripts/ingest-signals.mjs <olcumler.json> [--db] [--yaz]",
].join("\n");

/**
 * Supabase istemcisi. Okuma anon anahtarıyla da yapılabilir (kayıtlar zaten
 * herkese açık); yazma RLS gereği service_role ister.
 */
function supabaseIstemcisi({ yazmaIcin }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anahtar = yazmaIcin ? service : (service ?? anon);

  if (!url || !anahtar) {
    console.error(
      yazmaIcin
        ? "HATA: veritabanına yazmak için .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekir."
        : "HATA: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve bir Supabase anahtarı gerekir."
    );
    process.exit(1);
  }
  return createClient(url, anahtar, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------- şablon modu
if (sablonIndex !== -1) {
  const kategori = tumArgumanlar[sablonIndex + 1];
  if (!kategori || kategori.startsWith("--")) {
    console.error(`--sablon bir kategori slug'ı ister (ör. telefon).\n\n${KULLANIM}`);
    process.exit(1);
  }

  const supabase = supabaseIstemcisi({ yazmaIcin: false });
  const { data, error } = await supabase
    .from("items")
    .select("slug, title, type")
    .eq("category_slug", kategori)
    .order("title");

  if (error) {
    console.error(`Kayıtlar okunamadı: ${error.message}`);
    process.exit(1);
  }
  if (!data?.length) {
    console.error(`"${kategori}" kategorisinde kayıt yok. Kategori slug'ını kontrol edin.`);
    process.exit(1);
  }

  const olcumler = {};
  for (const k of data) {
    // `_baslik` yalnızca ölçümü yapan insan için; içe aktarımda yok sayılır.
    // Hangi satırın hangi ürüne ait olduğunu slug'dan okumak zordur.
    olcumler[k.slug] = {
      _baslik: k.title,
      aramaIlgi30: null,
      aramaIlgiOnceki30: null,
      ...(k.type === "urun" ? { fiyatDegisim30: null } : {}),
    };
  }

  const sablon = {
    kaynak: { label: "Google Trends", url: "", checkedAt: new Date().toISOString().slice(0, 10) },
    olcumler,
  };

  const ciktiIndex = tumArgumanlar.indexOf("--cikti");
  const cikti =
    ciktiIndex !== -1 && tumArgumanlar[ciktiIndex + 1] && !tumArgumanlar[ciktiIndex + 1].startsWith("--")
      ? tumArgumanlar[ciktiIndex + 1]
      : `olcumler-${kategori}.json`;

  // Var olan dosyanın üzerine yazmıyoruz: ölçümleri doldurmak elle yapılan uzun
  // bir iş ve şablonu ikinci kez üretmek o emeği sessizce siler.
  if (existsSync(cikti)) {
    console.error(`"${cikti}" zaten var. Başka bir ad için --cikti kullanın ya da dosyayı silin.`);
    process.exit(1);
  }

  writeFileSync(cikti, `${JSON.stringify(sablon, null, 2)}\n`, "utf8");
  console.log(`${cikti} — ${data.length} kayıt için iskelet yazıldı (kategori: ${kategori}).`);
  console.log("null değerleri ölçümle doldurun, kaynak.url'yi yazın, sonra:");
  console.log(`  npm run signals -- ${cikti} --db`);
  process.exit(0);
}

// -------------------------------------------------------------- girdi okuması
const girdiYolu = ilkArg && !ilkArg.startsWith("--") ? ilkArg : undefined;
if (!girdiYolu) {
  console.error(KULLANIM);
  process.exit(1);
}

/*
 * Windows'ta bu dosya üç şekilde bozulabiliyor ve üçünde de JSON.parse'ın hatası
 * ("Unexpected token") sebebi anlatmıyor:
 *  - UTF-8 BOM (Excel dışa aktarımı, Not Defteri) — temizliyoruz.
 *  - UTF-16 LE/BE (PowerShell 5.1'de `>` ve `Out-File` varsayılanı) — çözüyoruz.
 *  - `npm run` başlık satırlarının çıktıya karışması — sebebini söylüyoruz.
 */
function girdiyiOku(yol) {
  const bayt = readFileSync(yol);
  if (bayt[0] === 0xff && bayt[1] === 0xfe) return bayt.toString("utf16le", 2);
  if (bayt[0] === 0xfe && bayt[1] === 0xff) return bayt.swap16().toString("utf16le", 2);
  return bayt.toString("utf8").replace(/^﻿/, "");
}

const hamGirdi = girdiyiOku(girdiYolu);
let girdi;
try {
  girdi = JSON.parse(hamGirdi);
} catch (e) {
  console.error(`JSON okunamadı (${girdiYolu}): ${e.message}`);
  if (/^\s*>/.test(hamGirdi)) {
    console.error(
      "\nDosyanın başında `npm run` başlık satırları var. Şablonu `>` ile\n" +
        "yönlendirmeyin; script dosyayı kendisi yazar:\n" +
        "  npm run signals -- --sablon <kategori>"
    );
  }
  process.exit(1);
}

// ---- Doğrulama: eksik kaynak = kabul yok ----
const hatalar = [];
if (!girdi.kaynak?.label) hatalar.push("kaynak.label zorunlu");
if (!girdi.kaynak?.checkedAt) hatalar.push("kaynak.checkedAt zorunlu (ölçüm tarihi)");
// Boş `url`, kaynağı olan bir ölçümü kaynaksız gösterir: alan kayıtta durur ama
// tıklanacak bir yer yoktur. Ya gerçek adres yazılır ya da alan hiç konmaz.
if (girdi.kaynak?.url !== undefined && !/^https?:\/\/.+/.test(girdi.kaynak.url)) {
  hatalar.push("kaynak.url ölçümün alındığı adres olmalı (şablondaki boş değeri doldurun ya da alanı silin)");
}
if (!girdi.olcumler || typeof girdi.olcumler !== "object") hatalar.push("olcumler nesnesi zorunlu");

for (const [slug, o] of Object.entries(girdi.olcumler ?? {})) {
  const say = (v) => typeof v === "number" && Number.isFinite(v);
  if (!say(o.aramaIlgi30) || o.aramaIlgi30 < 0 || o.aramaIlgi30 > 100) {
    hatalar.push(`${slug}: aramaIlgi30 0-100 arası sayı olmalı`);
  }
  if (!say(o.aramaIlgiOnceki30) || o.aramaIlgiOnceki30 < 0 || o.aramaIlgiOnceki30 > 100) {
    hatalar.push(`${slug}: aramaIlgiOnceki30 0-100 arası sayı olmalı`);
  }
  if (o.fiyatDegisim30 !== undefined && o.fiyatDegisim30 !== null && !say(o.fiyatDegisim30)) {
    hatalar.push(`${slug}: fiyatDegisim30 sayı olmalı (yüzde, negatif = ucuzladı)`);
  }
}

if (hatalar.length > 0) {
  console.error("Girdi geçersiz:");
  for (const h of hatalar) console.error(`  - ${h}`);
  process.exit(1);
}

/** Bir ölçümün veritabanına yazılacak hâli — `ExternalSignals` tipiyle birebir. */
function disSinyalNesnesi(o) {
  return {
    aramaIlgi30: o.aramaIlgi30,
    aramaIlgiOnceki30: o.aramaIlgiOnceki30,
    ...(typeof o.fiyatDegisim30 === "number" ? { fiyatDegisim30: o.fiyatDegisim30 } : {}),
    kaynak: {
      label: girdi.kaynak.label,
      ...(girdi.kaynak.url ? { url: girdi.kaynak.url } : {}),
      checkedAt: girdi.kaynak.checkedAt,
    },
  };
}

// ------------------------------------------------- hedef 1: katalog dosyaları
const dosyalar = globSync("src/data/catalog/*.ts").filter((f) => !f.endsWith("build.ts"));
const icerikler = new Map(dosyalar.map((f) => [f, readFileSync(f, "utf8")]));

const kaynakSatiri = (k) =>
  `{ label: ${JSON.stringify(k.label)}${k.url ? `, url: ${JSON.stringify(k.url)}` : ""}, checkedAt: ${JSON.stringify(k.checkedAt)} }`;

const katalogda = [];
const katalogdaOlmayan = [];

for (const [slug, o] of Object.entries(girdi.olcumler)) {
  const dosya = dosyalar.find((f) => icerikler.get(f).includes(`slug: "${slug}"`));
  if (!dosya) {
    katalogdaOlmayan.push(slug);
    continue;
  }

  const alanlar = [
    `      aramaIlgi30: ${o.aramaIlgi30},`,
    `      aramaIlgiOnceki30: ${o.aramaIlgiOnceki30},`,
    typeof o.fiyatDegisim30 === "number" ? `      fiyatDegisim30: ${o.fiyatDegisim30},` : null,
    `      kaynak: ${kaynakSatiri(girdi.kaynak)},`,
  ].filter(Boolean);
  const blok = `    external: {\n${alanlar.join("\n")}\n    },\n`;

  const metin = icerikler.get(dosya);
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
    katalogdaOlmayan.push(`${slug} (yerleştirilecek nokta bulunamadı)`);
    continue;
  }

  icerikler.set(dosya, metin.slice(0, baslangic) + yeniGovde + metin.slice(bitis));
  katalogda.push(slug);
}

// ------------------------------------------------------ hedef 2: veritabanı
const dbde = [];
const dbdeOlmayan = [];
let supabase = null;

if (dbHedefi) {
  supabase = supabaseIstemcisi({ yazmaIcin: yaz });
  const { data, error } = await supabase.from("items").select("slug");
  if (error) {
    console.error(`Kayıtlar okunamadı: ${error.message}`);
    process.exit(1);
  }
  const mevcutSluglar = new Set((data ?? []).map((r) => r.slug));
  for (const slug of Object.keys(girdi.olcumler)) {
    if (mevcutSluglar.has(slug)) dbde.push(slug);
    else dbdeOlmayan.push(slug);
  }
}

// ------------------------------------------------------------------ özet
const toplam = Object.keys(girdi.olcumler).length;
console.log(`Kaynak  : ${girdi.kaynak.label} (${girdi.kaynak.checkedAt})`);
console.log(`Ölçüm   : ${toplam} kayıt`);
console.log(`Katalog : ${katalogda.length} eşleşti`);
if (dbHedefi) console.log(`Veritabanı: ${dbde.length} eşleşti`);

// Hiçbir hedefte karşılığı olmayan slug'lar gerçekten kayıp demektir; yalnızca
// bir hedefte bulunmamak normaldir (katalog kodda, örnek içerik veritabanında).
const hicbirYerde = Object.keys(girdi.olcumler).filter(
  (s) => !katalogda.includes(s) && !dbde.includes(s)
);
if (hicbirYerde.length > 0) {
  console.log(`Eşleşmeyen: ${hicbirYerde.length} — ${hicbirYerde.join(", ")}`);
}

if (dbHedefi && dbde.length > 0 && katalogda.length < dbde.length) {
  console.log(
    "\nUYARI: veritabanındaki eşleşmelerin bir kısmının katalog dosyasında karşılığı yok.\n" +
      "Bu ölçümler `npm run seed` ya da panelden içerik aktarımı çalıştırıldığında silinir."
  );
}

if (!yaz) {
  console.log("\nKuru çalıştırma. Uygulamak için --yaz ekleyin.");
  process.exit(0);
}

// ------------------------------------------------------------------ yazma
for (const [dosya, icerik] of icerikler) writeFileSync(dosya, icerik, "utf8");

if (dbHedefi) {
  for (const slug of dbde) {
    const { error } = await supabase
      .from("items")
      .update({ external_signals: disSinyalNesnesi(girdi.olcumler[slug]) })
      .eq("slug", slug);
    if (error) {
      console.error(`\n${slug} yazılamadı: ${error.message}`);
      process.exit(1);
    }
  }
}

console.log(`\nYazıldı — katalog: ${katalogda.length}${dbHedefi ? `, veritabanı: ${dbde.length}` : ""}.`);
console.log("`npm run verify` ile doğrulayın.");
