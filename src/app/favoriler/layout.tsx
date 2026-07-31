import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Sayfanın kendisi istemci bileşeni olduğu için metadata buradan verilir.
export const metadata: Metadata = pageMetadata({
  title: "Favorilerim",
  description: "Beğendiğiniz ürün, hizmet ve mekânları tek listede saklayın.",
  path: "/favoriler",
  noIndex: true,
});

// LayoutProps global bir yardımcıdır (Next 16 tip üretimi); import gerekmez.
export default function FavorilerLayout({ children }: LayoutProps<"/favoriler">) {
  return children;
}
