import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { getBundle } from "@/lib/data";
import { itemHref } from "@/lib/routes";
import { ItemForm } from "@/components/admin/ItemForm";
import { Onayli } from "@/components/admin/Onayli";
import { Dugme } from "@/components/admin/ui";
import { kayitGuncelleAction, kayitSilAction } from "../actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}

export default async function KayitDuzenlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const bundle = await getBundle();
  const item = bundle.items.find((i) => i.slug === slug);
  if (!item) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/panel/icerik"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
        >
          <ArrowLeft size={13} /> İçerik listesi
        </Link>
        <Link
          href={itemHref(item)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:underline"
        >
          Sitede gör <ExternalLink size={12} />
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight">{item.title}</h1>

      {sp.kaydedildi && (
        <p className="flex items-center gap-2 rounded-xl bg-[var(--up-soft)] p-3 text-sm font-semibold text-[var(--up)]">
          <CheckCircle2 size={16} /> Kaydedildi.
        </p>
      )}

      {item.provenance.kind === "demo" && (
        <p className="rounded-xl bg-[var(--gold-soft)] p-3 text-sm leading-relaxed text-[var(--gold-ink)]">
          Bu kayıt <strong>yerleşik örnek veriden</strong> geliyor ve henüz veritabanında değil. Kaydettiğinizde
          gerçek kayda dönüşür; sentetik oyları taşınmaz.
        </p>
      )}

      <ItemForm item={item} categories={bundle.categories} action={kayitGuncelleAction} />

      <div className="rounded-[14px] border border-[color-mix(in_oklab,var(--down)_30%,transparent)] p-5">
        <h2 className="text-sm font-bold text-[var(--down)]">Tehlikeli bölge</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          Kayıt silindiğinde ona bağlı yorumlar, oylar ve fiyat geçmişi de silinir. Geri alınamaz.
        </p>
        <Onayli
          soru={`"${item.title}" kalıcı olarak silinecek. Emin misiniz?`}
          action={kayitSilAction}
          className="mt-3"
        >
          <input type="hidden" name="id" value={item.id} />
          <Dugme tur="tehlike" type="submit">
            Kaydı sil
          </Dugme>
        </Onayli>
      </div>
    </div>
  );
}
