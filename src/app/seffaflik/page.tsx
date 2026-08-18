import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FlaskConical } from "lucide-react";
import { getBundle } from "@/lib/data";
import { karneUret, yuzde } from "@/lib/transparency";
import { pageMetadata } from "@/lib/seo";
import { TYPE_LABELS } from "@/lib/types";
import { CARD_BASE } from "@/components/ui/Card";

export const metadata: Metadata = pageMetadata({
  title: "Şeffaflık Karnesi",
  description:
    "Kaç kayıt gerçek, kaçının kaynağı var, kaçı doğrulama bekliyor, puanlar neye dayanıyor — kendi verimizle açık karne.",
  path: "/seffaflik",
});

/** Büyük sayı + altında ne olduğu. */
function Olcu({ sayi, etiket, alt, vurgu }: { sayi: string; etiket: string; alt?: string; vurgu?: "iyi" | "uyari" }) {
  const renk =
    vurgu === "iyi" ? "text-[var(--up)]" : vurgu === "uyari" ? "text-[var(--down)]" : "text-[var(--ink)]";
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4">
      <p className={`font-num text-3xl font-extrabold ${renk}`}>{sayi}</p>
      <p className="mt-1 text-[13px] font-semibold text-[var(--ink-2)]">{etiket}</p>
      {alt && <p className="mt-0.5 text-[12px] leading-snug text-[var(--muted)]">{alt}</p>}
    </div>
  );
}

export default async function SeffaflikPage() {
  const bundle = await getBundle();
  const k = karneUret(bundle);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">Şeffaflık</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[30px]">Şeffaflık Karnesi</h1>
      <p className="mt-2 max-w-3xl text-[var(--muted)]">
        Bir tavsiye sitesine güvenip güvenmeyeceğinize, onun kendi verisine bakarak karar verebilmelisiniz. Aşağıdaki
        sayılar canlı veritabanından hesaplanıyor ve <strong className="text-[var(--ink-2)]">güzelleştirilmiyor</strong>
        {" "}— zayıf olduğumuz yerler de burada.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Olcu sayi={String(k.toplam)} etiket="Toplam kayıt" alt={`${k.yayindakiKategori} yayındaki kategoride`} />
        <Olcu
          sayi={`%${yuzde(k.gercek, k.toplam)}`}
          etiket="Gerçek kayıt"
          alt={`${k.gercek} kayıt gerçek, ${k.ornek} tanesi örnek veri`}
          vurgu={yuzde(k.gercek, k.toplam) >= 50 ? "iyi" : "uyari"}
        />
        <Olcu
          sayi={`%${yuzde(k.kaynakli, k.toplam)}`}
          etiket="Kaynağı belirtilmiş"
          alt={`${k.kaynakli} kaydın künyesinde en az bir kaynak var`}
          vurgu={yuzde(k.kaynakli, k.toplam) >= 50 ? "iyi" : "uyari"}
        />
        <Olcu
          sayi={String(k.bayat)}
          etiket="Doğrulama bekleyen"
          alt={k.eskiyor > 0 ? `${k.eskiyor} kayıt da eskiyor` : "Eskiyen kayıt yok"}
          vurgu={k.bayat === 0 ? "iyi" : "uyari"}
        />
      </div>

      {/* Örnek veri uyarısı — oran yüksekse gizlemek yerine büyütüyoruz. */}
      {k.ornek > 0 && (
        <div className={`${CARD_BASE} mt-4 border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[var(--gold-soft)] p-4`}>
          <p className="flex items-start gap-2 text-sm text-[var(--gold-ink)]">
            <FlaskConical size={16} className="mt-0.5 shrink-0" />
            <span>
              <strong>{k.ornek} kayıt örnek veridir.</strong> Bunlar sitenin nasıl çalıştığını göstermek için duran
              kurgusal kayıtlardır: kartta ve detay sayfasında &quot;Örnek veri&quot; rozetiyle işaretlenir, arama
              motoruna verilmez ve sıralı liste şemasına girmez. Gerçek kayıt sayısı arttıkça bu sayı düşecek.
            </span>
          </p>
        </div>
      )}

      <h2 className="mt-8 text-lg font-bold tracking-tight">Puan neye dayanıyor?</h2>
      <p className="mt-1 max-w-3xl text-[13px] text-[var(--muted)]">
        Öncelik sırası <strong className="text-[var(--ink-2)]">topluluk &gt; dış sinyal &gt; editör</strong>. Hangi
        dayanağın kullanıldığı her kayıtta yazar; aşağıdaki dağılım sitenin bugünkü olgunluğunu gösterir.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Olcu sayi={String(k.dayanak.topluluk)} etiket="Topluluk oyuna dayanan" alt={`${k.oy} oy kullanıldı`} />
        <Olcu
          sayi={String(k.dayanak.disSinyal)}
          etiket="Dış sinyale dayanan"
          alt="Arama ilgisi ölçümü girilmiş kayıtlar"
        />
        <Olcu sayi={String(k.dayanak.editor)} etiket="Editör notuna dayanan" alt="Henüz topluluk verisi yok" />
      </div>
      {k.dayanak.topluluk === 0 && (
        <p className="mt-3 flex items-start gap-2 text-[13px] text-[var(--muted)]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--gold-ink)]" />
          Henüz hiçbir kayıt topluluk oyuna dayanmıyor: site yeni ve oy birikmedi. Oy sayısı sıfır gösteriliyor,
          sıfırmış gibi davranılıyor — olmayan veri sıfır değil, yoktur.
        </p>
      )}

      <h2 className="mt-8 text-lg font-bold tracking-tight">Kategori kategori</h2>
      <div className="mt-3 overflow-x-auto rounded-[14px] border border-[var(--line)] bg-[var(--card)]">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3 text-right">Kayıt</th>
              <th className="px-4 py-3 text-right">Gerçek</th>
              <th className="px-4 py-3 text-right">Kaynaklı</th>
              <th className="px-4 py-3 text-right">Görselli</th>
              <th className="px-4 py-3 text-right">Doğrulama bekleyen</th>
              <th className="px-4 py-3 text-right">Yorumlu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {k.kategoriler.map((c) => (
              <tr key={c.slug}>
                <td className="px-4 py-2.5 font-semibold">{c.ad}</td>
                <td className="px-4 py-2.5 text-[var(--muted)]">{TYPE_LABELS[c.type].singular}</td>
                <td className="px-4 py-2.5 text-right font-num tabular-nums">{c.toplam}</td>
                <td className="px-4 py-2.5 text-right font-num tabular-nums">
                  {c.gercek}
                  {c.ornek > 0 && <span className="ml-1 text-[11px] text-[var(--muted-2)]">/{c.toplam}</span>}
                </td>
                <td className="px-4 py-2.5 text-right font-num tabular-nums">{c.kaynakli}</td>
                <td className="px-4 py-2.5 text-right font-num tabular-nums">{c.gorselli}</td>
                <td
                  className={
                    c.bayat > 0
                      ? "px-4 py-2.5 text-right font-num font-bold tabular-nums text-[var(--down)]"
                      : "px-4 py-2.5 text-right font-num tabular-nums text-[var(--muted-2)]"
                  }
                >
                  {c.bayat}
                </td>
                <td className="px-4 py-2.5 text-right font-num tabular-nums">{c.yorumlu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-bold tracking-tight">Bu sayılar ne demek değil</h2>
      <ul className="mt-2 max-w-3xl space-y-2 text-[13px] leading-relaxed text-[var(--muted)]">
        <li className="flex items-start gap-2">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--up)]" />
          <span>
            <strong className="text-[var(--ink-2)]">Kaynaklı olmak doğruluk garantisi değildir.</strong> Kaynağın
            yayımlanması, iddiayı sizin de kontrol edebilmeniz demektir — fazlası değil.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--up)]" />
          <span>
            <strong className="text-[var(--ink-2)]">Doğrulama bekleyen kayıt gizlenmez.</strong> Sitede kalır ama
            fiyatının yanında saat işareti ve detayında uyarı görürsünüz. Bilgiyi saklamak, eski bilgi göstermekten
            kötüdür.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--up)]" />
          <span>
            <strong className="text-[var(--ink-2)]">Sponsorluk puanı değiştirmez.</strong> Görünürlük satılır,
            sıralama satılmaz; sponsorlu içerik turuncu çerçeveyle ayrılır.
          </span>
        </li>
      </ul>

      <p className="mt-6 text-[13px] text-[var(--muted)]">
        Puanların nasıl hesaplandığını{" "}
        <Link href="/metodoloji" className="font-semibold text-[var(--brand)] hover:underline">
          metodoloji sayfasında
        </Link>{" "}
        ağırlıklarıyla birlikte yayımlıyoruz.
      </p>
    </div>
  );
}
