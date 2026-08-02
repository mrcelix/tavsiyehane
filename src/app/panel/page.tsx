import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Database } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getBundle } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { staleItems } from "@/lib/freshness";
import { liveCategories } from "@/lib/categories";
import { Baslik, Dugme, Kart } from "@/components/admin/ui";
import { icerigiIceAktarAction } from "./icerik/actions";

export const metadata: Metadata = pageMetadata({
  title: "Yönetim Paneli",
  description: "İçerik, kategori, üye ve istatistik yönetimi.",
  path: "/panel",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function PanelPage() {
  const bundle = await getBundle();
  const yapilandirildi = isSupabaseConfigured();

  let bekleyenYorum = 0;
  let dbKayit = 0;
  if (yapilandirildi) {
    const supabase = await createSupabaseServer();
    if (supabase) {
      const [{ count: yorum }, { count: kayit }] = await Promise.all([
        (supabase as any).from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
        (supabase as any).from("items").select("id", { count: "exact", head: true }),
      ]);
      bekleyenYorum = yorum ?? 0;
      dbKayit = kayit ?? 0;
    }
  }

  const bayat = staleItems(bundle.items.filter((i) => i.provenance.kind === "editor"));
  const veritabaniBos = yapilandirildi && dbKayit === 0;

  const kutular = [
    { etiket: "Toplam kayıt", deger: bundle.items.length, href: "/panel/icerik" },
    { etiket: "Yayındaki kategori", deger: liveCategories(bundle.categories).length, href: "/panel/kategoriler" },
    { etiket: "Bekleyen yorum", deger: yapilandirildi ? bekleyenYorum : "—", href: "/panel/yorumlar" },
    { etiket: "Doğrulama bekleyen", deger: bayat.length, href: "/panel/icerik" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Özet</h1>

      {veritabaniBos && (
        <Kart className="border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[var(--gold-soft)]">
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--gold-ink)]">
            <AlertTriangle size={18} /> Panelden içerik yönetmeden önce bir adım
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--gold-ink)]">
            Veritabanındaki <strong>items</strong> tablosu boş. Site şu an koddaki yerleşik içerikten besleniyor
            ({bundle.items.length} kayıt). Panelden <strong>tek bir kayıt</strong> eklerseniz tablo dolu sayılır ve site
            yalnızca o kaydı gösterir — diğer {bundle.items.length} kayıt görünmez olur.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--gold-ink)]">
            Aşağıdaki düğme yerleşik içeriği veritabanına taşır. Çakışan kayıt güncellenir, hiçbir şey silinmez.
            Örnek verinin sentetik oyları taşınmaz — uydurma oy veritabanına yazılırsa gerçek oylardan ayırt
            edilemez hale gelir.
          </p>
          <form action={icerigiIceAktarAction} className="mt-4">
            <Dugme type="submit">
              <Database size={13} className="mr-1.5 inline" />
              Yerleşik içeriği veritabanına aktar
            </Dugme>
          </form>
        </Kart>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {kutular.map((k) => (
          <Link
            key={k.etiket}
            href={k.href}
            className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--brand)]"
          >
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted-2)]">{k.etiket}</p>
            <p className="mt-1 font-num text-2xl font-extrabold">{k.deger}</p>
          </Link>
        ))}
      </div>

      {bayat.length > 0 && (
        <Kart>
          <Baslik aciklama="Tazelik eşiğini geçmiş kayıtlar; en eskisi başta. Fiyat en hızlı eskiyen alandır.">
            Doğrulama bekleyenler
          </Baslik>
          <ul className="divide-y divide-[var(--line)] text-sm">
            {bayat.slice(0, 10).map((i) => (
              <li key={i.slug} className="flex items-center justify-between gap-4 py-2">
                <Link href={`/panel/icerik/${i.slug}`} className="hover:text-[var(--brand)]">
                  {i.title}
                </Link>
                <span className="shrink-0 text-xs text-[var(--muted-2)]">{i.categorySlug}</span>
              </li>
            ))}
          </ul>
        </Kart>
      )}

      <Kart>
        <Baslik aciklama="Sistem durumu ayrı bir sayfada; ortam değişkenleri ve veritabanı yanıt süresi orada.">
          Bağlantılar
        </Baslik>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/durum" className="rounded-[10px] bg-[var(--mist-2)] px-3 py-2 font-semibold text-[var(--ink-2)] hover:bg-[var(--line)]">
            Sistem durumu
          </Link>
          <Link href="/metodoloji" className="rounded-[10px] bg-[var(--mist-2)] px-3 py-2 font-semibold text-[var(--ink-2)] hover:bg-[var(--line)]">
            Puanlama metodolojisi
          </Link>
        </div>
      </Kart>
    </div>
  );
}
