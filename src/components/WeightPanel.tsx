import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { AGIRLIK_ONEK, type Agirliklar } from "@/lib/personal-score";
import { cn } from "@/lib/cn";

export interface AgirlikKriteri {
  key: string;
  label: string;
  hint: string;
  /** Yayımlanmış ağırlık, yüzde */
  varsayilan: number;
}

/**
 * "Senin Puanın" ağırlık paneli.
 *
 * DÜZ BİR GET FORMU — istemci bileşeni değil. Sebebi dayanıklılık: sıralamayı
 * sunucu hesaplıyor, form gönderilince adres değişiyor, sayfa yeniden
 * çiziliyor. JavaScript çalışmasa da çalışır, geri tuşuyla çalışır, adres
 * paylaşılabilir. Panelin içerik filtresinde de aynı desen kullanılıyor.
 *
 * Kaydırıcı bırakılınca formu kendiliğinden gönderen küçük bir betik var
 * (aşamalı iyileştirme): JS varsa canlı hissettirir, yoksa "Uygula" düğmesi
 * işi görür. İstemci tarafında ikinci bir puanlama kopyası YOK — o kopya bir
 * gün resmî puandan sapardı.
 *
 * Diğer filtreler gizli alanlarla korunuyor: ağırlık değiştirmek, seçili
 * şehri ya da markayı düşürmemeli.
 */
export function WeightPanel({
  kriterler,
  aktif,
  digerParametreler,
  temizHref,
}: {
  kriterler: AgirlikKriteri[];
  aktif: Agirliklar | null;
  /** Korunacak diğer sorgu parametreleri (şehir, marka, sıralama…) */
  digerParametreler: [string, string][];
  /** Ağırlıksız hâline dönen adres */
  temizHref: string;
}) {
  const acik = Boolean(aktif);
  const deger = (k: AgirlikKriteri) => aktif?.[k.key] ?? k.varsayilan;
  const toplam = kriterler.reduce((a, k) => a + deger(k), 0);

  return (
    <form method="get" className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)]">
      {digerParametreler.map(([ad, v], i) => (
        <input key={`${ad}-${i}`} type="hidden" name={ad} value={v} />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <SlidersHorizontal size={15} className="text-[var(--brand)]" />
          Senin puanın
          {acik && (
            <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--brand-ink)]">
              etkin
            </span>
          )}
        </p>
        {acik && (
          <a
            href={temizHref}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)] max-sm:min-h-11"
          >
            <RotateCcw size={12} /> Yayımlanmış ağırlıklara dön
          </a>
        )}
      </div>

      <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
        Aşağıdakiler sitenin <strong className="text-[var(--ink-2)]">yayımladığı</strong> ağırlıklar. Değiştirin,
        sıralama sizin önceliğinize göre yeniden hesaplansın —{" "}
        <strong className="text-[var(--ink-2)]">resmî tavsiye puanı değişmez</strong>, kartta ikisi yan yana görünür.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kriterler.map((k) => (
          <label key={k.key} className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-semibold text-[var(--ink-2)]">{k.label}</span>
              <output className="font-num text-[12px] font-bold text-[var(--brand)]">%{deger(k)}</output>
            </span>
            <input
              type="range"
              name={`${AGIRLIK_ONEK}${k.key}`}
              min={0}
              max={100}
              step={5}
              defaultValue={deger(k)}
              aria-label={k.label}
              className="mt-1 w-full accent-[var(--brand)]"
            />
            <span className="mt-0.5 block text-[11px] leading-snug text-[var(--muted-2)]">{k.hint}</span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-[10px] bg-[var(--brand)] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[var(--brand-ink)] max-sm:min-h-11"
        >
          Sıralamayı yeniden hesapla
        </button>
        {/* Toplamın 100 olması gerekmiyor: puan, verilen ağırlıkların kendi
            toplamına bölünüyor. Yine de kullanıcı oranı görebilsin. */}
        <span className={cn("text-[11px]", toplam === 0 ? "text-[var(--down)]" : "text-[var(--muted-2)]")}>
          {toplam === 0
            ? "Tüm ağırlıklar sıfır — sıralama yayımlanmış puana göre kalır."
            : `Ağırlık toplamı %${toplam}. Toplamın 100 olması gerekmez; puan kendi toplamına oranlanır.`}
        </span>
      </div>

      {/* Aşamalı iyileştirme: kaydırıcı bırakılınca form kendiliğinden gönderilir
          ve anlık değer yazılır. JS yoksa yukarıdaki düğme aynı işi yapar. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var f=document.currentScript.closest('form');if(!f)return;
f.querySelectorAll('input[type=range]').forEach(function(r){
var o=r.parentElement.querySelector('output');
r.addEventListener('input',function(){if(o)o.textContent='%'+r.value;});
r.addEventListener('change',function(){f.requestSubmit();});});})();`,
        }}
      />
    </form>
  );
}
