import type { Metadata } from "next";
import { TypeHub } from "@/components/TypeHub";

export const metadata: Metadata = {
  title: "Hizmet Tavsiyeleri",
  description: "Ev temizliği, nakliye ve teknik serviste belgeli, doğrulanmış ve şeffaf fiyatlı hizmet sağlayıcılar.",
};

export default function HizmetlerPage() {
  return (
    <TypeHub
      type="hizmet"
      title="Hizmet Tavsiyeleri"
      subtitle="Doğrulanmış müşteri değerlendirmesi, uzmanlık, belge ve fiyat şeffaflığı kriterlerine göre puanlanmış güvenilir hizmetler."
    />
  );
}
