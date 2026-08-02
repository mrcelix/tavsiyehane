import Link from "next/link";
import { Plus } from "lucide-react";
import { getBundle } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { itemHref } from "@/lib/routes";
import { freshnessOf } from "@/lib/freshness";
import { Baslik, Bos, Kart, Tablo } from "@/components/admin/ui";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ tip?: string; ara?: string; kategori?: string }>;
}

const TIPLER: ItemType[] = ["urun", "hizmet", "mekan"];

export default async function IcerikPage({ searchParams }: Props) {
  const sp = await searchParams;
  const bundle = await getBundle();

  const tip = TIPLER.includes(sp.tip as ItemType) ? (sp.tip as ItemType) : undefined;
  const ara = (sp.ara ?? "").toLocaleLowerCase("tr");

  const kayitlar = bundle.items
    .filter((i) => !tip || i.type === tip)
    .filter((i) => !sp.kategori || i.categorySlug === sp.kategori)
    .filter((i) => !ara || i.title.toLocaleLowerCase("tr").includes(ara) || i.slug.includes(ara))
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">İçerik</h1>
        <Link
          href="/panel/icerik/yeni"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--brand)] px-3 py-2 text-xs font-bold text-white hover:bg-[var(--brand-ink)]"
        >
          <Plus size={14} /> Yeni kayıt
        </Link>
      </div>

      <Kart>
        {/* Filtre formu GET: seçim URL'de kalır, paylaşılabilir ve geri tuşuyla çalışır. */}
        <form className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-[var(--ink-2)]">
            <span className="mb-1 block">Tip</span>
            <select name="tip" defaultValue={sp.tip ?? ""} className="rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm">
              <option value="">Tümü</option>
              {TIPLER.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t].plural}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[var(--ink-2)]">
            <span className="mb-1 block">Kategori</span>
            <select name="kategori" defaultValue={sp.kategori ?? ""} className="rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm">
              <option value="">Tümü</option>
              {bundle.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-40 flex-1 text-xs font-semibold text-[var(--ink-2)]">
            <span className="mb-1 block">Ara</span>
            <input
              name="ara"
              defaultValue={sp.ara ?? ""}
              placeholder="Başlık veya slug"
              className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-[10px] bg-[var(--mist-2)] px-3 py-2 text-xs font-bold text-[var(--ink-2)]">
            Filtrele
          </button>
          <span className="ml-auto self-center text-xs text-[var(--muted-2)]">{kayitlar.length} kayıt</span>
        </form>
      </Kart>

      <Kart>
        <Baslik aciklama="Ürün, hizmet ve mekân kayıtlarının tamamı. Başlığa tıklayıp düzenleyin.">
          Kayıtlar
        </Baslik>
        {kayitlar.length === 0 ? (
          <Bos>Filtreye uyan kayıt yok.</Bos>
        ) : (
          <Tablo basliklar={["Başlık", "Tip", "Kategori", "Puan", "Dayanak", "Doğrulama", ""]}>
            {kayitlar.map((i) => {
              const tazelik = i.provenance.kind === "editor" ? freshnessOf(i) : null;
              return (
                <tr key={i.id}>
                  <td className="max-w-72 py-2.5 pr-3">
                    <Link href={`/panel/icerik/${i.slug}`} className="font-medium hover:text-[var(--brand)]">
                      {i.title}
                    </Link>
                    {i.isSponsored && (
                      <span className="ml-1.5 rounded bg-[var(--gold-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold-ink)]">
                        sponsorlu
                      </span>
                    )}
                    {i.provenance.kind === "demo" && (
                      <span className="ml-1.5 rounded bg-[var(--mist-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                        örnek
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">{TYPE_LABELS[i.type].singular}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">{i.categorySlug}</td>
                  <td className="py-2.5 pr-3 font-num font-bold tabular-nums">{i.score}</td>
                  <td className="py-2.5 pr-3 text-xs text-[var(--muted)]">
                    {i.scoreBasis === "topluluk" ? "Topluluk" : i.scoreBasis === "dis-sinyal" ? "Dış sinyal" : "Editör"}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 text-xs",
                      tazelik === "bayat"
                        ? "text-[var(--down)]"
                        : tazelik === "eskiyor"
                          ? "text-[var(--gold-ink)]"
                          : "text-[var(--muted-2)]"
                    )}
                  >
                    {i.provenance.verifiedAt ? formatDate(i.provenance.verifiedAt) : "—"}
                  </td>
                  <td className="py-2.5 text-right">
                    <Link href={itemHref(i)} className="text-xs font-semibold text-[var(--brand)] hover:underline">
                      Sitede gör
                    </Link>
                  </td>
                </tr>
              );
            })}
          </Tablo>
        )}
      </Kart>
    </div>
  );
}
