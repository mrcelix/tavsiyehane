import { ogKarti, OG_BOYUT, OG_TUR } from "@/lib/og-card";

export const alt = "TavsiyeHane tavsiye puanı";
export const size = OG_BOYUT;
export const contentType = OG_TUR;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogKarti("urun", slug);
}
