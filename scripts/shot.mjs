/**
 * Bir sayfanın ekran görüntüsünü alır (başsız Chrome, CDP; ek bağımlılık yok).
 *
 *   node scripts/shot.mjs <url> <cikti.png> [genislik] [yukseklik]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , url, cikti, gen = "1280", yuk = "900"] = process.argv;
if (!url || !cikti) {
  console.error("kullanım: node scripts/shot.mjs <url> <cikti.png> [genislik] [yukseklik]");
  process.exit(1);
}

const PORT = 9800 + (process.pid % 150);
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
  gonder.olay = (method, zamanAsimi = 30000) =>
    new Promise((coz, rej) => {
      olaylar.set(method, coz);
      setTimeout(() => rej(new Error(`${method} gelmedi`)), zamanAsimi);
    });
  return gonder;
}

const exePath = TARAYICILAR.find((p) => existsSync(p));
if (!exePath) throw new Error("Chrome/Edge bulunamadı");

const profil = mkdtempSync(join(tmpdir(), "tvh-shot-"));
const cocuk = spawn(exePath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  `--window-size=${gen},${yuk}`,
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
  await cdp("Page.enable");
  // `--window-size` viewport'u belirlemiyor (pencere kromu + ölçekleme);
  // gerçek genişlik CDP ile dayatılır.
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: Number(gen),
    height: Number(yuk),
    deviceScaleFactor: 1,
    mobile: Number(gen) < 640,
  });
  const yuklendi = cdp.olay("Page.loadEventFired");
  await cdp("Page.navigate", { url });
  await yuklendi;
  // Yazı tipleri ve geçişler otursun.
  await bekle(1200);
  const { data } = await cdp("Page.captureScreenshot", { format: "png" });
  writeFileSync(cikti, Buffer.from(data, "base64"));
  console.log(`yazıldı: ${cikti}`);
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
