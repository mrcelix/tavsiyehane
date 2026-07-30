import type { Metadata } from "next";
import { TypeHub } from "@/components/TypeHub";

export const metadata: Metadata = {
  title: "Ürün Tavsiyeleri",
  description: "Telefon, robot süpürge ve kedi ürünlerinde fiyat-performans, kullanıcı puanı ve dayanıklılığa göre en iyi ürünler.",
};

export default function UrunlerPage() {
  return (
    <TypeHub
      type="urun"
      title="Ürün Tavsiyeleri"
      subtitle="Fiyat-performans, teknik özellikler, satıcı güvenilirliği ve garanti kriterlerine göre puanlanmış en iyi ürünler."
    />
  );
}
