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

// ---- Migration doğrulaması ----
// Tablonun okunabilmesi migration'ın uygulandığını göstermez; her dosyanın
// oluşturduğu nesneyi tek tek yokluyoruz. Aksi halde "çalıştırdım" sanılan bir
// migration eksik kalır ve eksikliği ancak üretimde fark edilir.

/** Bir sütunun varlığı: seçilemiyorsa PostgREST 400 döner. */
async function sutunVar(tablo, sutun) {
  const r = await fetch(`${url}/rest/v1/${tablo}?select=${sutun}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return r.ok;
}

/** Bir fonksiyonun varlığı: yoksa 404, varsa 200/400 (argüman hatası) döner. */
async function fonksiyonVar(ad) {
  const r = await fetch(`${url}/rest/v1/rpc/${ad}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.status !== 404;
}

const kontroller = [
  { dosya: "0001_init.sql", ad: "items tablosu", test: () => sutunVar("items", "slug") },
  { dosya: "0002_votes.sql", ad: "item_vote_stats görünümü", test: () => sutunVar("item_vote_stats", "votes_up") },
  {
    dosya: "0003_email_identity.sql",
    ad: "profiles.display_name düşürülmüş",
    // Bu tersine kontrol: sütun HÂLÂ varsa migration uygulanmamıştır.
    test: async () => !(await sutunVar("profiles", "display_name")),
  },
  { dosya: "0004_verified_only.sql", ad: "is_email_verified()", test: () => fonksiyonVar("is_email_verified") },
  { dosya: "0005_images.sql", ad: "items.image_credit", test: () => sutunVar("items", "image_credit") },
  { dosya: "0006_vote_rate_limit.sql", ad: "vote_rate_limit()", test: () => fonksiyonVar("vote_rate_limit") },
];

console.log();
let eksikMigration = 0;
for (const k of kontroller) {
  const ok = await k.test();
  if (!ok) eksikMigration++;
  console.log(`  ${ok ? "✓" : "✗"} ${k.dosya.padEnd(26)} ${k.ad}`);
}

// Depolama kovası ayrı: 0005'in ikinci yarısı yetki hatasıyla atlanmış olabilir.
try {
  const r = await fetch(`${url}/storage/v1/object/list/item-images`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1 }),
  });
  console.log(`  ${r.ok ? "✓" : "✗"} ${"item-images kovası".padEnd(26)} ${r.ok ? "erişilebilir" : `HTTP ${r.status}`}`);
  if (!r.ok) eksikMigration++;
} catch (e) {
  console.log(`  ✗ item-images kovası — ${e.message}`);
  eksikMigration++;
}

// Auth ayarları: hangi giriş yöntemleri açık? Salt okunur uç nokta, hesap açmaz.
console.log();
try {
  const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  if (r.ok) {
    const s = await r.json();
    const acik = Object.entries(s.external ?? {})
      .filter(([, v]) => v === true)
      .map(([k]) => k);
    console.log(`  Auth · e-posta ile kayıt: ${s.disable_signup ? "KAPALI" : "açık"}`);
    console.log(`  Auth · e-posta doğrulaması: ${s.mailer_autoconfirm ? "kapalı (otomatik onay)" : "açık"}`);
    console.log(`  Auth · açık sağlayıcılar: ${acik.length ? acik.join(", ") : "yok"}`);
    if (!acik.includes("google")) {
      console.log("        → Google girişi için Supabase > Authentication > Providers > Google açılmalı.");
    }
  } else {
    console.log(`  Auth ayarları okunamadı: HTTP ${r.status}`);
  }
} catch (e) {
  console.log(`  Auth ayarları okunamadı: ${e.message}`);
}

console.log();
if (eksik > 0 || eksikMigration > 0) {
  if (eksik > 0) console.log(`${eksik} nesne okunamadı.`);
  if (eksikMigration > 0) console.log(`${eksikMigration} migration eksik görünüyor (yukarıda ✗ ile işaretli).`);
  console.log("İlgili dosyaları SQL Editor'da çalıştırın; hepsi yeniden çalıştırılabilir.");
  process.exit(1);
}
console.log("Şema tamam. Site artık Supabase verisini okuyabilir.");
console.log("Not: items tablosu boşsa `npm run seed` ile demo veri yüklenebilir;");
console.log("gerçek katalog (telefon) koddan gelir, veritabanına gerek duymaz.");
