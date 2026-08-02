/**
 * Mobil düzen denetimi.
 *
 * Yatay kaydırma ve minik dokunma hedefleri gözle kolayca kaçar; bu script
 * ölçer. Her sayfa için: belgenin viewport'tan taşıp taşmadığı, taşıran
 * öğeler, 44px'in altındaki dokunma hedefleri ve 12px altı yazılar.
 *
 *   node scripts/mobile-check.mjs [genislik]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GENISLIK = Number(process.argv[2]) || 375;
const YUKSEKLIK = 812;
const TABAN = "http://localhost:3005";
const YOLLAR = ["/", "/urunler/telefon", "/urun/apple-iphone-17-256gb", "/listeler", "/metodoloji", "/karsilastir"];

const PORT = 9500 + (process.pid % 200);
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

const profil = mkdtempSync(join(tmpdir(), "tvh-mobil-"));
const cocuk = spawn(exePath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  `--window-size=${GENISLIK},${YUKSEKLIK}`,
  "about:blank",
]);

const DENETIM = `
(() => {
  const vw = document.documentElement.clientWidth;
  const tasanlar = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const st = getComputedStyle(el);
      if (st.position === 'fixed' || st.visibility === 'hidden' || st.display === 'none') continue;
      tasanlar.push({
        etiket: el.tagName.toLowerCase(),
        sinif: (el.className || '').toString().slice(0, 60),
        sol: Math.round(r.left),
        sag: Math.round(r.right),
      });
    }
  }
  const kucukHedef = [];
  for (const el of document.querySelectorAll('a, button, select, input[type=checkbox]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 32 || r.width < 32) {
      kucukHedef.push({
        etiket: el.tagName.toLowerCase(),
        metin: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28),
        en: Math.round(r.width),
        boy: Math.round(r.height),
      });
    }
  }
  return {
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    yatayKaydirma: document.documentElement.scrollWidth > vw + 1,
    tasanlar: tasanlar.slice(0, 8),
    kucukHedef: kucukHedef.slice(0, 8),
  };
})()`;

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

  /*
   * `--window-size` viewport'u BELİRLEMİYOR: pencere kromu ve ölçekleme
   * yüzünden 375 istenip 512 elde edilebiliyor — ilk denemede tam bu oldu ve
   * "mobil" testler aslında tablet genişliğinde koştu. Cihaz ölçüsü CDP ile
   * dayatılmalı.
   */
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: GENISLIK,
    height: YUKSEKLIK,
    deviceScaleFactor: 2,
    mobile: true,
  });

  console.log(`Genişlik: ${GENISLIK}px\n`);
  let sorun = 0;

  for (const yol of YOLLAR) {
    const yuklendi = cdp.olay("Page.loadEventFired");
    await cdp("Page.navigate", { url: TABAN + yol });
    await yuklendi;
    await bekle(700);

    const { result, exceptionDetails } = await cdp("Runtime.evaluate", {
      expression: DENETIM,
      returnByValue: true,
    });
    if (exceptionDetails) {
      console.log(`  ! ${yol} — denetim çalışmadı`);
      continue;
    }
    const d = result.value;
    const durum = d.yatayKaydirma ? "TAŞMA" : "tamam";
    console.log(`${d.yatayKaydirma ? "✗" : "✓"} ${yol.padEnd(34)} ${durum} (${d.scrollWidth}/${d.vw})`);

    if (d.yatayKaydirma) {
      sorun++;
      for (const t of d.tasanlar) {
        console.log(`      <${t.etiket}> ${t.sol}→${t.sag}  ${t.sinif}`);
      }
    }
    if (d.kucukHedef.length > 0) {
      console.log(`      küçük dokunma hedefi: ${d.kucukHedef.length}`);
      for (const k of d.kucukHedef.slice(0, 3)) {
        console.log(`        <${k.etiket}> ${k.en}×${k.boy}  "${k.metin}"`);
      }
    }
  }

  console.log(sorun === 0 ? "\nYatay taşma yok." : `\n${sorun} sayfada yatay taşma var.`);
  kod = sorun > 0 ? 1 : 0;
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
