import Link from "next/link";
import { getBundle } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { enCok, sonOlaylar } from "@/lib/stats";
import { Baslik, Bos, Kart, Tablo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ gun?: string }>;
}

const PENCERELER = [7, 30, 90];

export default async function IstatistikPage({ searchParams }: Props) {
  const sp = await searchParams;
  const gun = PENCERELER.includes(Number(sp.gun)) ? Number(sp.gun) : 30;
  const bundle = await getBundle();
  const yapilandirildi = isSupabaseConfigured();

  const olaylar = await sonOlaylar(gun);
  const say = (t: string) => olaylar.filter((o) => o.tur === t).length;
  const enCokAlan = (alan: "item_id" | "yol" | "hedef", tur?: string) => enCok(olaylar, alan, tur);

  const baslik = new Map(bundle.items.map((i) => [i.id, i.title]));

  const kutular = [
    { etiket: "Sayfa görüntülenme", deger: say("goruntuleme") },
    { etiket: "Dış bağlantı tıklaması", deger: say("cikis") },
    { etiket: "Karşılaştırma", deger: say("karsilastirma") },
    { etiket: "Favori", deger: say("favori") },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">İstatistik</h1>
        <div className="flex gap-1.5">
          {PENCERELER.map((p) => (
            <Link
              key={p}
              href={`/panel/istatistik?gun=${p}`}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                p === gun ? "bg-[var(--brand)] text-white" : "bg-[var(--mist-2)] text-[var(--ink-2)]"
              }`}
            >
              {p} gün
            </Link>
          ))}
        </div>
      </div>

      {!yapilandirildi ? (
        <Bos>Demo modunda olay kaydı tutulmaz.</Bos>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {kutular.map((k) => (
              <div key={k.etiket} className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted-2)]">{k.etiket}</p>
                <p className="mt-1 font-num text-2xl font-extrabold">{k.deger.toLocaleString("tr")}</p>
              </div>
            ))}
          </div>

          {olaylar.length === 0 && (
            <Bos>
              Bu aralıkta olay kaydı yok. Ölçüm siteye yeni eklendiyse veri birikmesi için biraz zaman gerekiyor.
            </Bos>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <Kart>
              <Baslik aciklama="Detay sayfası en çok görüntülenen kayıtlar.">En çok görüntülenen kayıtlar</Baslik>
              {enCokAlan("item_id", "goruntuleme").length === 0 ? (
                <Bos>Veri yok.</Bos>
              ) : (
                <Tablo basliklar={["Kayıt", "Görüntülenme"]}>
                  {enCokAlan("item_id", "goruntuleme").map(([id, adet]) => (
                    <tr key={id}>
                      <td className="py-2 pr-3">
                        <Link href={`/panel/icerik/${id}`} className="hover:text-[var(--brand)]">
                          {baslik.get(id) ?? id}
                        </Link>
                      </td>
                      <td className="py-2 font-num tabular-nums">{adet}</td>
                    </tr>
                  ))}
                </Tablo>
              )}
            </Kart>

            <Kart>
              <Baslik aciklama="Ziyaretçinin siteden çıkarken tıkladığı dış adresler — satıcıya giden trafiğin ölçüsü.">
                En çok tıklanan dış bağlantılar
              </Baslik>
              {enCokAlan("hedef", "cikis").length === 0 ? (
                <Bos>Veri yok.</Bos>
              ) : (
                <Tablo basliklar={["Adres", "Tıklama"]}>
                  {enCokAlan("hedef", "cikis").map(([h, adet]) => (
                    <tr key={h}>
                      <td className="max-w-72 truncate py-2 pr-3 text-xs text-[var(--muted)]">{h}</td>
                      <td className="py-2 font-num tabular-nums">{adet}</td>
                    </tr>
                  ))}
                </Tablo>
              )}
            </Kart>

            <Kart className="lg:col-span-2">
              <Baslik aciklama="Tüm sayfa yolları, görüntülenmeye göre.">En çok gezilen sayfalar</Baslik>
              {enCokAlan("yol", "goruntuleme").length === 0 ? (
                <Bos>Veri yok.</Bos>
              ) : (
                <Tablo basliklar={["Yol", "Görüntülenme"]}>
                  {enCokAlan("yol", "goruntuleme").map(([y, adet]) => (
                    <tr key={y}>
                      <td className="py-2 pr-3">
                        <Link href={y} className="text-[var(--muted)] hover:text-[var(--brand)]">
                          {y}
                        </Link>
                      </td>
                      <td className="py-2 font-num tabular-nums">{adet}</td>
                    </tr>
                  ))}
                </Tablo>
              )}
            </Kart>
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--muted-2)]">
            Ölçüm kimlik ve çerez kullanmaz; IP adresi, tarayıcı bilgisi ve kullanıcı kimliği kaydedilmez. Bu yüzden
            &quot;tekil ziyaretçi&quot; sayısı raporlanamaz — ölçülebilen şey ilgi, kişi değil.
          </p>
        </>
      )}
    </div>
  );
}
