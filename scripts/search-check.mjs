/**
 * Arama paletini gerçek tarayıcıda doğrular: kısayollar, canlı sonuç, klavye
 * gezinme ve arka plan bulanıklığı.
 *
 *   node scripts/search-check.mjs [genislik]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GENISLIK = Number(process.argv[2]) || 1280;
const PORT = 9600 + (process.pid % 200);
const TARAYICILAR = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
];
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function hazirOl(u, deneme = 60) {
  for (let i = 0; i < deneme; i++) {
    try {
      const r = await fetch(u);
      if (r.ok) return r.json();
    } catch {
      /* henüz ayakta değil */
    }
    await bekle(250);
  }
  throw new Error(`${u} yanıt vermedi`);
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
  gonder.olay = (method, zamanAsimi = 40000) =>
    new Promise((coz, rej) => {
      olaylar.set(method, coz);
      setTimeout(() => rej(new Error(`${method} gelmedi`)), zamanAsimi);
    });
  return gonder;
}

const exePath = TARAYICILAR.find((p) => existsSync(p));
if (!exePath) throw new Error("Chrome/Edge bulunamadı");

const profil = mkdtempSync(join(tmpdir(), "tvh-arama-"));
const cocuk = spawn(exePath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
]);

let kod = 0;
try {
  await hazirOl(`http://127.0.0.1:${PORT}/json/version`);
  const hedefler = await hazirOl(`http://127.0.0.1:${PORT}/json/list`);
  const sayfa = hedefler.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  const ws = new WebSocket(sayfa.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const cdp = oturum(ws);
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: GENISLIK,
    height: 850,
    deviceScaleFactor: 1,
    mobile: GENISLIK < 640,
  });

  const yuklendi = cdp.olay("Page.loadEventFired");
  await cdp("Page.navigate", { url: "http://localhost:3005/" });
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
        const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '') === 'Ara');
        if (b && Object.keys(b).some(k => k.startsWith('__react'))) return true;
        await new Promise(r => setTimeout(r, 250));
      }
      return false;
    })()`);
  if (!hidre) throw new Error("sayfa hidratasyona girmedi");
  console.log(`${GENISLIK}px — hidratasyon tamam`);

  // 1) Ctrl+K ile açılış
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "k", code: "KeyK", modifiers: 2, windowsVirtualKeyCode: 75 });
  await bekle(500);
  const acilis = await calistir(`
    (() => {
      const d = [...document.querySelectorAll('dialog')].find(x => x.getAttribute('aria-label') === 'Arama');
      if (!d || !d.open) return null;
      const st = getComputedStyle(d, '::backdrop');
      return { acik: d.open, girdi: !!d.querySelector('input'), bulanik: st.backdropFilter };
    })()`);
  if (!acilis) throw new Error("Ctrl+K paleti açmadı");
  console.log(`1. Ctrl+K açtı · girdi: ${acilis.girdi ? "var" : "yok"} · arka plan: ${acilis.bulanik}`);
  if (!/blur/.test(acilis.bulanik || "")) throw new Error("arka plan bulanıklığı yok");

  // 2) Öneri listesi (boş sorguda)
  const oneri = await calistir(`
    (async () => {
      await new Promise(r => setTimeout(r, 700));
      const d = [...document.querySelectorAll('dialog')].find(x => x.getAttribute('aria-label') === 'Arama');
      return d.querySelectorAll('button[type=button]').length;
    })()`);
  console.log(`2. Boş sorguda öneri satırı: ${oneri - 1}`);

  // 3) Yazınca canlı sonuç
  const arama = await calistir(`
    (async () => {
      const d = [...document.querySelectorAll('dialog')].find(x => x.getAttribute('aria-label') === 'Arama');
      const inp = d.querySelector('input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, 'telefon');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 1400));
      const satirlar = [...d.querySelectorAll('button[type=button]')]
        .map(b => b.textContent.trim())
        .filter(t => t && t !== '');
      return satirlar.slice(0, 4);
    })()`);
  console.log(`3. "telefon" sonuçları: ${arama.length ? arama.slice(0, 3).join(" | ").slice(0, 90) : "YOK"}`);
  if (arama.length === 0) throw new Error("canlı sonuç gelmedi");

  // 4) Bütçe ayıklama — arama sayfasıyla aynı mantık
  const butce = await calistir(`
    (async () => {
      const r = await fetch('/api/ara?q=' + encodeURIComponent('25.000 TL altı telefon'));
      const j = await r.json();
      return { toplam: j.toplam, ilk: j.kayitlar[0]?.baslik ?? null };
    })()`);
  console.log(`4. "25.000 TL altı telefon" → ${butce.toplam} sonuç · ilk: ${butce.ilk}`);

  // 5) ESC ile kapanış ve gövde kilidinin çözülmesi
  const kapanis = await calistir(`
    (async () => {
      const d = [...document.querySelectorAll('dialog')].find(x => x.getAttribute('aria-label') === 'Arama');
      d.close();
      await new Promise(r => setTimeout(r, 400));
      return { acik: d.open, kilit: document.body.style.overflow };
    })()`);
  console.log(`5. Kapanış · açık: ${kapanis.acik} · gövde kilidi: "${kapanis.kilit}"`);
  if (kapanis.acik) throw new Error("palet kapanmadı");
  if (kapanis.kilit === "hidden") throw new Error("gövde kaydırma kilidi çözülmedi");

  console.log("\nTAMAM: kısayol, canlı sonuç, bütçe ayıklama ve kapanış çalışıyor.");
} catch (e) {
  console.error("HATA:", e.message);
  kod = 1;
} finally {
  cocuk.kill();
  try {
    rmSync(profil, { recursive: true, force: true });
  } catch {
    /* profil kilitli kalabilir */
  }
  process.exit(kod);
}
