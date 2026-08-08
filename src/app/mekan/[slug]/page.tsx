import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ItemDetail, findItemOr404 } from "@/components/ItemDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await findItemOr404("mekan", slug);
  if (!item) return {};
  return pageMetadata({
    title: `${item.title} — Değerlendirme ve Bilgiler`,
    description: item.whyRecommended,
    path: `/mekan/${item.slug}`,
    type: "article",
    // Örnek kayıt indekslenmez (bkz. app/sitemap.ts).
    noIndex: item.provenance.kind === "demo",
  });
}

export default async function MekanDetayPage({ params }: Props) {
  const { slug } = await params;
  const item = await findItemOr404("mekan", slug);
  if (!item) notFound();
  return <ItemDetail item={item} />;
}
