import type { Metadata } from "next";
import { Inter, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { TrustMarquee } from "@/components/layout/TrustMarquee";
import { Footer } from "@/components/layout/Footer";
import { CompareTray } from "@/components/CompareTray";

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
  title: {
    default: "TavsiyeHane — Her konuda doğru tavsiye",
    template: "%s | TavsiyeHane",
  },
  description:
    "Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver. Ürün, hizmet ve mekân tavsiyelerinde her alanda en iyiler; şeffaf puanlama ve doğrulanmış yorumlarla.",
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
        <TopBar />
        <Header />
        <TrustMarquee />
        <main className="flex-1">{children}</main>
        <Footer />
        <CompareTray />
      </body>
    </html>
  );
}
