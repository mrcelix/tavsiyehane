import type { Metadata } from "next";
import Link from "next/link";
import { getBundle } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "En İyi Listeleri",
  description: "İhtiyaca göre derlenmiş 'en iyi' rehberleri: telefonlardan otellere, temizlikten robot süpürgelere.",
};

export default async function ListelerPage() {
  const bundle = await getBundle();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">En İyi Listeleri</h1>
      <p className="mt-1.5 text-zinc-500 dark:text-zinc-400">
        Editör ekibinin ihtiyaç senaryolarına göre derlediği, düzenli güncellenen rehberler.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundle.lists.map((l) => (
          <Link
            key={l.id}
            href={`/liste/${l.slug}`}
            className="card-hover flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="font-bold leading-snug">{l.title}</h2>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-500 dark:text-zinc-400">{l.description}</p>
            <p className="mt-3 text-xs text-zinc-400">
              {l.itemSlugs.length} öneri · Güncelleme: {formatDate(l.updatedAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
