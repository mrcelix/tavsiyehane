import { EDITOR_MODELS } from "@/lib/scoring";
import { TYPE_LABELS, type Category, type Item, type ItemType } from "@/lib/types";
import { Alan, Baslik, Dugme, GIRDI, Kart } from "./ui";

/**
 * Kayıt formu — ürün, hizmet ve mekân için ortak.
 *
 * Tipe göre alan gizlemek yerine hepsi gösteriliyor, hangisinin hangi tipte
 * anlamlı olduğu ipuçlarında yazıyor. Sebebi: gizlenen alan, editörün varlığını
 * hiç öğrenemediği alandır; boş bırakılan alan zaten kaydedilmiyor.
 */
export function ItemForm({
  item,
  categories,
  action,
}: {
  item?: Item;
  categories: Category[];
  action: (fd: FormData) => Promise<void>;
}) {
  const tip: ItemType = item?.type ?? "urun";
  const kriterler = EDITOR_MODELS[tip];

  const attrsMetin = item
    ? Object.entries(item.attrs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <Kart>
        <Baslik aciklama="Slug boş bırakılırsa başlıktan üretilir. Yayınlanmış bir kaydın slug'ını değiştirmek bağlantıları kırar.">
          Temel bilgiler
        </Baslik>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan etiket="Başlık *" genis>
            <input name="title" required defaultValue={item?.title} className={GIRDI} />
          </Alan>
          <Alan etiket="Slug">
            <input name="slug" defaultValue={item?.slug} placeholder="otomatik" className={GIRDI} />
          </Alan>
          <Alan etiket="Tip *">
            <select name="type" defaultValue={tip} className={GIRDI}>
              {(["urun", "hizmet", "mekan"] as ItemType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t].singular}
                </option>
              ))}
            </select>
          </Alan>
          <Alan etiket="Kategori *">
            <select name="category_slug" defaultValue={item?.categorySlug} required className={GIRDI}>
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({TYPE_LABELS[c.type].singular})
                </option>
              ))}
            </select>
          </Alan>
          <Alan etiket="Marka / İşletme">
            <input name="brand" defaultValue={item?.brand} className={GIRDI} />
          </Alan>
          <Alan etiket="Açıklama" genis ipucu="Listelerde ve detay sayfasının üstünde görünür.">
            <textarea name="description" rows={3} defaultValue={item?.description} className={GIRDI} />
          </Alan>
          <Alan
            etiket="Neden tavsiye ediyoruz?"
            genis
            ipucu="Somut bir ayrım yazın. 'Kaliteli bir ürün' değil, 'kavurma tarihini fişe yazan tek yer' gibi."
          >
            <textarea name="why_recommended" rows={3} defaultValue={item?.whyRecommended} className={GIRDI} />
          </Alan>
        </div>
      </Kart>

      <Kart>
        <Baslik aciklama="Fiyat ürün, aralık hizmet, seviye mekân içindir. Boş bırakılanlar gösterilmez.">
          Konum ve fiyat
        </Baslik>
        <div className="grid gap-4 sm:grid-cols-3">
          <Alan etiket="Şehir">
            <input name="city" defaultValue={item?.city} className={GIRDI} />
          </Alan>
          <Alan etiket="İlçe">
            <input name="district" defaultValue={item?.district} className={GIRDI} />
          </Alan>
          <Alan etiket="Fiyat (ürün)">
            <input name="price" inputMode="decimal" defaultValue={item?.price} className={GIRDI} />
          </Alan>
          <Alan etiket="Alt fiyat (hizmet)">
            <input name="price_min" inputMode="decimal" defaultValue={item?.priceMin} className={GIRDI} />
          </Alan>
          <Alan etiket="Üst fiyat (hizmet)">
            <input name="price_max" inputMode="decimal" defaultValue={item?.priceMax} className={GIRDI} />
          </Alan>
          <Alan etiket="Fiyat seviyesi (mekân)" ipucu="1-4 arası; ₺ ile ₺₺₺₺">
            <input name="price_level" inputMode="numeric" defaultValue={item?.priceLevel} className={GIRDI} />
          </Alan>
        </div>
      </Kart>

      <Kart>
        <Baslik
          aciklama="Her satır bir alan: “RAM: 8 GB”. Bu alanlar filtre panelini besler — aynı adı tutarlı kullanın, farklı yazım ayrı filtre değeri üretir."
        >
          Öznitelikler
        </Baslik>
        <textarea name="attrs" rows={6} defaultValue={attrsMetin} placeholder="RAM: 8 GB&#10;Garanti: 2 yıl" className={GIRDI} />
      </Kart>

      <Kart>
        <Baslik aciklama="Her satır bir madde.">Artılar, eksiler, uygunluk</Baslik>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan etiket="Artılar">
            <textarea name="pros" rows={4} defaultValue={item?.pros.join("\n")} className={GIRDI} />
          </Alan>
          <Alan etiket="Eksiler">
            <textarea name="cons" rows={4} defaultValue={item?.cons.join("\n")} className={GIRDI} />
          </Alan>
          <Alan etiket="Kimler için uygun">
            <textarea name="suitable_for" rows={3} defaultValue={item?.suitableFor.join("\n")} className={GIRDI} />
          </Alan>
          <Alan etiket="Kimler için uygun değil">
            <textarea name="not_suitable_for" rows={3} defaultValue={item?.notSuitableFor.join("\n")} className={GIRDI} />
          </Alan>
        </div>
      </Kart>

      <Kart>
        <Baslik aciklama="0-100. DEĞERLENDİREMEDİĞİNİZ KRİTERİ BOŞ BIRAKIN — puan yalnızca doldurulan kriterlerin ağırlığına bölünür. Tahmini sayı yazmak, ölçülmemiş şeyi ölçülmüş göstermektir.">
          Editör değerlendirmesi
        </Baslik>
        <div className="grid gap-4 sm:grid-cols-2">
          {kriterler.map((k) => (
            <Alan key={k.key} etiket={`${k.label} (%${Math.round(k.weight * 100)})`} ipucu={k.hint}>
              <input
                name={`kriter.${k.key}`}
                inputMode="numeric"
                defaultValue={item?.editorial.criteria[k.key]}
                className={GIRDI}
              />
            </Alan>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted-2)]">
          Kriterler tipe göre değişir; tip değiştirip kaydettiğinizde ilgili kriter kümesi görünür.
        </p>
      </Kart>

      <Kart>
        <Baslik aciklama="Künye zorunlu: adres verirseniz alt metin, telif sahibi ve lisans da girilmelidir. Kaynağı bilinmeyen görsel yayımlanmaz.">
          Görsel
        </Baslik>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan etiket="Görsel adresi" genis>
            <input name="image_url" defaultValue={item?.image?.url} className={GIRDI} />
          </Alan>
          <Alan etiket="Alt metin" ipucu="Görseli göremeyen için betimleme.">
            <input name="image_alt" defaultValue={item?.image?.alt} className={GIRDI} />
          </Alan>
          <Alan etiket="Telif sahibi">
            <input name="image_credit" defaultValue={item?.image?.credit} className={GIRDI} />
          </Alan>
          <Alan etiket="Lisans" ipucu="Kendi çekimimiz / üretici basın kiti / CC BY 4.0">
            <input name="image_license" defaultValue={item?.image?.license} className={GIRDI} />
          </Alan>
          <Alan etiket="Kaynak sayfa">
            <input name="image_source_url" defaultValue={item?.image?.sourceUrl} className={GIRDI} />
          </Alan>
        </div>
      </Kart>

      <Kart>
        <Baslik>Yayın</Baslik>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan etiket="Doğrulama tarihi" ipucu="Boş bırakılırsa bugün yazılır. Tazelik uyarıları buna göre hesaplanır.">
            <input
              name="verified_at"
              type="date"
              defaultValue={item?.provenance.verifiedAt?.slice(0, 10)}
              className={GIRDI}
            />
          </Alan>
          <label className="flex items-start gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="is_sponsored" defaultChecked={item?.isSponsored} className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
            <span>
              Sponsorlu
              <span className="block text-[11px] text-[var(--muted-2)]">
                Görünürlük ücreti alındı. Puana ve sıralamaya etki etmez, yalnızca işaretlenir.
              </span>
            </span>
          </label>
        </div>
      </Kart>

      <div className="flex gap-2">
        <Dugme type="submit">{item ? "Değişiklikleri kaydet" : "Kaydı oluştur"}</Dugme>
      </div>
    </form>
  );
}
