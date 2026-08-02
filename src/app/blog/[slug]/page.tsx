import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { yaziOku } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const y = await yaziOku(slug);
  if (!y) return {};
  return pageMetadata({ title: y.title, description: y.excerpt ?? y.title, path: `/blog/${y.slug}` });
}

export default async function YaziPage({ params }: Props) {
  const { slug } = await params;
  const y = await yaziOku(slug);
  if (!y) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
        <ArrowLeft size={13} /> Blog
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-[34px]">{y.title}</h1>
      {y.publishedAt && <p className="mt-2 text-sm text-[var(--muted-2)]">{formatDate(y.publishedAt)}</p>}

      {y.cover && (
        <figure className="mt-6">
          <Image
            src={y.cover.url}
            alt={y.cover.alt}
            width={1200}
            height={630}
            className="w-full rounded-[14px] object-cover"
            priority
          />
          <figcaption className="mt-1.5 text-[11px] text-[var(--muted-2)]">
            {y.cover.credit} · {y.cover.license}
          </figcaption>
        </figure>
      )}

      {y.excerpt && <p className="mt-6 text-lg leading-relaxed text-[var(--ink-2)]">{y.excerpt}</p>}

      {/* Düz metin: paragraflar boş satırla ayrılır. HTML kabul etmiyoruz —
          panelden gelen serbest HTML, XSS'in en yaygın kapısıdır. */}
      <div className="mt-6 space-y-4 leading-relaxed text-[var(--ink-2)]">
        {y.body
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>
    </article>
  );
}
