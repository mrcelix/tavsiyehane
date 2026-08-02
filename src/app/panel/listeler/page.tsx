import Link from "next/link";
import { getBundle } from "@/lib/data";
import { LIVING_LISTS } from "@/lib/lists";
import { Baslik, Bos, Kart, Tablo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ListelerPage() {
  const bundle = await getBundle();
  const tanim = new Map(LIVING_LISTS.map((l) => [l.slug, l]));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Listeler</h1>

      <Kart>
        <Baslik aciklama="Listeler elle doldurulmaz, sinyallerden üretilir. Bir kaydı listeye eklemenin yolu, listenin koşulunu sağlamasıdır — elle eklenen liste, ilk veri değişiminde yalan söyler.">
          Yaşayan listeler
        </Baslik>
        {bundle.lists.length === 0 ? (
          <Bos>Koşulları sağlayan kayıt olmadığı için hiçbir liste üretilmedi.</Bos>
        ) : (
          <Tablo basliklar={["Liste", "Koşul", "Kayıt", ""]}>
            {bundle.lists.map((l) => (
              <tr key={l.slug}>
                <td className="py-2.5 pr-3 font-medium">{l.title}</td>
                <td className="max-w-96 py-2.5 pr-3 text-xs leading-relaxed text-[var(--muted)]">
                  {tanim.get(l.slug)?.description ?? l.description}
                </td>
                <td className="py-2.5 pr-3 font-num tabular-nums">{l.itemSlugs.length}</td>
                <td className="py-2.5 text-right">
                  <Link href={`/liste/${l.slug}`} className="text-xs font-semibold text-[var(--brand)] hover:underline">
                    Sitede gör
                  </Link>
                </td>
              </tr>
            ))}
          </Tablo>
        )}
      </Kart>

      <Kart>
        <Baslik aciklama="Bir listeye girmek için kaydın sağlaması gereken koşullar. Koşullar kodda tanımlıdır (lib/lists.ts) ve metodoloji sayfasında da yayımlanır.">
          Liste koşulları
        </Baslik>
        <dl className="space-y-3 text-sm">
          {LIVING_LISTS.map((l) => (
            <div key={l.slug}>
              <dt className="font-semibold">{l.title}</dt>
              <dd className="text-[var(--muted)]">{l.description}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-xl bg-[var(--mist)] p-3 text-xs leading-relaxed text-[var(--muted)]">
          Bir kaydı belirli bir listede görmek istiyorsanız, o listenin koşulunu sağlayan veriyi düzeltin: rozet
          koşulları, doğrulama tarihi ve puan dayanağı listeleri belirler. Panelden liste içeriğine doğrudan
          müdahale eden bir düğme <strong>bilerek</strong> yok.
        </p>
      </Kart>
    </div>
  );
}
