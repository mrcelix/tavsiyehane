import type { Metadata, Viewport } from "next";
import { Inter, Nunito, JetBrains_Mono } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

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
    <html
      lang="tr"
      className={`${inter.variable} ${nunito.variable} ${jetbrains.variable} h-full`}
      suppressHydrationWarning
    >
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
