import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ItemDetail, findItemOr404 } from "@/components/ItemDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await findItemOr404("urun", slug);
  if (!item) return {};
  return pageMetadata({
    title: `${item.title} İncelemesi ve Fiyatları`,
    description: item.whyRecommended,
    path: `/urun/${item.slug}`,
    type: "article",
    // Örnek kayıt indekslenmez: uydurma bir ürünü arama sonucuna sokmak,
    // onu gerçek diye sunmaktır (bkz. app/sitemap.ts).
    noIndex: item.provenance.kind === "demo",
  });
}

export default async function UrunDetayPage({ params }: Props) {
  const { slug } = await params;
  const item = await findItemOr404("urun", slug);
  if (!item) notFound();
  return <ItemDetail item={item} />;
}
