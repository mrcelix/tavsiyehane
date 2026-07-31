import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ItemDetail, findItemOr404 } from "@/components/ItemDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await findItemOr404("hizmet", slug);
  if (!item) return {};
  return pageMetadata({
    title: `${item.title} — Değerlendirme ve Teklif`,
    description: item.whyRecommended,
    path: `/hizmet/${item.slug}`,
    type: "article",
  });
}

export default async function HizmetDetayPage({ params }: Props) {
  const { slug } = await params;
  const item = await findItemOr404("hizmet", slug);
  if (!item) notFound();
  return <ItemDetail item={item} />;
}
