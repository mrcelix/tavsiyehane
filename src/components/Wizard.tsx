import Link from "next/link";
import { ArrowRight, Check, MapPin, RotateCcw, Sparkles, X } from "lucide-react";
import { CategoryIcon } from "@/lib/category-icons";
import { activeStep, wizardHref, wizardMatches, wizardProgress, wizardSteps, type WizardAnswers } from "@/lib/wizard";
import type { DataBundle } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./ui/Button";
import { ItemGrid } from "./ItemGrid";

/**
 * TAVSİYE SİHİRBAZI
 *
 * Sunucu bileşeni: durumun tamamı URL'de, her adım gerçek veriyle hesaplanıyor
 * (bkz. lib/wizard.ts). İstemci state'i yok, dolayısıyla katalog da tarayıcıya
 * inmiyor.
 *
 * Eski sihirbazdan farkları:
 *  - Her seçeneğin yanında kaç sonuç bırakacağı yazıyor; sıfır bırakan seçenek
 *    hiç gösterilmiyor. Çıkmaz sokak yok.
 *  - Bütçe serbest sayı değil, kohortun gerçek fiyatlarından üretilmiş aralık.
 *  - Kategoriye özel adımlar var (telefonda RAM, otelde konsept) — elle
 *    tanımlanmadı, veriden çıkıyor.
 *  - Her an "sonuçları gör" denebiliyor; sihirbazı bitirmek zorunlu değil.
 *  - Verilen cevaplar üstte rozet olarak duruyor, tek tıkla değiştirilebiliyor.
 *  - Sonuçların ilk üçü sihirbazın içinde canlı önizleniyor.
 */

const OPTION =
  "flex w-full items-center gap-3 rounded-xl border-2 border-[var(--line)] bg-[var(--paper)] p-3.5 text-left transition-all hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]";

export function Wizard({ bundle, answers }: { bundle: DataBundle; answers: WizardAnswers }) {
  const steps = wizardSteps(bundle, answers);
  const step = activeStep(steps);
  const { done, total } = wizardProgress(steps);
  const matches = wizardMatches(bundle, answers);
  const verilmisCevaplar = steps.filter((s) => s.answered);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[16px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        {/* İlerleme + canlı sonuç sayısı. Sayı her adımda görünür: kullanıcı
            daralttıkça neyin olduğunu görmezse kör ilerler. */}
        <div className="mb-5">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            {/* Tip seçilmeden kaç adım olacağı bilinmiyor (adımlar kohorttan
                çıkıyor); "1 / 1" yazmak yerine toplamı hiç göstermiyoruz. */}
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Adım <span className="font-num">{Math.min(done + 1, total)}</span>
              {total > 1 && (
                <>
                  {" / "}
                  <span className="font-num">{total}</span>
                </>
              )}
            </span>
            <span className="text-[13px] text-[var(--muted)]">
              <span className="font-num font-bold text-[var(--ink)]">{matches.length}</span> tavsiye eşleşiyor
            </span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((s) => (
              <div
                key={s.key}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  s.done ? "bg-[var(--brand)]" : s.key === step?.key ? "bg-[var(--brand)]/40" : "bg-[var(--mist-2)]"
                )}
              />
            ))}
          </div>
        </div>

        {/* Verilen cevaplar — tıklayınca o adım yeniden açılır */}
        {verilmisCevaplar.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {verilmisCevaplar.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft)] py-1 pl-2.5 pr-1 text-[12px] font-bold text-[var(--brand-ink)]"
              >
                {s.answered}
                {s.resetHref && (
                  <Link
                    href={s.resetHref}
                    aria-label={`${s.title} cevabını kaldır`}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[var(--brand)]/15"
                  >
                    <X size={12} />
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {step ? (
          <div>
            <h2 className="text-lg font-bold tracking-tight">{step.title}</h2>
            {step.hint && <p className="mt-1 text-[13px] text-[var(--muted)]">{step.hint}</p>}

            <div className="mt-4 space-y-2">
              {step.options.map((o) => (
                <Link
                  key={`${step.key}-${o.label}`}
                  href={o.href}
                  className={cn(
                    OPTION,
                    o.selected && "border-[var(--brand)] bg-[var(--brand-soft)]"
                  )}
                >
                  {step.key === "kategori" && o.iconSlug ? (
                    <CategoryIcon slug={o.iconSlug} size={20} className="shrink-0 text-[var(--brand)]" />
                  ) : step.key === "sehir" ? (
                    <MapPin size={18} className="shrink-0 text-[var(--brand)]" />
                  ) : null}

                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[var(--ink)]">{o.label}</span>
                    {o.hint && <span className="mt-0.5 block text-sm text-[var(--muted)]">{o.hint}</span>}
                  </span>

                  {/* Seçeneğin bırakacağı sonuç sayısı — "8 sonuç" görmek,
                      seçtikten sonra boş ekran görmekten iyidir. İşaretli
                      seçenekte gösterilmiyor: oradaki sayı "kaldırırsan bu kadar
                      kalır" anlamına gelir ve tikin yanında yanlış okunur. */}
                  {!o.selected && (
                    <span className="shrink-0 font-num text-[12px] font-semibold text-[var(--muted-2)]">{o.count}</span>
                  )}
                  {o.selected ? (
                    <Check size={16} className="shrink-0 text-[var(--brand)]" />
                  ) : (
                    <ArrowRight size={15} className="shrink-0 text-[var(--muted-2)]" />
                  )}
                </Link>
              ))}
            </div>

            {step.skipHref && (
              <Link
                href={step.skipHref}
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
              >
                {step.multi ? "Devam et" : "Fark etmez, atla"}
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold tracking-tight">Hazır</h2>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Tüm sorular cevaplandı. <span className="font-num font-bold text-[var(--ink)]">{matches.length}</span>{" "}
              tavsiye seçimlerine uyuyor.
            </p>
          </div>
        )}

        {/* Sonuçlara her an geçilebilir: sihirbazı sonuna kadar götürmek
            zorunluluk değil, kolaylık. */}
        {answers.type && (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <ButtonLink
              href={wizardHref(answers, {}, { sonuc: true })}
              variant="gold"
              size="lg"
              shine
              className="w-full font-bold"
            >
              <Sparkles size={16} />
              {matches.length} tavsiyeyi gör
            </ButtonLink>
          </div>
        )}
      </div>

      {/* Canlı önizleme: cevap verdikçe sonucun nasıl değiştiği görünür. */}
      {answers.type && matches.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Şu an başta olanlar</p>
            {steps.length > 0 && (
              <Link
                href="/ara?sihirbaz=1"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
              >
                <RotateCcw size={12} /> Baştan başla
              </Link>
            )}
          </div>
          <ItemGrid items={matches.slice(0, 3)} />
        </div>
      )}
    </div>
  );
}
