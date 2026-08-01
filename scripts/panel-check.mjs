/**
 * Gelişmiş filtreleme panelinin tarayıcıdaki davranışını uçtan uca doğrular.
 *
 * Panelin onay kutuları yalnızca URL parametresi yazar; sunucu da o parametreye
 * göre filtreler. Bu senaryonun tamamı — hidratasyon, tıklama, URL yazımı,
 * yeniden render — ancak gerçek bir tarayıcıda görülür. Burada Chrome başsız
 * modda başlatılıp CDP üzerinden sürülür; ek bir bağımlılık gerekmez
 * (Node 22+ yerleşik WebSocket).
 *
 * Kullanım (dev sunucusu 3005'te açıkken):
 *   node scripts/panel-check.mjs [url]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HEDEF = process.argv[2] ?? "http://localhost:3005/urunler/robot-supurge";
// Art arda çalıştırmalarda önceki tarayıcı portu bırakmamış olabiliyor.
const PORT = 9300 + (process.pid % 400);
const TARAYICILAR = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function hazirOl(url, deneme = 60) {
  for (let i = 0; i < deneme; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r.json();
    } catch {
      /* tarayıcı henüz ayakta değil */
    }
    await bekle(250);
  }
  throw new Error(`${url} yanıt vermedi`);
}

/** CDP oturumu: id üretir, komutu gönderir, yanıtı eşleştirir, olayları dinletir. */
function oturum(ws) {
  let sonId = 0;
  const bekleyen = new Map();
  const olayBekleyen = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id !== undefined) {
      const c = bekleyen.get(m.id);
      if (!c) return;
      bekleyen.delete(m.id);
      if (m.error) c.rej(new Error(m.error.message));
      else c.coz(m.result);
      return;
    }
    const o = olayBekleyen.get(m.method);
    if (o) {
      olayBekleyen.delete(m.method);
      o(m.params);
    }
  });
  const gonder = (method, params = {}) =>
    new Promise((coz, rej) => {
      const id = ++sonId;
      bekleyen.set(id, { coz, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });
  gonder.olay = (method, zamanAsimi = 30000) =>
    new Promise((coz, rej) => {
      olayBekleyen.set(method, coz);
      setTimeout(() => rej(new Error(`${method} gelmedi`)), zamanAsimi);
    });
  return gonder;
}

const exePath = TARAYICILAR.find((p) => existsSync(p));
if (!exePath) throw new Error("Chrome/Edge bulunamadı");

const profil = mkdtempSync(join(tmpdir(), "tvh-cdp-"));
const cocuk = spawn(exePath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--window-size=1280,900",
  HEDEF,
]);
cocuk.on("error", (e) => {
  console.error("tarayıcı başlatılamadı:", e.message);
  process.exit(1);
});

let cikis = 0;
try {
  await hazirOl(`http://127.0.0.1:${PORT}/json/version`);
  const hedefler = await hazirOl(`http://127.0.0.1:${PORT}/json/list`);
  const sayfa = hedefler.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (!sayfa) throw new Error("sayfa hedefi bulunamadı");

  const ws = new WebSocket(sayfa.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const cdp = oturum(ws);
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  // Tarayıcı açılış URL'sini kendisi yüklerken değerlendirme bağlamı yok olabiliyor;
  // hedefe biz yönlendirip yükleme olayını bekliyoruz.
  const yuklendi = cdp.olay("Page.loadEventFired");
  await cdp("Page.navigate", { url: HEDEF });
  await yuklendi;

  const calistir = async (ifade) => {
    const { result, exceptionDetails } = await cdp("Runtime.evaluate", {
      expression: ifade,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.text ?? "değerlendirme hatası");
    return result.value;
  };

  // 1) Hidratasyon: React olay dinleyicileri bağlanmadan tıklamanın anlamı yok.
  const hidre = await calistir(`
    (async () => {
      for (let i = 0; i < 80; i++) {
        const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Gelişmiş filtreleme'));
        if (b && Object.keys(b).some(k => k.startsWith('__react'))) return true;
        await new Promise(r => setTimeout(r, 250));
      }
      return false;
    })()`);
  if (!hidre) throw new Error("sayfa hidratasyona girmedi");
  console.log("1. Hidratasyon tamam, 'Gelişmiş filtreleme' butonu canlı");

  // 2) Panel açılıyor mu, boyutlar geliyor mu?
  const panel = await calistir(`
    (async () => {
      [...document.querySelectorAll('button')].find(x => x.textContent.includes('Gelişmiş filtreleme')).click();
      await new Promise(r => setTimeout(r, 300));
      const a = document.querySelector('aside');
      if (!a) return null;
      return {
        boyutlar: [...a.querySelectorAll('h3')].map(h => h.textContent.trim()),
        ilkSecenek: a.querySelector('label')?.textContent.trim().replace(/\\s+/g, ' '),
        kutuSayisi: a.querySelectorAll('input[type=checkbox]').length,
      };
    })()`);
  if (!panel) throw new Error("panel açılmadı");
  console.log(`2. Panel açıldı — ${panel.boyutlar.length} boyut, ${panel.kutuSayisi} seçenek`);
  console.log(`   boyutlar: ${panel.boyutlar.join(" · ")}`);

  const kartSay = `document.querySelectorAll('[data-slug]').length`;
  const oncekiKart = await calistir(kartSay);

  /** Yönlendirme sunucuya gidip döndüğü için URL'in değişmesini bekliyoruz. */
  const urlBekle = (kosul) => `
    (async () => {
      for (let i = 0; i < 60; i++) {
        if (${kosul}) return location.search;
        await new Promise(r => setTimeout(r, 250));
      }
      return location.search;
    })()`;

  // 3) Bir onay kutusu işaretlenince URL'e yazılıyor ve liste daralıyor mu?
  // Özniteliğe dayalı bir boyut seçiyoruz (rozet/marka/şehir değil) — normalize
  // edilmiş değerin URL'e yazılıp sunucuda eşleştiğini görmek istiyoruz.
  const secilenEtiket = await calistir(`
    (() => {
      const a = document.querySelector('aside');
      const ortak = ['Rozetler', 'Marka', 'İşletme', 'Şehir', 'İlçe', 'Kimler için uygun'];
      const bolum = [...a.querySelectorAll('section')].find(s => {
        const b = s.querySelector('h3')?.textContent.trim().split('\\n')[0].trim();
        return b && !ortak.includes(b);
      });
      if (!bolum) return null;
      const etiket = bolum.querySelector('label');
      const metin = bolum.querySelector('h3').textContent.trim() + ' = ' +
                    etiket.textContent.trim().replace(/\\s+/g, ' ');
      etiket.querySelector('input').click();
      return metin;
    })()`);
  if (secilenEtiket === null) {
    // Şehir/ilçe kırılımlı sayfalarda kohort tek kayda inebiliyor; o zaman
    // özniteliğe dayalı boyut oluşmaz. Bu bir hata değil, kapsam dışı durum.
    console.log("3. Bu kohortta özniteliğe dayalı boyut yok — filtre adımı atlandı");
    console.log("\nTAMAM: panel açılıyor (kohort küçük olduğu için filtre adımı çalıştırılmadı).");
    process.exit(0);
  }
  const secimUrl = await calistir(urlBekle(`location.search.includes('oz.')`));
  const sonrakiKart = await calistir(kartSay);
  console.log(`3. "${secilenEtiket}" seçildi — URL: ${decodeURIComponent(secimUrl)}`);
  console.log(`   kart sayısı ${oncekiKart} -> ${sonrakiKart}`);
  if (!secimUrl.includes("oz.")) throw new Error("seçim URL'e yazılmadı");
  if (sonrakiKart >= oncekiKart) throw new Error("liste daralmadı");

  // 4) Buton rozeti ve "Tümünü temizle"
  const sayac = await calistir(`
    [...document.querySelectorAll('button')]
      .find(x => x.textContent.includes('Gelişmiş filtreleme'))?.querySelector('span')?.textContent.trim() ?? null`);
  await calistir(
    `[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Tümünü temizle').click()`,
  );
  const temizUrl = await calistir(urlBekle(`!location.search.includes('oz.')`));
  const sonKart = await calistir(kartSay);
  console.log(`4. Buton rozeti: ${sayac ?? "-"} · temizleme sonrası URL: "${temizUrl}" · kart ${sonKart}`);
  if (temizUrl.includes("oz.")) throw new Error("temizleme URL'i sıfırlamadı");
  if (sonKart !== oncekiKart) throw new Error("temizleme sonrası liste geri gelmedi");

  console.log("\nTAMAM: panel açılıyor, seçim URL'e yazılıyor, liste filtreleniyor, temizleme çalışıyor.");
} catch (e) {
  console.error("HATA:", e.message);
  cikis = 1;
} finally {
  cocuk.kill();
  try {
    rmSync(profil, { recursive: true, force: true });
  } catch {
    /* profil klasörü kilitli kalabilir, önemsiz */
  }
  process.exit(cikis);
}
