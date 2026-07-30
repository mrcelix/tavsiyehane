import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/data";
import { Listing, type ListingSearchParams } from "@/components/Listing";

interface Props {
  params: Promise<{ kategori: string }>;
  searchParams: Promise<ListingSearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const bundle = await getBundle();
  const cat = bundle.categories.find((c) => c.slug === kategori && c.type === "urun");
  if (!cat) return {};
  return { title: `En İyi ${cat.name} Tavsiyeleri`, description: cat.description };
}

export default async function UrunKategoriPage({ params, searchParams }: Props) {
  const { kategori } = await params;
  const sp = await searchParams;
  const bundle = await getBundle();
  const cat = bundle.categories.find((c) => c.slug === kategori && c.type === "urun");
  if (!cat) notFound();

  return (
    <Listing
      type="urun"
      categorySlug={cat.slug}
      searchParams={sp}
      title={`En İyi ${cat.name} Tavsiyeleri`}
      subtitle={cat.description}
    />
  );
}
