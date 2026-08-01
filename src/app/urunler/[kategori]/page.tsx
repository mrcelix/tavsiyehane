import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/data";
import { isCategoryLive } from "@/lib/categories";
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
  return pageMetadata({
    title: `En İyi ${cat.name} Tavsiyeleri`,
    description: cat.description,
    path: `/urunler/${cat.slug}`,
  });
}

export default async function UrunKategoriPage({ params, searchParams }: Props) {
  const { kategori } = await params;
  const sp = await searchParams;
  const bundle = await getBundle();
  // Hazırlanan kategorinin sayfası açılmaz; boş liste hem kullanıcıyı hem
  // arama motorunu yanıltır (bkz. lib/categories.ts).
  const cat = bundle.categories.find((c) => c.slug === kategori && c.type === "urun");
  if (!cat || !isCategoryLive(cat)) notFound();

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
