import { Check, Mail, Phone } from "lucide-react";
import { getBundle } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { Baslik, Bos, Dugme, Kart } from "@/components/admin/ui";
import { updateQuoteStatusAction } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Talep {
  id: string;
  itemId: string;
  name: string;
  contact: string;
  message: string;
  status: "yeni" | "iletildi" | "kapandi";
  createdAt: string;
}

const DURUM_ETIKET: Record<Talep["status"], string> = {
  yeni: "Yeni",
  iletildi: "İletildi",
  kapandi: "Kapandı",
};

export default async function TekliflerPage() {
  const bundle = await getBundle();
  const yapilandirildi = isSupabaseConfigured();

  let talepler: Talep[] = [];
  let tabloYok = false;

  if (yapilandirildi) {
    const supabase = await createSupabaseServer();
    const { data, error } = await (supabase as any)
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) tabloYok = true;
    talepler = (data ?? []).map((q: any) => ({
      id: q.id,
      itemId: q.item_id,
      name: q.name,
      contact: q.contact,
      message: q.message,
      status: q.status,
      createdAt: q.created_at,
    }));
  }

  const baslik = new Map(bundle.items.map((i) => [i.id, i.title]));
  const yeni = talepler.filter((t) => t.status === "yeni");
  const digerleri = talepler.filter((t) => t.status !== "yeni");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Teklif talepleri</h1>

      {tabloYok && (
        <Kart>
          <Baslik aciklama="Formdan gelen talepler kaydedilemiyor; kullanıcıya da bu söyleniyor, başarı ekranı gösterilmiyor.">
            Tablo bulunamadı
          </Baslik>
          <p className="text-sm text-[var(--ink-2)]">
            <code className="rounded bg-[var(--mist)] px-1.5 py-0.5 text-xs">
              supabase/migrations/0009_quotes.sql
            </code>{" "}
            dosyasını Supabase SQL Editor&apos;da çalıştırın.
          </p>
        </Kart>
      )}

      <Kart>
        <Baslik aciklama="Talep siteye kaydedilir; işletmeye ulaştırmayı şimdilik siz yapıyorsunuz. Otomatik e-posta yok, bu yüzden 'iletildi' damgasını da siz vuruyorsunuz.">
          Bekleyen — {yeni.length}
        </Baslik>
        {yeni.length === 0 ? (
          <Bos>{yapilandirildi ? "Bekleyen teklif talebi yok." : "Demo modunda talep alınmaz."}</Bos>
        ) : (
          <ul className="space-y-3">
            {yeni.map((t) => (
              <li key={t.id} className="rounded-xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--brand)]">
                    {t.contact.includes("@") ? <Mail size={13} /> : <Phone size={13} />}
                    {t.contact}
                  </span>
                  <span className="text-[var(--muted-2)]">→ {baslik.get(t.itemId) ?? t.itemId}</span>
                  <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(t.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{t.message}</p>
                <div className="mt-3 flex gap-2">
                  <form action={updateQuoteStatusAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="iletildi" />
                    <button className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--up)] px-3 py-2 text-xs font-bold text-white hover:opacity-90">
                      <Check size={13} /> İşletmeye ilettim
                    </button>
                  </form>
                  <form action={updateQuoteStatusAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="kapandi" />
                    <Dugme tur="tehlike" type="submit">
                      Kapat
                    </Dugme>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Kart>

      <Kart>
        <Baslik aciklama="İletilmiş ve kapatılmış talepler.">Geçmiş — {digerleri.length}</Baslik>
        {digerleri.length === 0 ? (
          <Bos>Henüz kapatılmış talep yok.</Bos>
        ) : (
          <ul className="divide-y divide-[var(--line)] text-sm">
            {digerleri.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="font-semibold">{t.name}</span>
                <span className="text-[var(--muted-2)]">{baslik.get(t.itemId) ?? t.itemId}</span>
                <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                  {DURUM_ETIKET[t.status]}
                </span>
                <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(t.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Kart>
    </div>
  );
}
