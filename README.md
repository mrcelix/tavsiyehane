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
3. **Project Settings → API**'den değerleri alın; `.env.local` dosyasını doldurun:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → "anon public" anahtarı
   - `SUPABASE_SERVICE_ROLE_KEY` (yalnızca seed için; gizli tutun, Cloudflare'e eklemeyin)
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
update profiles set role = 'admin' where display_name = 'KULLANICI_ADINIZ';
```

Ardından `/panel` üzerinden yorum moderasyonu, sponsorluk ve içerik yönetimi açılır.

### Google ile giriş (isteğe bağlı)

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials →
   Create OAuth client ID** (Web application).
2. Authorized redirect URI: `https://XXXXX.supabase.co/auth/v1/callback`
   (Supabase → Authentication → Providers → Google sayfası tam URI'yi gösterir).
3. Client ID + Secret'ı Supabase → **Authentication → Providers → Google**'a yapıştırıp etkinleştirin.
4. Yukarıdaki 4. adımdaki **Redirect URLs** listesi Google için de geçerlidir.
5. E-posta/şifre girişi bu kurulum olmadan da çalışır. Google sağlayıcısı kapalıyken
   "Google ile devam et" düğmesi anlaşılır bir hata verir, sessizce başarısız olmaz.

## Cloudflare'e dağıtım

Site **Cloudflare Workers** üzerinde çalışacak şekilde yapılandırıldı ([OpenNext adaptörü](https://opennext.js.org/cloudflare) ile).

> **Neden Pages değil Workers?** Cloudflare ve Next.js ekibi Next.js için artık Workers + OpenNext'i
> öneriyor. Pages tarafındaki `@cloudflare/next-on-pages` yalnızca Edge runtime destekliyor ve bakım
> modunda. Workers da aynı panelde yönetilir, özel alan adı ve ücretsiz plan aynı şekilde geçerlidir.

### Panelden (GitHub'a bağlı, otomatik dağıtım)

1. Cloudflare panel → **Workers & Pages → Create → Workers → Import a repository**, `tavsiyehane` deposunu seçin.
2. Derleme ayarları:
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npx wrangler deploy`
3. **Settings → Variables and Secrets** altına Supabase değerlerini ekleyin (aşağıya bakın), sonra yeniden dağıtın.

### Terminalden (tek seferlik)

```bash
npx wrangler login
npm run cf:deploy
```

Dağıtmadan önce yerelde gerçek Workers runtime'ında denemek için:

```bash
npm run cf:preview
```

### Ortam değişkenleri

| Değişken | Nerede gerekir | Not |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Derleme anında** | `NEXT_PUBLIC_` ile başlayan değişkenler derlemede koda gömülür; Cloudflare'de *build* değişkeni olarak tanımlanmalı. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Derleme anında** | Aynı şekilde. Bu anahtar zaten tarayıcıya açıktır, gizli değildir. |
| `NEXT_PUBLIC_SITE_URL` | İsteğe bağlı | Ayarlanmazsa site adresi isteğin kendi alan adından türetilir. Özel alan adında canonical adresi sabitlemek için tanımlayın. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Gerekmez** | Yalnızca yerelde `npm run seed` için. Cloudflare'e **eklemeyin**. |

Supabase anahtarları tanımlanmazsa site üretimde de demo veriyle sorunsuz açılır.

### Bilinen kısıt

Next.js 16 `middleware.ts`'i `proxy.ts` olarak yeniden adlandırdı ve Proxy'yi zorunlu olarak Node.js
runtime'da çalıştırıyor; OpenNext adaptörü bunu henüz desteklemiyor. Bu nedenle oturum tazeleme katmanı
bilinçli olarak eski `src/middleware.ts` sözleşmesinde tutuluyor — derlemede bir deprecation uyarısı
verir ama çalışır. Adaptör desteği geldiğinde dosya `proxy.ts`, fonksiyon `proxy` olarak geri alınmalı.
Takip: [workers-sdk#13755](https://github.com/cloudflare/workers-sdk/issues/13755).

## Komutlar

| Komut               | Açıklama                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Geliştirme sunucusu                             |
| `npm run build`     | Üretim derlemesi                                |
| `npm run start`     | Üretim sunucusu (Node.js)                       |
| `npm run lint`      | ESLint                                          |
| `npm run typecheck` | Yalnızca TypeScript tip kontrolü                |
| `npm run seed`      | Demo verisini Supabase'e yükler                 |
| `npm run cf:build`  | Cloudflare Worker paketini üretir               |
| `npm run cf:preview`| Worker'ı yerelde gerçek runtime ile çalıştırır  |
| `npm run cf:deploy` | Derleyip Cloudflare'e dağıtır                   |

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
