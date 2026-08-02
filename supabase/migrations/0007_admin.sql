-- =====================================================================
-- 0007 — Yönetim paneli altyapısı
--
-- Panelin yönetebilmesi için var olması gereken şeyler: kategori sıralaması,
-- site metinleri (hero), blog, olay kaydı (tıklama istatistiği) ve denetim
-- kaydı.
--
-- İKİ İLKE:
--
-- 1. Panelden değiştirilebilen her şey veritabanında durur. Kodda sabit yazılıp
--    "panelden yönetiliyor" denen alan, ilk değişiklikte yalan olur.
--
-- 2. Denetim kaydı zorunlu. Puanı ve sıralamayı etkileyen bir panelde "bunu kim
--    değiştirdi?" sorusunun cevabı olmazsa, şeffaflık iddiası yalnızca dışarıya
--    dönük bir sözdür.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

-- =============== EKSİK KALAN KAYIT ALANLARI ===============

/*
 * Okuma katmanı (src/lib/data.ts) bu alanları okuyordu ama hiçbir migration
 * oluşturmamıştı — tablolar boş olduğu için fark edilmemişti. Panelden ilk
 * kayıt girildiği anda ortaya çıkacaktı: `editor_criteria` gelmeyince editör
 * puanı sıfır, `provenance_kind` gelmeyince her kayıt "doğrulanmış" görünecekti.
 */
alter table public.items add column if not exists provenance_kind  text not null default 'editor';
alter table public.items add column if not exists verified_at      timestamptz;
alter table public.items add column if not exists sources          jsonb;
alter table public.items add column if not exists editor_criteria  jsonb not null default '{}';
alter table public.items add column if not exists external_signals jsonb;

alter table public.items drop constraint if exists items_provenance_check;
alter table public.items add constraint items_provenance_check
  check (provenance_kind in ('editor', 'demo'));

-- =============== KATEGORİ: SIRALAMA VE GÖRÜNÜRLÜK ===============

alter table public.categories add column if not exists sira         integer not null default 0;
alter table public.categories add column if not exists status       text    not null default 'yayinda';
alter table public.categories add column if not exists menu_gorunur boolean not null default true;

alter table public.categories drop constraint if exists categories_status_check;
alter table public.categories add constraint categories_status_check
  check (status in ('yayinda', 'hazirlaniyor'));

create index if not exists categories_sira_idx on public.categories(type, sira);

-- =============== SİTE METİNLERİ ===============

/*
 * Anahtar-değer deposu. Hero başlıkları, güven şeridi metinleri gibi
 * "içerik değil ama sabit de olmaması gereken" alanlar burada.
 * Şema jsonb: her ayarın kendi biçimi var, ayrı tablo açmak aşırıya kaçardı.
 */
create table if not exists public.site_settings (
  anahtar    text primary key,
  deger      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "admin write settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write settings" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- =============== BLOG ===============

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body         text not null default '',
  -- Görsel künyesi kayıt görselleriyle aynı kuralda (bkz. 0005): kaynağı
  -- bilinmeyen görsel yayımlanmaz.
  cover_url     text,
  cover_alt     text,
  cover_credit  text,
  cover_license text,
  status       text not null default 'taslak',
  published_at timestamptz,
  author_id    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check check (status in ('taslak', 'yayinda'));

alter table public.posts drop constraint if exists posts_cover_kunye_tam;
alter table public.posts add constraint posts_cover_kunye_tam check (
  cover_url is null
  or (cover_alt is not null and cover_credit is not null and cover_license is not null)
);

create index if not exists posts_status_idx on public.posts(status, published_at desc);

alter table public.posts enable row level security;
drop policy if exists "public read published posts" on public.posts;
drop policy if exists "admin write posts" on public.posts;
-- Taslaklar herkese açık değil; yayımlanmamış yazı gizli kalmalı.
create policy "public read published posts" on public.posts for select
  using (status = 'yayinda' or public.is_admin());
create policy "admin write posts" on public.posts for all
  using (public.is_admin()) with check (public.is_admin());

-- =============== OLAY KAYDI (İSTATİSTİK) ===============

/*
 * Görüntülenme, tıklama, karşılaştırma gibi olaylar.
 *
 * GİZLİLİK: IP adresi, user-agent veya kullanıcı kimliği SAKLANMAZ. Kim
 * olduğunu bilmeden de "hangi kayıt kaç kez tıklandı" sorusuna cevap
 * verilebiliyor; kişiye bağlanabilir veri toplamak, gerekmediği hâlde risk
 * biriktirmek olur.
 */
create table if not exists public.events (
  id         bigserial primary key,
  tur        text not null,
  item_id    text references public.items(id) on delete cascade,
  yol        text,
  hedef      text,
  created_at timestamptz not null default now()
);

alter table public.events drop constraint if exists events_tur_check;
alter table public.events add constraint events_tur_check
  check (tur in ('goruntuleme', 'tiklama', 'karsilastirma', 'favori', 'cikis', 'arama'));

create index if not exists events_created_idx on public.events(created_at desc);
create index if not exists events_item_idx    on public.events(item_id, created_at desc);
create index if not exists events_tur_idx     on public.events(tur, created_at desc);

alter table public.events enable row level security;
drop policy if exists "anyone insert event" on public.events;
drop policy if exists "admin read events"   on public.events;
-- Yazma herkese açık (ziyaretçi olay üretir), okuma yalnızca adminde:
-- ham olay akışı rakibe trafik bilgisi verir.
create policy "anyone insert event" on public.events for insert with check (true);
create policy "admin read events"   on public.events for select using (public.is_admin());

/** Günlük özet — ham tabloyu her rapor için taramak ölçeklenmez. */
create or replace view public.event_daily as
select
  date_trunc('day', created_at)::date as gun,
  tur,
  item_id,
  count(*) as adet
from public.events
group by 1, 2, 3;

-- =============== DENETİM KAYDI ===============

create table if not exists public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references auth.users(id) on delete set null,
  eylem      text not null,
  hedef_tur  text,
  hedef_id   text,
  detay      jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_created_idx on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;
drop policy if exists "admin read audit"  on public.audit_log;
drop policy if exists "admin write audit" on public.audit_log;
create policy "admin read audit"  on public.audit_log for select using (public.is_admin());
create policy "admin write audit" on public.audit_log for insert with check (public.is_admin());

-- =============== ROL YÖNETİMİ ===============

/*
 * Admin, üyelerin rolünü değiştirebilmeli. Mevcut "update own profile"
 * politikası kullanıcının kendi rolünü değiştirmesini engelliyor; adminin
 * başkasının rolünü değiştirmesi için ayrı politika gerekiyor.
 *
 * Kendi rolünü düşürmek serbest bırakıldı: son admin kendini kilitleyebilir
 * ama bunu engellemek, panelde "rol değiştir" düğmesinin bazen sessizce
 * çalışmaması demek olurdu. Uyarı arayüzde veriliyor.
 */
drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());
