import { Check, Mail, Phone, X } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { Baslik, Bos, Dugme, Kart } from "@/components/admin/ui";
import { updateClaimStatusAction } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Basvuru {
  id: string;
  business: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  note: string | null;
  status: "yeni" | "incelemede" | "onaylandi" | "reddedildi";
  createdAt: string;
}

const DURUM: Record<Basvuru["status"], string> = {
  yeni: "Yeni",
  incelemede: "İncelemede",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export default async function IsletmelerPage() {
  const yapilandirildi = isSupabaseConfigured();
  let basvurular: Basvuru[] = [];
  let tabloYok = false;

  if (yapilandirildi) {
    const supabase = await createSupabaseServer();
    const { data, error } = await (supabase as any)
      .from("business_claims")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) tabloYok = true;
    basvurular = (data ?? []).map((b: any) => ({
      id: b.id,
      business: b.business,
      contactName: b.contact_name,
      email: b.email,
      phone: b.phone,
      category: b.category,
      note: b.note,
      status: b.status,
      createdAt: b.created_at,
    }));
  }

  const bekleyen = basvurular.filter((b) => b.status === "yeni" || b.status === "incelemede");
  const kapanan = basvurular.filter((b) => b.status === "onaylandi" || b.status === "reddedildi");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">İşletme başvuruları</h1>

      {tabloYok && (
        <Kart>
          <Baslik aciklama="Formdan gelen başvurular kaydedilemiyor; kullanıcıya da bu söyleniyor, başarı ekranı gösterilmiyor.">
            Tablo bulunamadı
          </Baslik>
          <p className="text-sm text-[var(--ink-2)]">
            <code className="rounded bg-[var(--mist)] px-1.5 py-0.5 text-xs">
              supabase/migrations/0010_business_claims.sql
            </code>{" "}
            dosyasını Supabase SQL Editor&apos;da çalıştırın.
          </p>
        </Kart>
      )}

      <Kart>
        <Baslik aciklama="Belge doğrulaması ve iletişim insan işi; otomatik bir akış yok. Damgayı siz vuruyorsunuz.">
          Bekleyen — {bekleyen.length}
        </Baslik>
        {bekleyen.length === 0 ? (
          <Bos>{yapilandirildi ? "Bekleyen başvuru yok." : "Demo modunda başvuru alınmaz."}</Bos>
        ) : (
          <ul className="space-y-3">
            {bekleyen.map((b) => (
              <li key={b.id} className="rounded-xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{b.business}</span>
                  <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                    {b.category}
                  </span>
                  {b.status === "incelemede" && (
                    <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--gold-ink)]">
                      İncelemede
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(b.createdAt)}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[13px] text-[var(--ink-2)]">
                  <span>{b.contactName}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--brand)]">
                    <Mail size={13} /> {b.email}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--brand)]">
                    <Phone size={13} /> {b.phone}
                  </span>
                </div>
                {b.note && <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{b.note}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === "yeni" && (
                    <form action={updateClaimStatusAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="incelemede" />
                      <Dugme type="submit">İncelemeye al</Dugme>
                    </form>
                  )}
                  <form action={updateClaimStatusAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="onaylandi" />
                    <button className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--up)] px-3 py-2 text-xs font-bold text-white hover:opacity-90">
                      <Check size={13} /> Onayla
                    </button>
                  </form>
                  <form action={updateClaimStatusAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="reddedildi" />
                    <Dugme tur="tehlike" type="submit">
                      <X size={13} className="mr-1 inline" /> Reddet
                    </Dugme>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Kart>

      <Kart>
        <Baslik aciklama="Onaylanmış ve reddedilmiş başvurular.">Geçmiş — {kapanan.length}</Baslik>
        {kapanan.length === 0 ? (
          <Bos>Henüz kapatılmış başvuru yok.</Bos>
        ) : (
          <ul className="divide-y divide-[var(--line)] text-sm">
            {kapanan.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="font-semibold">{b.business}</span>
                <span className="text-[var(--muted-2)]">{b.contactName}</span>
                <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                  {DURUM[b.status]}
                </span>
                <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(b.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Kart>
    </div>
  );
}
