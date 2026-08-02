import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { yayindakiYazilar } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { Overline } from "@/components/ui/Card";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Tavsiye, karşılaştırma ve satın alma rehberleri.",
  path: "/blog",
});

export const revalidate = 300;

export default async function BlogPage() {
  const yazilar = await yayindakiYazilar();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Overline>Blog</Overline>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[32px]">Rehberler ve yazılar</h1>

      {yazilar.length === 0 ? (
        <p className="mt-6 rounded-xl bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">
          Henüz yayımlanmış yazı yok.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--line)]">
          {yazilar.map((y) => (
            <li key={y.slug} className="py-5">
              <Link href={`/blog/${y.slug}`} className="group">
                <h2 className="text-lg font-bold tracking-tight transition-colors group-hover:text-[var(--brand)]">
                  {y.title}
                </h2>
                {y.excerpt && <p className="mt-1 leading-relaxed text-[var(--muted)]">{y.excerpt}</p>}
                {y.publishedAt && (
                  <p className="mt-1.5 text-xs text-[var(--muted-2)]">{formatDate(y.publishedAt)}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
