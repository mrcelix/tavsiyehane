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
2. Proje açılınca **SQL Editor** → `supabase/migrations/0001_init.sql` içeriğini yapıştırıp **Run**.
3. **Project Settings → API**'den değerleri alın; `.env.local.example` dosyasını `.env.local`
   olarak kopyalayıp doldurun:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (yalnızca seed için; gizli tutun)
4. Demo veriyi veritabanına yükleyin:
   ```bash
   npm run seed
   ```
5. `npm run dev` — site artık Supabase verisiyle çalışır (kaynak otomatik algılanır).

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
4. E-posta/şifre girişi bu kurulum olmadan da çalışır.

## Komutlar

| Komut               | Açıklama                                   |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Geliştirme sunucusu                        |
| `npm run build`     | Üretim derlemesi                           |
| `npm run start`     | Üretim sunucusu                            |
| `npm run lint`      | ESLint                                     |
| `npm run typecheck` | Yalnızca TypeScript tip kontrolü           |
| `npm run seed`      | Demo verisini Supabase'e yükler            |

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
