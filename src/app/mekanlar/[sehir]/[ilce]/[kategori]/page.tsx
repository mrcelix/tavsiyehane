import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/data";
import { slugify } from "@/lib/format";
import { Listing, type ListingSearchParams } from "@/components/Listing";

interface Props {
  params: Promise<{ sehir: string; ilce: string; kategori: string }>;
  searchParams: Promise<ListingSearchParams>;
}

async function resolve(sehirSlug: string, ilceSlug: string, kategoriSlug: string) {
  const bundle = await getBundle();
  const cat = bundle.categories.find((c) => c.slug === kategoriSlug && c.type === "mekan");
  const mekanlar = bundle.items.filter((i) => i.type === "mekan");
  const city = sehirSlug === "tumu" ? undefined : mekanlar.map((i) => i.city).filter(Boolean).find((c) => slugify(c!) === sehirSlug);
  const district =
    ilceSlug === "tumu" ? undefined : mekanlar.map((i) => i.district).filter(Boolean).find((d) => slugify(d!) === ilceSlug);
  const missing = (sehirSlug !== "tumu" && !city) || (ilceSlug !== "tumu" && !district);
  return { cat, city, district, missing };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sehir, ilce, kategori } = await params;
  const { cat, city, district } = await resolve(sehir, ilce, kategori);
  if (!cat) return {};
  const place = [district, city].filter(Boolean).join(", ");
  return { title: place ? `${place} — En İyi ${cat.name}ler` : `En İyi ${cat.name}lar`, description: cat.description };
}

export default async function MekanKategoriPage({ params, searchParams }: Props) {
  const { sehir, ilce, kategori } = await params;
  const sp = await searchParams;
  const { cat, city, district, missing } = await resolve(sehir, ilce, kategori);
  if (!cat || missing) notFound();

  const place = [district, city].filter(Boolean).join(" / ");
  return (
    <Listing
      type="mekan"
      categorySlug={cat.slug}
      city={city}
      district={district}
      searchParams={sp}
      title={place ? `${place}: En İyi ${cat.name} Önerileri` : `En İyi ${cat.name} Önerileri`}
      subtitle={cat.description}
    />
  );
}
