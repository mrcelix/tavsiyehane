import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TypeHub } from "@/components/TypeHub";

export const metadata: Metadata = pageMetadata({
  title: "Mekân Tavsiyeleri",
  description: "Restoran, kafe ve otellerde konum, atmosfer ve amaca uygunluğa göre şehrin en iyi mekânları.",
  path: "/mekanlar",
});

export default function MekanlarPage() {
  return (
    <TypeHub
      type="mekan"
      title="Mekân Tavsiyeleri"
      subtitle="Son dönem kullanıcı ilgisi, değerlendirme kalitesi, güncellik ve amaca uygunluk kriterlerine göre puanlanmış mekânlar."
    />
  );
}
