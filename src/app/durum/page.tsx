import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Database, Server } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { collectStatus } from "@/lib/status";
import { Overline } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Sistem Durumu",
  description: "TavsiyeHane servis durumu: veritabanı bağlantısı, katalog sayıları ve doğrulama bekleyen kayıtlar.",
  path: "/durum",
  noIndex: true,
});

// Sağlık sayfası önbelleklenirse ölçtüğü şeyi değil, geçmişi gösterir.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PANEL = "rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]";

function Satir({ ad, deger, iyi }: { ad: string; deger: string; iyi?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-2.5 last:border-0">
      <dt className="text-sm text-[var(--ink-2)]">{ad}</dt>
      <dd
        className={cn(
          "shrink-0 font-num text-sm font-bold",
          iyi === undefined ? "text-[var(--ink)]" : iyi ? "text-[var(--up)]" : "text-[var(--down)]"
        )}
      >
        {deger}
      </dd>
    </div>
  );
}

const DB_ETIKET = {
  ok: "Bağlantı kuruldu",
  hata: "Hata",
  yapilandirilmadi: "Yapılandırılmadı",
} as const;

export default async function DurumPage() {
  const d = await collectStatus();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Overline>Sistem</Overline>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[32px]">Durum</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Bu sayfa her istekte yeniden ölçülür. Makine tarafı için aynı bilgi{" "}
        <a href="/api/durum" className="font-semibold text-[var(--brand)] underline">
          /api/durum
        </a>{" "}
        adresinde JSON olarak da var; sorun varsa HTTP 503 döner.
      </p>

      <div
        className={cn(
          "mt-6 flex items-start gap-3 rounded-[14px] p-4",
          d.ok ? "bg-[var(--up-soft)] text-[var(--up)]" : "bg-[var(--gold-soft)] text-[var(--gold-ink)]"
        )}
      >
        {d.ok ? (
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
        )}
        <div>
          <p className="font-bold">{d.ok ? "Her şey yolunda" : `${d.eksikler.length} konu dikkat istiyor`}</p>
          {d.eksikler.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-sm">
              {d.eksikler.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className={PANEL}>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Server size={17} className="text-[var(--brand)]" />
            Ortam
          </h2>
          <dl className="mt-3">
            <Satir ad="Ortam" deger={d.ortam} />
            {d.bolge && <Satir ad="Bölge" deger={d.bolge} />}
            {d.surum && <Satir ad="Sürüm" deger={d.surum} />}
            {d.degiskenler.map((v) => (
              <Satir key={v.ad} ad={v.etiket} deger={v.tanimli ? "tanımlı" : "yok"} iyi={v.tanimli} />
            ))}
          </dl>
        </section>

        <section className={PANEL}>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Database size={17} className="text-[var(--brand)]" />
            Veri
          </h2>
          <dl className="mt-3">
            <Satir ad="Veri kaynağı" deger={d.veriKaynagi === "supabase" ? "Supabase" : "yerleşik"} />
            <Satir
              ad="Veritabanı"
              deger={DB_ETIKET[d.veritabani.baglanti]}
              iyi={d.veritabani.baglanti === "yapilandirilmadi" ? undefined : d.veritabani.baglanti === "ok"}
            />
            {d.veritabani.sureMs !== null && (
              <Satir ad="Yanıt süresi" deger={`${d.veritabani.sureMs} ms`} iyi={d.veritabani.sureMs < 800} />
            )}
            <Satir ad="Yayındaki kategori" deger={String(d.katalog.kategori)} />
            <Satir ad="Hazırlanan kategori" deger={String(d.katalog.hazirlanan)} />
            <Satir ad="Toplam kayıt" deger={String(d.katalog.kayit)} />
            <Satir ad="Gerçek katalog" deger={String(d.katalog.gercekKayit)} />
          </dl>
        </section>
      </div>

      {d.bekleyenler.length > 0 && (
        <section className={`mt-4 ${PANEL}`}>
          <h2 className="text-base font-bold">Doğrulama bekleyen kayıtlar</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tazelik eşiğini geçmiş kayıtlar; en eskisi başta. Fiyat ve saat bilgisi en hızlı eskiyen alanlardır.
          </p>
          <ul className="mt-3 divide-y divide-[var(--line)] text-sm">
            {d.bekleyenler.map((i) => (
              <li key={i.slug} className="flex items-baseline justify-between gap-4 py-2">
                <span className="text-[var(--ink-2)]">{i.title}</span>
                <span className="shrink-0 font-num text-[var(--down)]">{i.gun} gün</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
