import { getBundle } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HERO_VARSAYILAN, type HeroIcerik } from "@/lib/site-content";
import { TYPE_LABELS } from "@/lib/types";
import { Alan, Baslik, Dugme, GIRDI, Kart, Tablo } from "@/components/admin/ui";
import { ayarKaydetAction } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function SitePage() {
  const bundle = await getBundle();

  let hero: HeroIcerik = HERO_VARSAYILAN;
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data } = await (supabase as any)
      .from("site_settings")
      .select("deger")
      .eq("anahtar", "hero")
      .maybeSingle();
    if (data?.deger) hero = data.deger as HeroIcerik;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Hero &amp; Menü</h1>

      <Kart>
        <Baslik aciklama="Ana sayfanın üst alanındaki metinler. Kaydedilmezse koddaki varsayılan kullanılır — panelden yönetilen bir alanın kodda da bir karşılığı olmalı ki veritabanı boşken site metinsiz kalmasın.">
          Hero metinleri
        </Baslik>
        <form action={ayarKaydetAction} className="space-y-4">
          <input type="hidden" name="anahtar" value="hero" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Alan etiket="Üst etiket" genis>
              <input name="_ustEtiket" defaultValue={hero.ustEtiket} className={GIRDI} disabled />
            </Alan>
          </div>
          <Alan
            etiket="İçerik (JSON)"
            genis
            ipucu="Alanlar: ustEtiket, baslik, altBaslik, vurgular[]. Vurgular hero altındaki üç kısa maddedir."
          >
            <textarea name="deger" rows={14} defaultValue={JSON.stringify(hero, null, 2)} className={`${GIRDI} font-mono text-xs`} />
          </Alan>
          <Dugme type="submit">Hero metinlerini kaydet</Dugme>
        </form>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted-2)]">
          JSON düzenlemek zahmetli ama alan yapısı zamanla değişecek; her alan için ayrı girdi koymak, yapı her
          değiştiğinde panelin de değişmesi demek olurdu. Geçersiz JSON kaydedilmez.
        </p>
      </Kart>

      <Kart>
        <Baslik aciklama="Mega menü kategorilerden üretilir. Sıra ve görünürlük Kategoriler sayfasından yönetilir; burada sonucu görürsünüz.">
          Mega menü önizlemesi
        </Baslik>
        <Tablo basliklar={["Tip", "Kategori", "Durum", "Kayıt"]}>
          {bundle.categories.map((c) => (
            <tr key={c.slug}>
              <td className="py-2 pr-3 text-[var(--muted)]">{TYPE_LABELS[c.type].singular}</td>
              <td className="py-2 pr-3 font-medium">
                {c.icon} {c.name}
              </td>
              <td className="py-2 pr-3 text-xs">
                {c.status === "hazirlaniyor" ? (
                  <span className="text-[var(--muted)]">menüde &quot;yakında&quot;</span>
                ) : (
                  <span className="text-[var(--up)]">menüde bağlantılı</span>
                )}
              </td>
              <td className="py-2 font-num tabular-nums">
                {bundle.items.filter((i) => i.categorySlug === c.slug).length}
              </td>
            </tr>
          ))}
        </Tablo>
      </Kart>
    </div>
  );
}
