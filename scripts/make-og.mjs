/**
 * public/og.png üretir (1200×630) — sosyal paylaşım görseli.
 * Çalışma zamanında görsel üretmek yerine statik dosya kullanılır; Worker boyutunu etkilemez.
 * Kullanım: npm run og
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 630;
const FONT = "Segoe UI, Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#16203A"/>
      <stop offset="100%" stop-color="#1E2B4D"/>
    </linearGradient>
    <radialGradient id="glowBrand" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3A45E0" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#3A45E0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EFA013" stop-opacity="0.30"/>
      <stop offset="70%" stop-color="#EFA013" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="120" cy="90" r="380" fill="url(#glowBrand)"/>
  <circle cx="1090" cy="180" r="320" fill="url(#glowGold)"/>

  <text x="80" y="120" font-family="${FONT}" font-size="34" font-weight="700" fill="#FFFFFF">Tavsiye<tspan fill="#EFA013">Hane</tspan></text>

  <text x="80" y="272" font-family="${FONT}" font-size="64" font-weight="700" fill="#FFFFFF">Her konuda</text>
  <text x="80" y="352" font-family="${FONT}" font-size="64" font-weight="700" fill="#8E97FF">doğru tavsiye</text>

  <text x="80" y="422" font-family="${FONT}" font-size="28" fill="#B6BEDC">Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver.</text>

  <g font-family="${FONT}" font-size="24" font-weight="600">
    <rect x="80"  y="486" width="190" height="58" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
    <text x="175" y="523" fill="#C7CEE8" text-anchor="middle">Ürünler</text>

    <rect x="290" y="486" width="190" height="58" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
    <text x="385" y="523" fill="#C7CEE8" text-anchor="middle">Hizmetler</text>

    <rect x="500" y="486" width="190" height="58" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
    <text x="595" y="523" fill="#C7CEE8" text-anchor="middle">Mekânlar</text>
  </g>

  <text x="1120" y="580" font-family="${FONT}" font-size="19" fill="#8C96B8" text-anchor="end">Tavsiye puanı satılmaz</text>
</svg>`;

const png = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
writeFileSync("public/og.png", png);
console.log(`public/og.png yazildi (${Math.round(png.length / 1024)} KB, ${W}x${H})`);
