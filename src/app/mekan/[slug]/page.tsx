import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemDetail, findItemOr404 } from "@/components/ItemDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await findItemOr404("mekan", slug);
  if (!item) return {};
  return { title: `${item.title} — Değerlendirme ve Bilgiler`, description: item.whyRecommended };
}

export default async function MekanDetayPage({ params }: Props) {
  const { slug } = await params;
  const item = await findItemOr404("mekan", slug);
  if (!item) notFound();
  return <ItemDetail item={item} />;
}
