import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { Alan, Baslik, Bos, Dugme, GIRDI, Kart, Tablo } from "@/components/admin/ui";
import { Onayli } from "@/components/admin/Onayli";
import { yaziKaydetAction, yaziSilAction } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  searchParams: Promise<{ duzenle?: string }>;
}

export default async function BlogPanelPage({ searchParams }: Props) {
  const sp = await searchParams;
  let yazilar: any[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data } = await (supabase as any)
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });
    yazilar = data ?? [];
  }

  const duzenlenen = sp.duzenle ? yazilar.find((y) => y.id === sp.duzenle) : undefined;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Blog</h1>

      <Kart>
        <Baslik aciklama="Taslaklar sitede görünmez; yalnızca admin okuyabilir (RLS). Yayın tarihi ilk yayımlamada yazılır, sonraki düzenlemeler yazıyı listenin başına taşımaz.">
          {duzenlenen ? "Yazıyı düzenle" : "Yeni yazı"}
        </Baslik>
        <form action={yaziKaydetAction} className="grid gap-4 sm:grid-cols-2">
          {duzenlenen && <input type="hidden" name="id" value={duzenlenen.id} />}
          <Alan etiket="Başlık *" genis>
            <input name="title" required defaultValue={duzenlenen?.title} className={GIRDI} />
          </Alan>
          <Alan etiket="Slug" ipucu="Boş bırakılırsa başlıktan üretilir.">
            <input name="slug" defaultValue={duzenlenen?.slug} className={GIRDI} />
          </Alan>
          <Alan etiket="Durum">
            <select name="status" defaultValue={duzenlenen?.status ?? "taslak"} className={GIRDI}>
              <option value="taslak">Taslak</option>
              <option value="yayinda">Yayında</option>
            </select>
          </Alan>
          <Alan etiket="Özet" genis ipucu="Liste sayfasında ve arama sonuçlarında görünür.">
            <textarea name="excerpt" rows={2} defaultValue={duzenlenen?.excerpt ?? ""} className={GIRDI} />
          </Alan>
          <Alan etiket="İçerik" genis ipucu="Düz metin; paragraflar boş satırla ayrılır.">
            <textarea name="body" rows={12} defaultValue={duzenlenen?.body ?? ""} className={GIRDI} />
          </Alan>
          <Alan etiket="Kapak görseli" genis ipucu="Künye zorunlu: adres verirseniz alt metin, telif ve lisans da girilmeli.">
            <input name="cover_url" defaultValue={duzenlenen?.cover_url ?? ""} className={GIRDI} />
          </Alan>
          <Alan etiket="Alt metin">
            <input name="cover_alt" defaultValue={duzenlenen?.cover_alt ?? ""} className={GIRDI} />
          </Alan>
          <Alan etiket="Telif sahibi">
            <input name="cover_credit" defaultValue={duzenlenen?.cover_credit ?? ""} className={GIRDI} />
          </Alan>
          <Alan etiket="Lisans">
            <input name="cover_license" defaultValue={duzenlenen?.cover_license ?? ""} className={GIRDI} />
          </Alan>
          <div className="sm:col-span-2">
            <Dugme type="submit">{duzenlenen ? "Değişiklikleri kaydet" : "Yazıyı oluştur"}</Dugme>
          </div>
        </form>
      </Kart>

      <Kart>
        <Baslik>Yazılar — {yazilar.length}</Baslik>
        {yazilar.length === 0 ? (
          <Bos>{isSupabaseConfigured() ? "Henüz yazı yok." : "Demo modunda blog boştur."}</Bos>
        ) : (
          <Tablo basliklar={["Başlık", "Durum", "Yayın", "Güncelleme", ""]}>
            {yazilar.map((y) => (
              <tr key={y.id}>
                <td className="max-w-72 py-2.5 pr-3">
                  <a href={`/panel/blog?duzenle=${y.id}`} className="font-medium hover:text-[var(--brand)]">
                    {y.title}
                  </a>
                  <span className="ml-1.5 text-xs text-[var(--muted-2)]">{y.slug}</span>
                </td>
                <td className="py-2.5 pr-3 text-xs">
                  {y.status === "yayinda" ? (
                    <span className="rounded bg-[var(--up-soft)] px-1.5 py-0.5 font-semibold text-[var(--up)]">yayında</span>
                  ) : (
                    <span className="rounded bg-[var(--mist-2)] px-1.5 py-0.5 font-semibold text-[var(--muted)]">taslak</span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-xs text-[var(--muted-2)]">
                  {y.published_at ? formatDate(y.published_at) : "—"}
                </td>
                <td className="py-2.5 pr-3 text-xs text-[var(--muted-2)]">{formatDate(y.updated_at)}</td>
                <td className="py-2.5 text-right">
                  <Onayli soru={`"${y.title}" silinecek. Emin misiniz?`} action={yaziSilAction}>
                    <input type="hidden" name="id" value={y.id} />
                    <Dugme tur="tehlike" type="submit">
                      Sil
                    </Dugme>
                  </Onayli>
                </td>
              </tr>
            ))}
          </Tablo>
        )}
      </Kart>
    </div>
  );
}
