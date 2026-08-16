# TavsiyeHane

**Her konuda doğru tavsiye.** Ürün, hizmet ve mekân tavsiyelerinde en iyileri belirleyen platform —
tip bazlı puanlama algoritmaları, ihtiyaç sihirbazı, karşılaştırma, doğrulanmış yorumlar ve
sponsorlu içeriğin organikten net ayrımıyla.

## Hızlı başlangıç (demo modu — kurulum gerektirmez)

```bash
npm install
npm run dev
```

`http://localhost:3000` — Supabase anahtarı tanımlı değilse site **yerleşik demo veriyle** tam
işlevsel çalışır (39 içerik, 9 kategori, yorumlar, satıcılar, fiyat geçmişi). Favoriler ve
karşılaştırma tarayıcıda çalışır; üyelik/yorum yazma/panel yazma işlemleri Supabase ister.

## Supabase kurulumu (gerçek veritabanı + üyelik)

1. [supabase.com](https://supabase.com) → **New project** (ücretsiz plan yeterli).
2. Proje açılınca **SQL Editor** → migration'ları **sırayla** yapıştırıp **Run**:
   - `supabase/migrations/0001_init.sql` (tablolar, RLS, indeksler)
   - `supabase/migrations/0002_votes.sql` (oylama tablosu, oy ağırlıklandırma, sinyal görünümü)
   - `supabase/migrations/0003_email_identity.sql` (üye kimliği e-posta; kullanıcı adı kaldırıldı)
   - `supabase/migrations/0004_verified_only.sql` (oy ve yorum için e-posta doğrulaması zorunlu)
   - `supabase/migrations/0005_images.sql` (görsel alanları + item-images depolama kovası)
   - `supabase/migrations/0006_vote_rate_limit.sql` (saatlik oy sınırı + indeks)
   - `supabase/migrations/0007_admin.sql` (panel altyapısı: eksik kayıt alanları, blog, olay ve denetim kaydı)
   - `supabase/migrations/0008_signals_nullable.sql` (sinyal kolonu boş geçilebilir)
   - `supabase/migrations/0009_quotes.sql` (teklif talepleri + saatlik sınır)
   - `supabase/migrations/0010_business_claims.sql` (işletme başvuruları + saatlik sınır)
3. **Project Settings → API**'den değerleri alın; `.env.local` dosyasını doldurun:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → "anon public" anahtarı
   - `SUPABASE_SERVICE_ROLE_KEY` (yalnızca seed için; gizli tutun, Vercel'e eklemeyin)
4. **Authentication → URL Configuration**: giriş, Google ve şifre sıfırlama akışları
   `<origin>/auth/callback` adresine döner. Bu adresleri **Redirect URLs** listesine ekleyin:
   - `http://localhost:3005/auth/callback` (geliştirme)
   - `https://ALAN-ADINIZ/auth/callback` (üretim)

   Listede olmayan adrese dönüş Supabase tarafından reddedilir; giriş sessizce başarısız olur.
5. Demo veriyi veritabanına yükleyin (isteğe bağlı — gerçek katalog kodda tutuluyor):
   ```bash
   npm run seed
   ```
6. `npm run dev` — site artık Supabase verisiyle çalışır (kaynak otomatik algılanır).

### Admin hesabı

Siteden normal kayıt olun, sonra SQL Editor'da:

```sql
-- Kimlik e-postadır; ayrı kullanıcı adı yoktur.
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ADRESINIZ@ornek.com');
```

Ardından `/panel` üzerinden yorum moderasyonu, sponsorluk ve içerik yönetimi açılır.

> **Dikkat:** `npm run verify` içindeki `next build`, çalışan `next dev` ile aynı
> `.next` dizinini kullanır. İkisi aynı anda çalışırsa geliştirme sunucusu her
> rotaya 404 dönmeye başlar. Belirtiyi görünce panik yapmayın: sunucuyu durdurun,
> `.next` klasörünü silin, yeniden başlatın.

### Bot koruması (captcha)

Oylama sitesinin baş tehdidi Sybil saldırısı: toplu hesap açıp toplu oy vermek.
Savunma dört katmanlı — doğrulanmış e-posta (`0004`), kayıtta bot doğrulaması,
oy ağırlıklandırması (`0002`), saatlik oy sınırı (`0006`).

Bot doğrulaması **kayıt** akışında, oy anında değil: kök neden toplu hesap
açmaktır ve her oyda bot testi çıkarmak gerçek kullanıcıyı sınava sokup oylamayı
öldürür.

Varsayılan sağlayıcı **hCaptcha** — bağımsız bir servistir, siteyi nerede
barındırdığınızdan etkilenmez. Cloudflare Turnstile de destekleniyor ama bir
Cloudflare hesabı gerektirir.

1. [hcaptcha.com](https://www.hcaptcha.com) → hesap açın → **New Site** → alan
   adınızı ekleyin.
2. Site key'i `.env.local`'e (ve Vercel ortam değişkenlerine) ekleyin:
   ```
   NEXT_PUBLIC_CAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
   NEXT_PUBLIC_CAPTCHA_PROVIDER=hcaptcha
   ```
3. Secret key'i Supabase → **Authentication → Settings → Bot and Abuse Protection**
   → Enable Captcha protection → provider **hCaptcha** → secret'ı yapıştırın.

Site key tanımlı değilse widget hiç çizilmez ve akış aynen çalışır; ikisini
birlikte açın, yalnızca Supabase tarafını açarsanız kayıt jetonsuz reddedilir.

> Sağlayıcı `src/components/auth/Captcha.tsx` içindeki tablodan seçilir. İki
> servisin API'si neredeyse aynı olduğu için değiştirmek script adresi ve global
> nesne adından ibaret — proje Turnstile'dan hCaptcha'ya bu yüzden tek dosyada
> geçebildi.

### Tazelik ve bakım

Fiyat günlerde eskir. Kayıtlar `verifiedAt` tarihine göre üç durumda olur:
**güncel / eskiyor / doğrulama bekliyor**. Eşikler tipe göre değişir (ürün 7-30
gün, hizmet 30-90, mekân 60-180 — bkz. `src/lib/freshness.ts`).

Bayat kayıt gizlenmez, bayat olduğu söylenir: detay sayfasında uyarı çıkar,
kartta fiyatın yanında saat işareti belirir. Bilgiyi saklamak, yanlış bilgi
göstermek kadar kötüdür — kullanıcı ne kadar eskiye baktığını bilerek karar
verebilmeli.

Doğrulama bekleyen kayıtları listelemek için:

```bash
npx tsx scripts/stale-check.ts
```

Bayat kayıt varsa çıkış kodu 1 döner; zamanlanmış bir işte eşik olarak
kullanılabilir.

### Dış sinyaller (soğuk başlangıç)

Puanın üç dayanağı var ve hangisinin kullanıldığı her kayıtta yazar:
**topluluk > dış sinyal > editör.** Site yeni açıldığında ziyaretçi oyu
olmadığı için trend modeli çalışamaz; dış sinyaller bu boşluğu doldurur.

Bu ölçümler **oy değildir**. Oy sayısı sıfır kalır ve sıfır görünür; dış sinyal
ayrı bir dayanak olarak etiketlenir, kaynağı ve ölçüm tarihi kayıtta gösterilir.

Ölçümler elle yazılmaz — kaynağı olmayan sinyal, uydurulmuş sinyalden ayırt
edilemez. Akış üç adım:

**1. İskeleti üretin.** Hangi kayıtları ölçeceğinizi slug'lardan hatırlamak zor
olduğu için şablon başlıkları da yazar:

```bash
npm run signals -- --sablon telefon
```

`olcumler-telefon.json` dosyası oluşur; başka bir ad için `--cikti` ekleyin.
Çıktıyı `>` ile yönlendirmeyin: PowerShell 5.1 dosyayı UTF-16 olarak kaydeder ve
`npm run` kendi başlık satırlarını da stdout'a yazar — ikisi de JSON'u bozar.
Var olan dosyanın üzerine yazılmaz, doldurduğunuz ölçümler kaybolmasın diye.

**2. Doldurun.** Google Trends'te (veya kullandığınız kaynakta) her kaydı arayıp
`null` değerlerin yerine ölçümü yazın, `kaynak.url`'ye ölçümü aldığınız adresi
koyun. `_baslik` alanı yalnızca sizin içindir, içe aktarımda yok sayılır.

```json
{
  "kaynak": { "label": "Google Trends", "url": "https://trends.google.com/...", "checkedAt": "2026-08-01" },
  "olcumler": {
    "apple-iphone-17-256gb": { "aramaIlgi30": 78, "aramaIlgiOnceki30": 64 },
    "samsung-galaxy-s25-fe-256gb": { "aramaIlgi30": 55, "aramaIlgiOnceki30": 58, "fiyatDegisim30": -4.2 }
  }
}
```

**3. İçe aktarın.**

```bash
npm run signals -- olcumler-telefon.json --db
```

Önce kuru çalıştırır ve ne olacağını yazar; uygulamak için `--yaz` ekleyin.
Kaynağı, ölçüm tarihi veya kaynak adresi eksik girdi reddedilir.

`--db` iki hedefi birden günceller: Supabase'deki `items.external_signals`
(sitenin gerçekten okuduğu yer) ve varsa `src/data/catalog/*.ts`. Bayrağı
vermezseniz yalnızca katalog dosyaları yazılır ve **site değişmez**. Yalnızca
veritabanına yazılan bir ölçüm, `npm run seed` ya da panelden içerik aktarımı
çalıştığında silinir — aktarımın kaynağı koddur; script bu durumda uyarır.

Bir kategoride kayıtların en az yarısında ölçüm varsa o kategori dış sinyal
dayanağına geçer.

### Kayıt görselleri

Görseli olmayan kayıtlar, slug'undan **deterministik olarak üretilen bir kapak**
alır (`src/components/CoverArt.tsx`): telif riski yok, ağ isteği yok, aynı kayıt
her zaman aynı kapağı görür. Gerçek fotoğraf eklendiği anda kapak devreden çıkar.

Fotoğraf eklerken künye **zorunludur** — adres, alt metin, telif sahibi ve
kullanım hakkı. Eksik künyeli görsel hiç gösterilmez ve veritabanı kısıtı da
buna izin vermez (`0005_images.sql`). Sebebi basit: "internette vardı" diye
konulan üretici fotoğrafı, karşılaştırma sitelerinin en sık dava aldığı yerdir.

1. Görseli Supabase → **Storage → item-images** kovasına yükleyin (yazma yetkisi
   yalnızca adminde, okuma herkese açık).
2. Kayda künyesiyle birlikte işleyin:

   ```ts
   image: {
     url: "https://<proje>.supabase.co/storage/v1/object/public/item-images/<dosya>",
     alt: "Beyaz zemin üzerinde siyah iPhone 17'nin ön yüzü",
     credit: "TavsiyeHane",
     license: "Kendi çekimimiz",
   }
   ```

Kabul edilebilir `license` değerleri: kendi çekiminiz, üreticinin basın kiti
(izin şartlarıyla), açık lisanslı görsel (CC BY gibi — `credit` alanına atıf
zorunlu). Bunların dışındakini yüklemeyin.

Görsel boyutlandırma Vercel'in yerleşik optimizasyonuna bırakıldı; ayrıca bir
ayar gerekmiyor. Uzak adresler `next.config.ts` içindeki `remotePatterns`
listesinde tanımlı olmalı — liste bilinçli olarak dar, çünkü her adresten görsel
çekmek sitenin görünümünü üçüncü tarafların kontrolüne bırakmak demek.

### Google ile giriş (isteğe bağlı)

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials →
   Create OAuth client ID** (Web application).
2. Authorized redirect URI: `https://XXXXX.supabase.co/auth/v1/callback`
   (Supabase → Authentication → Providers → Google sayfası tam URI'yi gösterir).
3. Client ID + Secret'ı Supabase → **Authentication → Providers → Google**'a yapıştırıp etkinleştirin.
4. Yukarıdaki 4. adımdaki **Redirect URLs** listesi Google için de geçerlidir.
5. E-posta/şifre girişi bu kurulum olmadan da çalışır. Google sağlayıcısı kapalıyken
   "Google ile devam et" düğmesi anlaşılır bir hata verir, sessizce başarısız olmaz.

## Vercel'e dağıtım

1. [vercel.com](https://vercel.com) → **Add New → Project** → `tavsiyehane` deposunu içe aktarın.
2. Framework otomatik algılanır (Next.js); derleme ayarlarına dokunmaya gerek yok.
3. **Settings → Environment Variables** altına aşağıdaki değerleri ekleyip yeniden dağıtın.

### Ortam değişkenleri

| Değişken | Nerede gerekir | Not |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Derleme anında** | `NEXT_PUBLIC_` ile başlayan değişkenler derlemede koda gömülür. Değiştirince yeniden dağıtmak gerekir. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Derleme anında** | Aynı şekilde. Bu anahtar zaten tarayıcıya açıktır, gizli değildir. |
| `NEXT_PUBLIC_CAPTCHA_SITE_KEY` | İsteğe bağlı | Bot koruması. Tanımlı değilse kayıt akışı doğrulamasız çalışır. |
| `NEXT_PUBLIC_CAPTCHA_PROVIDER` | İsteğe bağlı | `hcaptcha` (varsayılan) veya `turnstile`. |
| `NEXT_PUBLIC_SITE_URL` | İsteğe bağlı | Ayarlanmazsa site adresi isteğin kendi alan adından türetilir. Özel alan adında canonical adresi sabitlemek için tanımlayın. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Gerekmez** | Yalnızca yerelde `npm run seed` için. Vercel'e **eklemeyin** — sızarsa tüm RLS korumasını atlar. |

Supabase anahtarları tanımlanmazsa site üretimde de yerleşik veriyle sorunsuz açılır.

### Dağıtımdan sonra

```
https://<alan-adiniz>/durum        insan gözüyle
https://<alan-adiniz>/api/durum    JSON, sorun varsa HTTP 503
```

Durum sayfası ortam değişkenlerinin yerinde olup olmadığını, veritabanının cevap
verip vermediğini ve doğrulama bekleyen kayıtları tek ekranda gösterir. Hiçbir
anahtar veya anahtar parçası dönmez; değişkenler yalnızca **var/yok** olarak
raporlanır.

> **Daha önce Cloudflare Workers'a dağıtılıyordu.** OpenNext adaptörü, wrangler
> yapılandırması ve Cloudflare'e özel görsel yükleyici kaldırıldı. Geri dönmek
> gerekirse `git log -- wrangler.jsonc open-next.config.ts` bunları getirir.
> Cloudflare'de takıldığımız kısıt (Proxy'nin Node runtime gerektirmesi) Vercel'de
> yok; oturum katmanı bu yüzden güncel `src/proxy.ts` sözleşmesine alındı.

## Komutlar

| Komut               | Açıklama                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Geliştirme sunucusu                             |
| `npm run build`     | Üretim derlemesi                                |
| `npm run start`     | Üretim sunucusu (Node.js)                       |
| `npm run lint`      | ESLint                                          |
| `npm run typecheck` | Yalnızca TypeScript tip kontrolü                |
| `npm run test`      | Birim testleri (Vitest)                         |
| `npm run verify`    | typecheck + lint + test + build                 |
| `npm run seed`      | Demo verisini Supabase'e yükler                 |
| `npm run stale`     | Doğrulama bekleyen kayıtları listeler           |
| `npm run signals`   | Dış sinyal ölçümlerini içe aktarır              |

## Mimari özeti

- **Next.js App Router + TypeScript + Tailwind v4**, koyu mod destekli "modern & temiz" tema.
- **Veri katmanı** (`src/lib/data.ts`): Supabase yapılandırılmışsa oradan, değilse
  `src/data/demo`'daki yerleşik veriden okur — tüm sayfalar tek koddan beslenir.
- **Puanlama** (`src/lib/scoring.ts`): ürün/hizmet/mekân için ayrı ağırlık tabloları
  (ör. ürün: %25 fiyat-performans, %20 kullanıcı memnuniyeti…). Puan bileşenleri
  `score_breakdown` olarak saklanır ve detay sayfasında şeffafça gösterilir.
- **Yorum kriterleri** (`src/lib/criteria.ts`): tip bazlı (ürün: kalite/dayanıklılık…,
  hizmet: iletişim/işçilik…, mekân: lezzet/atmosfer…). Yeni yorumlar moderasyon onayı bekler.
- **Rozetler** (`src/lib/badges.ts`): Editör Seçimi, Fiyat-Performans, Sponsorlu vb.
  Sponsorlu içerik turuncu çerçeveyle ayrılır; **tavsiye puanı satılmaz**.
- **SEO**: `/urunler/telefon`, `/hizmetler/istanbul/ev-temizligi`,
  `/mekanlar/istanbul/kadikoy/kafe` URL yapısı; sitemap, JSON-LD (Product/LocalBusiness),
  sayfa başına metadata, listelerde son güncelleme tarihi.

## Yol haritası fikirleri

- Favori/yorumların üye hesabıyla bulut eşitlemesi (favorites tablosu hazır)
- Gerçek satıcı API'leri ile canlı fiyat/stok
- Teklif taleplerinin işletme panosuna düşmesi + bildirimi
- Şehir bazlı otomatik SEO sayfası üretimi
