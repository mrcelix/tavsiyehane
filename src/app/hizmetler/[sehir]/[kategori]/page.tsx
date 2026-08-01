import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/data";
import { uniqueCities } from "@/lib/query";
import { isCategoryLive } from "@/lib/categories";
import { slugify } from "@/lib/format";
import { Listing, type ListingSearchParams } from "@/components/Listing";

interface Props {
  params: Promise<{ sehir: string; kategori: string }>;
  searchParams: Promise<ListingSearchParams>;
}

async function resolve(sehirSlug: string, kategoriSlug: string) {
  const bundle = await getBundle();
  const cat = bundle.categories.find((c) => c.slug === kategoriSlug && c.type === "hizmet");
  const city = sehirSlug === "tumu" ? undefined : uniqueCities(bundle, "hizmet").find((c) => slugify(c) === sehirSlug);
  return { bundle, cat, city, cityMissing: sehirSlug !== "tumu" && !city };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sehir, kategori } = await params;
  const { cat, city } = await resolve(sehir, kategori);
  if (!cat) return {};
  const title = city ? `${city} ${cat.name} Hizmetleri` : `${cat.name} Hizmetleri`;
  return pageMetadata({
    title,
    description: city ? `${city} için ${cat.description.toLocaleLowerCase("tr")}` : cat.description,
    path: `/hizmetler/${sehir}/${cat.slug}`,
  });
}

export default async function HizmetKategoriPage({ params, searchParams }: Props) {
  const { sehir, kategori } = await params;
  const sp = await searchParams;
  const { cat, city, cityMissing } = await resolve(sehir, kategori);
  if (!cat || !isCategoryLive(cat) || cityMissing) notFound();

  return (
    <Listing
      type="hizmet"
      categorySlug={cat.slug}
      city={city}
      searchParams={sp}
      title={city ? `${city}'da Güvenilir ${cat.name}` : `Güvenilir ${cat.name} Hizmetleri`}
      subtitle={cat.description}
    />
  );
}
