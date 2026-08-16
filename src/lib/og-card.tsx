import { ImageResponse } from "next/og";
import { getBundle } from "./data";
import { scoreBasisLabel } from "./scoring";
import { TYPE_LABELS, type Item, type ItemType } from "./types";

/**
 * PAYLAŞIM KARTI (Open Graph görseli)
 *
 * Her kayıt için sunucuda üretilen 1200×630 PNG. Bağlantı WhatsApp'ta, X'te ya
 * da bir mesajlaşma uygulamasında paylaşıldığında görünen kart budur.
 *
 * NEDEN ÜRETİLİYOR: sitenin tamamı tek bir `og.png` kullanıyordu, yani
 * paylaşılan her kayıt aynı görünüyordu — hangi ürün olduğu, kaç puan aldığı,
 * puanın neye dayandığı kartta yoktu. Oysa sitenin iddiası tam olarak bu:
 * puanı ve dayanağını göstermek. Kart da onu gösteriyor.
 *
 * KISITLAR (bkz. next/og belgeleri):
 *  - Yalnızca flexbox; `display: grid` çalışmaz.
 *  - Font olarak ttf/otf/woff kabul edilir, WOFF2 EDİLMEZ. Sitenin kendi
 *    fontları woff2 olduğu için burada gömülü varsayılan font kullanılıyor;
 *    Türkçe karakterler onunla çiziliyor.
 *  - Paket sınırı 500 KB.
 */

export const OG_BOYUT = { width: 1200, height: 630 };
export const OG_TUR = "image/png";

/** Puana göre halka rengi — sitedeki ScoreRing ile aynı eşikler. */
function puanRengi(puan: number): string {
  if (puan >= 85) return "#15a24a";
  if (puan >= 70) return "#efa013";
  return "#6b7488";
}

export async function ogKarti(type: ItemType, slug: string) {
  const bundle = await getBundle();
  const item = bundle.items.find((i) => i.type === type && i.slug === slug);
  if (!item) return yedekKart();

  const kategori = bundle.categories.find((c) => c.slug === item.categorySlug);
  const dayanak = scoreBasisLabel(item).kisa;
  const renk = puanRengi(item.score);
  const ornek = item.provenance.kind === "demo";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(150deg, #16203A 0%, #1E2B4D 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Üst şerit: kategori ve tip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              color: "#C7CEE8",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {kategori?.name ?? TYPE_LABELS[item.type].singular}
          </div>
          <div style={{ display: "flex", color: "#8C96B8", fontSize: 24 }}>
            {TYPE_LABELS[item.type].singular}
          </div>
          {ornek && (
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(224,73,78,0.18)",
                color: "#F1A7A9",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Örnek veri
            </div>
          )}
        </div>

        {/* Orta: başlık solda, puan sağda */}
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 62, fontWeight: 800, lineHeight: 1.12 }}>
              {item.title.length > 64 ? `${item.title.slice(0, 63)}…` : item.title}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 30, color: "#B6BEDC" }}>
              {[item.brand, item.city].filter(Boolean).join(" · ")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 999,
              border: `12px solid ${renk}`,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", fontSize: 92, fontWeight: 800, color: "#ffffff" }}>{item.score}</div>
            <div style={{ display: "flex", fontSize: 18, color: "#8C96B8" }}>tavsiye puanı</div>
          </div>
        </div>

        {/* Alt şerit: marka ve puanın dayanağı */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800 }}>
            <span style={{ color: "#ffffff" }}>Tavsiye</span>
            <span style={{ color: "#EFA013" }}>Hane</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#8C96B8" }}>
            Puan dayanağı: {dayanak}
          </div>
        </div>
      </div>
    ),
    OG_BOYUT
  );
}

/** Kayıt bulunamazsa sade marka kartı — paylaşım bağlantısı yine de kartlı görünür. */
function yedekKart() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #16203A 0%, #1E2B4D 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800 }}>
          <span style={{ color: "#ffffff" }}>Tavsiye</span>
          <span style={{ color: "#EFA013" }}>Hane</span>
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#B6BEDC" }}>
          Her konuda doğru tavsiye
        </div>
      </div>
    ),
    OG_BOYUT
  );
}

/** Paylaşım kartının alternatif metni. */
export function ogAlt(item: Pick<Item, "title">): string {
  return `${item.title} — TavsiyeHane tavsiye puanı`;
}
