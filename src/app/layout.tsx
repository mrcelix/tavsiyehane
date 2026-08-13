import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { metadataBase, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { TrustMarquee } from "@/components/layout/TrustMarquee";
import { Footer } from "@/components/layout/Footer";
import { CompareTray } from "@/components/CompareTray";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { Analytics } from "@vercel/analytics/next";
import { EventTracker } from "@/components/EventTracker";
import { SearchPalette } from "@/components/SearchPalette";

/*
 * FONTLAR DEPODA — `next/font/google` DEĞİL.
 *
 * Google fontları derleme anında indiriyordu ve dosya adreslerini döndürdüğü
 * gün derleme kırıldı: Vercel geri yüklediği derleme önbelleğindeki eski
 * adresleri istedi, Google 404 döndü. Yerel dosyada bu bağımlılık yok; derleme
 * artık ağa çıkmıyor.
 *
 * DOSYALAR DEĞİŞKEN (variable) SÜRÜMLER: aile başına tek dosya bütün ağırlıkları
 * karşılıyor, statik ağırlık başına ayrı dosya indirmeye gerek kalmıyor.
 *
 * NEDEN AİLE BAŞINA İKİ DOSYA: `ğ ş İ` latin-ext alt kümesinde, `ı` ve ASCII
 * latin'de. Tek dosya ikisini birden vermiyor. Her dosya kendi `unicode-range`i
 * ile tanımlanıyor; tarayıcı hangi karakter için hangisini indireceğini
 * buradan biliyor. Aralıklar Google'ın alt küme tanımlarının aynısı.
 *
 * `next/font` çağrıları statik analiz edilir: değerler birebir literal olmak
 * zorunda, ortak sabite ya da yardımcı fonksiyona çıkarılamazlar. Aynı iki
 * `unicode-range` dizisinin altı kez tekrarlanmasının sebebi bu — derleyici
 * "Font loader values must be explicitly written literals" diyerek reddediyor.
 */
const interLatin = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
const interLatinExt = localFont({
  src: "./fonts/inter-latin-ext.woff2",
  weight: "100 900",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

const nunitoLatin = localFont({
  src: "./fonts/nunito-latin.woff2",
  weight: "200 1000",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
const nunitoLatinExt = localFont({
  src: "./fonts/nunito-latin-ext.woff2",
  weight: "200 1000",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

const jetbrainsLatin = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
const jetbrainsLatinExt = localFont({
  src: "./fonts/jetbrains-mono-latin-ext.woff2",
  weight: "100 800",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

/**
 * `localFont` yığını "aile, aile Fallback" biçiminde döner; bu yalnızca gerçek
 * aileyi bırakır.
 *
 * SIRALAMA ÖNEMLİ: yedek aile `local(Arial)` üzerine kurulu ve `unicode-range`i
 * YOK, yani her karakteri karşılıyor. Latin yığınının yedeği latin-ext'ten önce
 * gelirse `ğ ş İ` için Arial seçilir ve sayfa iki farklı yazı tipiyle çizilir.
 * Ölçüldü: yedek sırada önceyken `ğ` genişliği 24.00 (Arial × size-adjust),
 * sonraya alınınca 24.53 (Inter latin-ext).
 */
function gercekAile(yigin: string): string {
  return yigin
    .split(",")
    .map((s) => s.trim())
    .filter((s) => !s.includes("Fallback"))
    .join(", ");
}

/*
 * Her `localFont` çağrısı kendi aile adını üretiyor; iki alt kümeyi tek CSS
 * değişkeninde birleştiriyoruz. globals.css'teki `--font-sans`/`--font-display`/
 * `--font-mono` yığınları olduğu gibi çalışmaya devam ediyor. Yedek aile en
 * sonda kalıyor: ikisi de karşılamayan bir karakter için hâlâ devrede.
 */
const FONT_DEGISKENLERI = {
  "--font-inter": `${gercekAile(interLatin.style.fontFamily)}, ${interLatinExt.style.fontFamily}`,
  "--font-nunito": `${gercekAile(nunitoLatin.style.fontFamily)}, ${nunitoLatinExt.style.fontFamily}`,
  "--font-jetbrains": `${gercekAile(jetbrainsLatin.style.fontFamily)}, ${jetbrainsLatinExt.style.fontFamily}`,
} as React.CSSProperties;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Hero her iki temada da koyu; tarayıcı arayüz rengi temaya göre değişir.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

// İlk boyamadan önce çalışır — tema yanıp sönmesi (FOUC) olmaz.
const themeInit = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full" style={FONT_DEGISKENLERI} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Giriş modalı tüm ağacı sarar: header butonu da, yorum/oylama gibi
            giriş isteyen bileşenler de aynı modalı açar. */}
        <AuthModalProvider>
          <TopBar />
          <Header />
          <TrustMarquee />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
          {/* Ölçüm: kim olduğu değil, hangi kaydın ilgi çektiği. Kimlik ve
              çerez kullanmaz (bkz. components/EventTracker). */}
          <EventTracker />
          {/* Arama paleti düzende tek örnek: Ctrl+K ve "/" her sayfada çalışır. */}
          <SearchPalette />
          {/* Vercel Analytics — sayfa görüntülemesi ve trafik kaynağı. Kendi
              `EventTracker`ımızla çakışmaz: o hangi KAYDIN ilgi çektiğini
              ölçüp puanlamayı besler, bu ise sitenin trafiğini gösterir. */}
          <Analytics />
        </AuthModalProvider>
      </body>
    </html>
  );
}
