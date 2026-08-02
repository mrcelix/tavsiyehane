import { getBundle } from "@/lib/data";
import { TYPE_LABELS, type ItemType } from "@/lib/types";
import { Alan, Baslik, Dugme, GIRDI, Kart, Tablo } from "@/components/admin/ui";
import { Onayli } from "@/components/admin/Onayli";
import { kategoriKaydetAction, kategoriSilAction, kategoriSiraAction } from "../actions";

export const dynamic = "force-dynamic";

const TIPLER: ItemType[] = ["urun", "hizmet", "mekan"];

export default async function KategorilerPage() {
  const bundle = await getBundle();
  const kayitSayisi = new Map<string, number>();
  for (const i of bundle.items) kayitSayisi.set(i.categorySlug, (kayitSayisi.get(i.categorySlug) ?? 0) + 1);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Kategoriler</h1>

      <Kart>
        <Baslik aciklama="Sıra numarası küçük olan üstte görünür — hem kategori ızgarasında hem mega menüde. Değişiklikleri tek seferde kaydedin.">
          Sıralama ve görünürlük
        </Baslik>
        <form action={kategoriSiraAction}>
          <Tablo basliklar={["Sıra", "Kategori", "Tip", "Durum", "Menüde", "Kayıt", ""]}>
            {bundle.categories.map((c) => (
              <tr key={c.slug}>
                <td className="py-2 pr-3">
                  <input
                    name={`sira.${c.slug}`}
                    defaultValue={0}
                    inputMode="numeric"
                    className="w-16 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm"
                  />
                </td>
                <td className="py-2 pr-3 font-medium">
                  {c.icon} {c.name}
                  <span className="ml-1.5 text-xs text-[var(--muted-2)]">{c.slug}</span>
                </td>
                <td className="py-2 pr-3 text-[var(--muted)]">{TYPE_LABELS[c.type].singular}</td>
                <td className="py-2 pr-3 text-xs">
                  {c.status === "hazirlaniyor" ? (
                    <span className="rounded bg-[var(--mist-2)] px-1.5 py-0.5 font-semibold text-[var(--muted)]">
                      hazırlanıyor
                    </span>
                  ) : (
                    <span className="rounded bg-[var(--up-soft)] px-1.5 py-0.5 font-semibold text-[var(--up)]">
                      yayında
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-xs text-[var(--muted)]">—</td>
                <td className="py-2 pr-3 font-num tabular-nums">{kayitSayisi.get(c.slug) ?? 0}</td>
                <td className="py-2 text-right">
                  <Onayli
                    soru={`"${c.name}" ve içindeki ${kayitSayisi.get(c.slug) ?? 0} kayıt silinecek. Emin misiniz?`}
                    action={kategoriSilAction}
                  >
                    <input type="hidden" name="slug" value={c.slug} />
                    <Dugme tur="tehlike" type="submit">
                      Sil
                    </Dugme>
                  </Onayli>
                </td>
              </tr>
            ))}
          </Tablo>
          <div className="mt-4">
            <Dugme type="submit">Sıralamayı kaydet</Dugme>
          </div>
        </form>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted-2)]">
          Kategori silmek, içindeki tüm kayıtları da siler (veritabanı düzeyinde bağlı silme). Geri alınamaz.
        </p>
      </Kart>

      <Kart>
        <Baslik aciklama="Var olan bir slug girilirse o kategori güncellenir. İçinde kayıt yokken 'hazırlanıyor' seçin: boş kategori sayfası hem kullanıcıyı hem arama motorunu yanıltır.">
          Kategori ekle / düzenle
        </Baslik>
        <form action={kategoriKaydetAction} className="grid gap-4 sm:grid-cols-2">
          <Alan etiket="Ad *">
            <input name="name" required className={GIRDI} />
          </Alan>
          <Alan etiket="Slug" ipucu="Boş bırakılırsa addan üretilir.">
            <input name="slug" className={GIRDI} />
          </Alan>
          <Alan etiket="Tip *">
            <select name="type" className={GIRDI}>
              {TIPLER.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t].singular}
                </option>
              ))}
            </select>
          </Alan>
          <Alan etiket="Simge" ipucu="Emoji. Kart ikonları lucide setinden gelir; bu alan yedek gösterimdir.">
            <input name="icon" defaultValue="📦" className={GIRDI} />
          </Alan>
          <Alan etiket="Açıklama" genis>
            <textarea name="description" rows={2} className={GIRDI} />
          </Alan>
          <Alan etiket="Durum">
            <select name="status" className={GIRDI}>
              <option value="yayinda">Yayında</option>
              <option value="hazirlaniyor">Hazırlanıyor</option>
            </select>
          </Alan>
          <Alan etiket="Sıra">
            <input name="sira" inputMode="numeric" defaultValue={0} className={GIRDI} />
          </Alan>
          <label className="flex items-center gap-2 self-end pb-2 text-sm sm:col-span-2">
            <input type="checkbox" name="menu_gorunur" defaultChecked className="h-4 w-4 accent-[var(--brand)]" />
            Mega menüde göster
          </label>
          <div className="sm:col-span-2">
            <Dugme type="submit">Kaydet</Dugme>
          </div>
        </form>
      </Kart>
    </div>
  );
}
