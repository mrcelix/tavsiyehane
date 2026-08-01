import type { Metadata } from "next";
import { Eye, Scale, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { EDITOR_MODELS, EXTERNAL_MODELS, MIN_COHORT, MIN_VOTES_PER_ITEM, SCORE_MODELS } from "@/lib/scoring";
import { BADGES } from "@/lib/badges";
import { TYPE_LABELS, type BadgeKey, type ItemType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Overline } from "@/components/ui/Card";

export const metadata: Metadata = pageMetadata({
  title: "Puanlama Metodolojisi",
  description:
    "Tavsiye puanı nasıl hesaplanır: yedi sinyal, kategori içi göreli değerlendirme, oy ağırlıklandırması ve rozet koşulları.",
  path: "/metodoloji",
});

const PANEL = "rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]";

const OY_TIPLERI = [
  { icon: <ThumbsUp size={16} className="text-[var(--up)]" />, ad: "Denedim, tavsiye ederim", agirlik: "×3", besler: "Topluluk oyu + memnuniyet" },
  { icon: <ThumbsDown size={16} className="text-[var(--down)]" />, ad: "Denedim, tavsiye etmem", agirlik: "×3", besler: "Topluluk oyu (negatif) + memnuniyet" },
  { icon: <Eye size={16} className="text-[var(--brand)]" />, ad: "İlgimi çekti", agirlik: "×1", besler: "İlgi hacmi + yükseliş ivmesi" },
];

export default function MetodolojiPage() {
  const tipler: ItemType[] = ["urun", "hizmet", "mekan"];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Overline>Şeffaflık</Overline>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[32px]">Puanlama metodolojisi</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)]">
        Tavsiye puanı bir editörün kanaati değil, hesaplanan bir sonuçtur. Nasıl hesaplandığını burada
        açıkça yazıyoruz — çünkü gösterdiğimiz sayının arkasını göstermezsek sayının bir anlamı olmaz.
      </p>

      <section className={`mt-8 ${PANEL}`}>
        <h2 className="flex items-center gap-2 text-base font-bold">
          <ShieldCheck size={17} className="text-[var(--brand)]" />
          Puanın iki dayanağı vardır ve hangisi olduğu her zaman yazar
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-sm font-bold">1. Topluluk puanı</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
              Kategoride yeterli oy biriktiğinde: kayıtların en az yarısı{" "}
              <strong>{MIN_VOTES_PER_ITEM}</strong> oya ulaşmış olmalı. Puan, aşağıdaki yedi sinyalin
              kategori içi yüzdeliklerinden hesaplanır.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-sm font-bold">2. Dış sinyal</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
              Oy yokken ama dışarıdan ölçüm varsa: arama ilgisi ve fiyat hareketi. Ölçümün{" "}
              <strong>kaynağı ve tarihi</strong> kayıtta yazar. Bunlar oy değildir ve oy sayısına
              eklenmez.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--line)] p-3">
            <p className="text-sm font-bold">3. Editör değerlendirmesi</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
              İkisi de yoksa. Puan, editörün <strong>doğrulanabilir</strong> kriterlerine dayanır ve
              kayıt &quot;Editör değerlendirmesi&quot; olarak etiketlenir.
            </p>
          </li>
        </ol>
        <p className="mt-3 rounded-xl bg-[var(--up-soft)] p-3 text-sm leading-relaxed text-[var(--up)]">
          <strong>Oy ve yorum sayısı asla üretilmez.</strong> Topluluk verisi olmayan kaydın oy sayısı
          sıfırdır ve sıfır görünür; tahmini bir rakam yazmayız. Dış sinyal de oy sayısına eklenmez —
          ayrı bir dayanaktır ve öyle etiketlenir. Aynı sebeple, editörün ölçemediği bir kriter boş
          bırakılır; puan yalnızca gerçekten değerlendirilen kriterlerin ağırlığına bölünür.
        </p>
      </section>

      <section className={`mt-4 ${PANEL}`}>
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Scale size={17} className="text-[var(--brand)]" />
          Topluluk puanı mutlak değil, kategori içinde görelidir
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
          Bir robot süpürge telefonla değil, diğer robot süpürgelerle kıyaslanır. Her sinyal önce kendi
          kategorisindeki yüzdelik dilime çevrilir, sonra ağırlıklandırılır. Yani{" "}
          <strong>87 puan &quot;kendi kategorisinde üst dilimde&quot;</strong> demektir; farklı kategorilerin
          puanları birbiriyle kıyaslanamaz.
        </p>
        <p className="mt-3 rounded-xl bg-[var(--gold-soft)] p-3 text-sm text-[var(--gold-ink)]">
          Kategoride <strong>{MIN_COHORT}</strong>&apos;den az kayıt varsa yüzdelik gürültülü olur; bu durumda
          puan orta noktaya doğru büzülür. Yani az kayıtlı bir kategoride kimse uç puan alamaz — bu bilinçli
          bir tercihtir, elimizde olmayan kesinliği taklit etmeyiz.
        </p>
      </section>

      <h2 className="mt-10 text-xl font-extrabold tracking-tight">Dış sinyal ağırlıkları</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Editörün payı kasıtlı olarak yüksek: dış ölçüm neyin konuşulduğunu söyler, iyi olduğunu
        söylemez. Arama hacmi yüksek diye kötü bir kaydı üste çıkarmak, trend sitesini magazin
        sayfasına çevirir.
      </p>

      <div className="mt-4 space-y-4">
        {tipler.map((t) => (
          <section key={t} className={PANEL}>
            <h3 className="text-base font-bold">{TYPE_LABELS[t].plural}</h3>
            <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
              {EXTERNAL_MODELS[t].map((s) => (
                <div key={s.key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt>
                    <span className="font-semibold text-[var(--ink)]">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{s.hint}</span>
                  </dt>
                  <dd className="shrink-0 font-num font-bold text-[var(--brand)]">%{Math.round(s.weight * 100)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-extrabold tracking-tight">Editör kriterleri</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Topluluk verisi yokken kullanılan kriterler. Hepsi belgeye, ölçüme veya yayınlanmış bilgiye
        dayanır — &quot;kullanıcı memnuniyeti&quot; bilinçli olarak yoktur, onu editör bilemez.
      </p>

      <div className="mt-4 space-y-4">
        {tipler.map((t) => (
          <section key={t} className={PANEL}>
            <h3 className="text-base font-bold">{TYPE_LABELS[t].plural}</h3>
            <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
              {EDITOR_MODELS[t].map((s) => (
                <div key={s.key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt>
                    <span className="font-semibold text-[var(--ink)]">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{s.hint}</span>
                  </dt>
                  <dd className="shrink-0 font-num font-bold text-[var(--brand)]">%{Math.round(s.weight * 100)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-extrabold tracking-tight">Topluluk sinyalleri ve ağırlıkları</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Aynı yedi sinyal, üç tipte farklı dengelerle kullanılır: ürün trendle, hizmet güvenle, mekân
        canlılıkla yaşar.
      </p>

      <div className="mt-4 space-y-4">
        {tipler.map((t) => (
          <section key={t} className={PANEL}>
            <h3 className="text-base font-bold">{TYPE_LABELS[t].plural}</h3>
            <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
              {SCORE_MODELS[t].map((s) => (
                <div key={s.key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt>
                    <span className="font-semibold text-[var(--ink)]">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{s.hint}</span>
                  </dt>
                  <dd className="shrink-0 font-num font-bold text-[var(--brand)]">%{Math.round(s.weight * 100)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-extrabold tracking-tight">Oylar nasıl sayılır</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Deneyim oyu ile niyet oyu bilinçli olarak ayrılır. Çok <em>ilgi</em> çekip az <em>tavsiye</em> alan
        şey, tam olarak hype&apos;ı tutmayan şeydir; tek tip beğeni düğmesi bu bilgiyi yok eder.
      </p>

      <div className={`mt-4 ${PANEL}`}>
        <dl className="divide-y divide-[var(--line)] text-sm">
          {OY_TIPLERI.map((o) => (
            <div key={o.ad} className="flex items-center justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                {o.icon}
                {o.ad}
              </dt>
              <dd className="shrink-0 text-right">
                <span className="font-num font-bold text-[var(--brand)]">{o.agirlik}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">{o.besler}</span>
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-5 text-sm font-bold">Manipülasyona karşı</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--ink-2)]">
          <li>
            • <strong>Doğrulanmamış hesabın oyu ve yorumu hiç kaydedilmez.</strong> Bu kural hem
            uygulamada hem veritabanı satır güvenliğinde uygulanır; API atlansa bile geçerlidir.
          </li>
          <li>• Yeni açılmış hesabın oyu düşük ağırlıkla sayılır; ağırlık hesap yaşıyla artar.</li>
          <li>• Yalnızca tek bir kayda oy vermiş hesapların ağırlığı yarıya iner.</li>
          <li>• Oylar eskidikçe ağırlığını yitirir (90 günde yarılanır) — trend sitesinde iki yıl önceki oy bugünü anlatmaz.</li>
          <li>• Bir kaydı sahiplenen işletme hesabı o kayda oy veremez.</li>
          <li>• Ağırlık istemciden değil veritabanından gelir; tarayıcıdan değiştirilemez.</li>
        </ul>
      </div>

      <h2 className="mt-10 text-xl font-extrabold tracking-tight">Rozet koşulları</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Rozetler koşullardan otomatik hesaplanır. <strong>Sponsorlu dışında hiçbiri elle takılamaz</strong> —
        &quot;elle verildi&quot; tartışması hiç başlamasın diye koşulları da burada yayınlıyoruz.
      </p>

      <div className={`mt-4 ${PANEL}`}>
        <dl className="divide-y divide-[var(--line)]">
          {(Object.keys(BADGES) as BadgeKey[]).map((k) => (
            <div key={k} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3">
              <dt className="shrink-0">
                <Badge variant={BADGES[k].variant}>{BADGES[k].label}</Badge>
              </dt>
              <dd className="flex-1 text-sm text-[var(--ink-2)]">{BADGES[k].description}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="mt-10 flex gap-3 rounded-[14px] bg-[var(--gold-soft)] p-5 text-sm leading-relaxed text-[var(--gold-ink)]">
        <ShieldCheck size={20} className="mt-0.5 shrink-0" />
        <div>
          <strong>Sponsorluk sıralamayı etkilemez.</strong> Sponsorlu içerik altın çerçeveyle ayrılır ve
          puan hesabına hiçbir şekilde girmez. İşletmeler görünürlük satın alabilir; tavsiye puanı ve
          sıralama satılmaz. Bir sponsorun puanı düşükse düşük görünür — &quot;Hype&apos;ı tutmadı&quot;
          rozetini sponsorlu bir kayıt da alabilir.
        </div>
      </section>
    </div>
  );
}
