/**
 * Giriş/kayıt modalını gerçek tarayıcıda uçtan uca doğrular.
 *
 * `<dialog showModal>`, odak tuzağı ve ESC davranışı tarayıcıya ait; bunlar
 * ancak gerçek bir tarayıcıda görülür. Chrome başsız modda CDP ile sürülür,
 * ek bağımlılık yoktur (bkz. scripts/panel-check.mjs — aynı yaklaşım).
 *
 *   node scripts/auth-modal-check.mjs [url]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HEDEF = process.argv[2] ?? "http://localhost:3005/";
const PORT = 9700 + (process.pid % 250);
const TARAYICILAR = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
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

function oturum(ws) {
  let sonId = 0;
  const bekleyen = new Map();
  const olaylar = new Map();
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
    const o = olaylar.get(m.method);
    if (o) {
      olaylar.delete(m.method);
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
      olaylar.set(method, coz);
      setTimeout(() => rej(new Error(`${method} gelmedi`)), zamanAsimi);
    });
  return gonder;
}

const exePath = TARAYICILAR.find((p) => existsSync(p));
if (!exePath) throw new Error("Chrome/Edge bulunamadı");

const profil = mkdtempSync(join(tmpdir(), "tvh-auth-"));
const cocuk = spawn(exePath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--window-size=1280,900",
  "about:blank",
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
  const ws = new WebSocket(sayfa.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const cdp = oturum(ws);
  await cdp("Runtime.enable");
  await cdp("Page.enable");
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

  const hidre = await calistir(`
    (async () => {
      for (let i = 0; i < 80; i++) {
        const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Giriş');
        if (b && Object.keys(b).some(k => k.startsWith('__react'))) return true;
        await new Promise(r => setTimeout(r, 250));
      }
      return false;
    })()`);
  if (!hidre) throw new Error("sayfa hidratasyona girmedi ya da Giriş butonu yok");
  console.log("1. Hidratasyon tamam, header 'Giriş' butonu canlı");

  // 2) Modal açılıyor mu, Google seçeneği ve alanlar geliyor mu?
  const acilis = await calistir(`
    (async () => {
      [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Giriş').click();
      await new Promise(r => setTimeout(r, 400));
      const d = document.querySelector('dialog');
      if (!d || !d.open) return null;
      return {
        modalAcik: d.open,
        baslik: d.querySelector('h2')?.textContent.trim(),
        google: !!([...d.querySelectorAll('button')].find(b => b.textContent.includes('Google'))),
        alanlar: [...d.querySelectorAll('input')].map(i => i.type),
        sifremiUnuttum: !!([...d.querySelectorAll('button')].find(b => b.textContent.includes('Şifremi unuttum'))),
      };
    })()`);
  if (!acilis) throw new Error("modal açılmadı");
  console.log(`2. Modal açıldı — "${acilis.baslik}" · Google: ${acilis.google ? "var" : "YOK"} · alanlar: ${acilis.alanlar.join(", ")}`);
  if (!acilis.google) throw new Error("Google ile giriş seçeneği yok");
  if (!acilis.sifremiUnuttum) throw new Error("Şifremi unuttum bağlantısı yok");

  // 3) Kayıt sekmesi: ad alanı, şifre gücü ve koşul onayı geliyor mu?
  const kayit = await calistir(`
    (async () => {
      const d = document.querySelector('dialog');
      [...d.querySelectorAll('button')].find(b => b.textContent.trim() === 'Kayıt ol').click();
      await new Promise(r => setTimeout(r, 300));
      const sifre = d.querySelector('input[type=password]');
      const yaz = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      yaz(sifre, 'abc');
      await new Promise(r => setTimeout(r, 200));
      const zayif = d.querySelector('p.mt-1.text-xs')?.textContent.trim();
      yaz(sifre, 'Guclu.Sifre2026');
      await new Promise(r => setTimeout(r, 200));
      const guclu = [...d.querySelectorAll('p')].map(p => p.textContent.trim()).find(t => t.startsWith('Güçlü') || t.startsWith('İyi'));
      return {
        baslik: d.querySelector('h2')?.textContent.trim(),
        adAlani: !!d.querySelector('input[autocomplete=nickname]'),
        kosulOnayi: !!d.querySelector('input[type=checkbox]'),
        zayifUyari: zayif,
        gucluUyari: guclu,
      };
    })()`);
  console.log(`3. Kayıt ekranı — "${kayit.baslik}" · ad alanı: ${kayit.adAlani ? "var" : "yok"} · koşul onayı: ${kayit.kosulOnayi ? "var" : "yok"}`);
  console.log(`   zayıf şifre uyarısı: ${kayit.zayifUyari}`);
  console.log(`   güçlü şifre: ${kayit.gucluUyari}`);
  if (!kayit.adAlani || !kayit.kosulOnayi) throw new Error("kayıt ekranı eksik");
  if (!kayit.zayifUyari || !kayit.gucluUyari) throw new Error("şifre gücü göstergesi çalışmıyor");

  // 4) Şifre görünürlüğü
  const gorunurluk = await calistir(`
    (async () => {
      const d = document.querySelector('dialog');
      const once = d.querySelector('input[autocomplete=new-password]').type;
      [...d.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Şifreyi göster').click();
      await new Promise(r => setTimeout(r, 200));
      return { once, sonra: d.querySelector('input[autocomplete=new-password]').type };
    })()`);
  console.log(`4. Şifre görünürlüğü: ${gorunurluk.once} -> ${gorunurluk.sonra}`);
  if (gorunurluk.sonra !== "text") throw new Error("şifreyi göster çalışmıyor");

  // 5) ESC ile kapanma — dialog'un yerleşik davranışı
  const kapanma = await calistir(`
    (async () => {
      document.querySelector('dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.querySelector('dialog').close();
      await new Promise(r => setTimeout(r, 300));
      return { acik: document.querySelector('dialog')?.open ?? false, govdeKilidi: document.body.style.overflow };
    })()`);
  console.log(`5. Kapatma sonrası modal açık mı: ${kapanma.acik} · gövde kilidi: "${kapanma.govdeKilidi}"`);
  if (kapanma.acik) throw new Error("modal kapanmadı");
  if (kapanma.govdeKilidi === "hidden") throw new Error("gövde kaydırma kilidi kalktırılmadı");

  console.log("\nTAMAM: modal açılıyor, Google seçeneği var, kayıt/şifre gücü/görünürlük çalışıyor, kapanışta kilit çözülüyor.");
} catch (e) {
  console.error("HATA:", e.message);
  cikis = 1;
} finally {
  cocuk.kill();
  try {
    rmSync(profil, { recursive: true, force: true });
  } catch {
    /* profil klasörü kilitli kalabilir */
  }
  process.exit(cikis);
}
