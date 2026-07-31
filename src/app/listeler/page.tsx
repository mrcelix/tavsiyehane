import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getBundle } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "En İyi Listeleri",
  description: "İhtiyaca göre derlenmiş 'en iyi' rehberleri: telefonlardan otellere, temizlikten robot süpürgelere.",
  path: "/listeler",
});

export default async function ListelerPage() {
  const bundle = await getBundle();
  return (
    <div className="mx-auto max-w-[1220px] px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">En İyi Listeleri</h1>
      <p className="mt-1.5 text-[var(--muted)]">
        Editör ekibinin ihtiyaç senaryolarına göre derlediği, düzenli güncellenen rehberler.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundle.lists.map((l) => (
          <Link
            key={l.id}
            href={`/liste/${l.slug}`}
            className="card-hover flex flex-col rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-base font-bold leading-snug">{l.title}</h2>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--muted)]">{l.description}</p>
            <p className="mt-3 text-xs text-[var(--muted-2)]">
              <span className="font-num">{l.itemSlugs.length}</span> öneri · Güncelleme: {formatDate(l.updatedAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
