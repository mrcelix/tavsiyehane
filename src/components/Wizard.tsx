import Link from "next/link";
import { ArrowRight, Check, MapPin, RotateCcw, Sparkles } from "lucide-react";
import { CategoryIcon } from "@/lib/category-icons";
import { itemHref } from "@/lib/routes";
import { activeStep, wizardHref, wizardMatches, wizardProgress, wizardSteps, type WizardAnswers } from "@/lib/wizard";
import type { DataBundle } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./ui/Button";
import { RankBadge } from "./RankBadge";

/**
 * TAVSİYE SİHİRBAZI
 *
 * Sunucu bileşeni: durumun tamamı URL'de, her adım gerçek veriyle hesaplanıyor
 * (bkz. lib/wizard.ts). İstemci state'i yok, dolayısıyla katalog da tarayıcıya
 * inmiyor.
 *
 * DÜZEN — üç sütun, çünkü sihirbazın üç ayrı sorusu var ve üçü de aynı anda
 * görünmeli: "neredeyim", "şimdi ne seçiyorum", "seçimlerim ne getirdi". Tek
 * sütunlu dar düzende sonuçlar sorunun altında kalıyordu; kullanıcı seçtiği
 * şeyin sonuca ne yaptığını görmek için aşağı kaydırmak zorundaydı.
 *
 *  ┌──────────┬──────────────────┬─────────────┐
 *  │ adımlar  │ o anki soru      │ ilk beş     │
 *  │ + cevap  │ + seçenekler     │ + sonuca git│
 *  └──────────┴──────────────────┴─────────────┘
 *
 * Dar ekranda alt alta düşer; sıra aynı kalır çünkü mantık sırası da bu.
 */

export function Wizard({
  bundle,
  answers,
  stepKey,
}: {
  bundle: DataBundle;
  answers: WizardAnswers;
  /** URL'deki `adim` — tamamlanmış bir adıma cevabı silmeden dönmek için. */
  stepKey?: string;
}) {
  const steps = wizardSteps(bundle, answers);
  // Sabitlenmiş adım yoksa sıradaki cevapsız adım.
  const step = steps.find((s) => s.key === stepKey) ?? activeStep(steps);
  const { done, total } = wizardProgress(steps);
  const matches = wizardMatches(bundle, answers);
  const onizleme = matches.slice(0, 5);

  return (
    <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)_310px] lg:items-start">
      {/* ── Sol: adım rayı ────────────────────────────────────────────── */}
      <nav aria-label="Sihirbaz adımları" className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-3">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Adımlar · <span className="font-num">{done}</span>/<span className="font-num">{total}</span>
        </p>
        <ol className="flex flex-col gap-0.5">
          {steps.map((s, i) => {
            const aktif = s.key === step?.key;
            return (
              <li key={s.key}>
                <Link
                  href={wizardHref(answers, {}, { adim: s.key })}
                  aria-current={aktif ? "step" : undefined}
                  className={cn(
                    "flex items-start gap-2 rounded-[10px] px-2 py-1.5 transition-colors",
                    aktif ? "bg-[var(--brand-soft)]" : "hover:bg-[var(--mist)]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      s.done
                        ? "bg-[var(--brand)] text-white"
                        : aktif
                          ? "border-2 border-[var(--brand)] text-[var(--brand)]"
                          : "border border-[var(--line)] text-[var(--muted-2)]"
                    )}
                  >
                    {s.done ? <Check size={11} strokeWidth={3} /> : <span className="font-num">{i + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13px] font-bold leading-tight",
                        aktif ? "text-[var(--brand-ink)]" : "text-[var(--ink-2)]"
                      )}
                    >
                      {s.title}
                    </span>
                    {/* Verilen cevap adımın altında: "neyi seçmiştim" sorusu
                        için başka bir yere bakmak gerekmesin. Cevapsız adımda
                        ikinci satır hiç çizilmiyor — boş bir tire uğruna her
                        adıma bir satır harcamak rayı ekranın dışına itiyordu. */}
                    {(s.answered || s.done) && (
                      <span className="mt-0.5 block truncate text-[11px] text-[var(--muted)]">
                        {s.answered ?? "Fark etmez"}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <Link
          href="/ara?sihirbaz=1"
          className="mt-2 inline-flex items-center gap-1 px-2 text-[12px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
        >
          <RotateCcw size={12} /> Baştan başla
        </Link>
      </nav>

      {/* ── Orta: o anki soru ─────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
        {step ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight">{step.title}</h2>
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-2)]">
                Adım <span className="font-num">{steps.indexOf(step) + 1}</span>
                {total > 1 && (
                  <>
                    {"/"}
                    <span className="font-num">{total}</span>
                  </>
                )}
              </span>
            </div>
            {step.hint && <p className="mt-1 text-[13px] text-[var(--muted)]">{step.hint}</p>}

            {/* Seçenekler sütunlara açılıyor: dört seçenekli bir soruyu alt alta
                dizmek ekranın yarısını boş bırakıyordu. Sütun sayısı etiket
                uzunluğuna göre — "İstanbul" ile "Amiral gemisi ekran isteyip
                bütçesini zorlamak istemeyenler" aynı genişliği hak etmiyor. */}
            <div
              className={cn(
                "mt-4 grid gap-2",
                step.options.length > 4 &&
                  (step.options.every((o) => o.label.length <= 18 && !o.hint)
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2")
              )}
            >
              {step.options.map((o) => (
                <Link
                  key={`${step.key}-${o.label}`}
                  href={o.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all",
                    o.selected
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                  )}
                >
                  {step.key === "kategori" && o.iconSlug ? (
                    <CategoryIcon slug={o.iconSlug} size={19} className="shrink-0 text-[var(--brand)]" />
                  ) : step.key === "sehir" ? (
                    <MapPin size={17} className="shrink-0 text-[var(--brand)]" />
                  ) : null}

                  {/* Etiketler iki satırda kırpılıyor: "Amiral gemisi ekran
                      isteyip bütçesini zorlamak istemeyenler" gibi uzun bir
                      değer, satırı üçe katlayıp kartı ekranın dışına itiyordu.
                      Tam metin `title`da duruyor. */}
                  <span className="min-w-0 flex-1">
                    <span
                      title={o.label}
                      className="line-clamp-2 block text-[14px] font-bold leading-tight text-[var(--ink)]"
                    >
                      {o.label}
                    </span>
                    {o.hint && <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{o.hint}</span>}
                  </span>

                  {/* Seçeneğin bırakacağı sonuç sayısı — seçtikten sonra boş
                      ekran görmekten iyidir. İşaretli seçenekte gösterilmiyor:
                      oradaki sayı "kaldırırsan bu kadar kalır" anlamına gelir. */}
                  {o.selected ? (
                    <Check size={16} className="shrink-0 text-[var(--brand)]" />
                  ) : (
                    <span className="shrink-0 rounded-md bg-[var(--mist)] px-1.5 py-0.5 font-num text-[11px] font-bold text-[var(--muted)]">
                      {o.count}
                    </span>
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
          </>
        ) : (
          <div className="py-2">
            <h2 className="text-lg font-bold tracking-tight">Tüm sorular cevaplandı</h2>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Soldaki adımlardan herhangi birine dönüp cevabını değiştirebilirsin.
            </p>
          </div>
        )}
      </div>

      {/* ── Sağ: canlı sonuç ──────────────────────────────────────────── */}
      <aside className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Şu an başta olanlar</p>
          <span className="shrink-0 font-num text-[12px] font-bold text-[var(--ink)]">{matches.length}</span>
        </div>

        {onizleme.length === 0 ? (
          <p className="mt-3 text-[13px] text-[var(--muted)]">
            Bu seçimlerle eşleşen kayıt yok. Soldan bir cevabı gevşetebilirsin.
          </p>
        ) : (
          <ol className="mt-2 flex flex-col">
            {onizleme.map((it, i) => (
              <li key={it.slug}>
                <Link
                  href={itemHref(it)}
                  className="group flex items-center gap-2.5 rounded-[10px] px-1.5 py-1.5 transition-colors hover:bg-[var(--mist)]"
                >
                  <RankBadge rank={i + 1} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-tight transition-colors group-hover:text-[var(--brand)]">
                      {it.title}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--muted-2)]">{it.brand}</span>
                  </span>
                  <span className="shrink-0 font-num text-[13px] font-bold text-[var(--brand)]">{it.score}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* Sonuçlara her an geçilebilir: sihirbazı sonuna kadar götürmek
            zorunluluk değil, kolaylık. */}
        {answers.type && (
          <ButtonLink
            href={wizardHref(answers, {}, { sonuc: true })}
            variant="gold"
            size="lg"
            shine
            className="mt-3 w-full font-bold"
          >
            <Sparkles size={15} />
            {matches.length} tavsiyeyi gör
          </ButtonLink>
        )}
      </aside>
    </div>
  );
}
