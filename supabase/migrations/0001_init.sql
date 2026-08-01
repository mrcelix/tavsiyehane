-- TavsiyeHane — başlangıç şeması
-- Supabase SQL Editor'da tek seferde çalıştırın (veya `supabase db push`).

-- =============== TABLOLAR ===============

create table if not exists public.categories (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  type        text not null check (type in ('urun','hizmet','mekan')),
  icon        text,
  description text
);

create table if not exists public.items (
  id               text primary key,
  slug             text unique not null,
  title            text not null,
  description      text,
  type             text not null check (type in ('urun','hizmet','mekan')),
  category_slug    text not null references public.categories(slug) on delete cascade,
  brand            text,
  city             text,
  district         text,
  price            numeric,
  price_min        numeric,
  price_max        numeric,
  price_level      int check (price_level between 1 and 4),
  score            int not null default 0,
  score_breakdown  jsonb not null default '{}',
  why_recommended  text,
  attrs            jsonb not null default '{}',
  pros             text[] not null default '{}',
  cons             text[] not null default '{}',
  suitable_for     text[] not null default '{}',
  not_suitable_for text[] not null default '{}',
  badges           text[] not null default '{}',
  is_sponsored     boolean not null default false,
  rating_avg       numeric not null default 0,
  rating_count     int not null default 0,
  owner_id         uuid references auth.users(id) on delete set null,
  updated_at       timestamptz not null default now()
);

-- Sık filtrelenen alanlara indeks (fiyat, şehir, puan, kategori)
create index if not exists items_type_idx     on public.items(type);
create index if not exists items_category_idx on public.items(category_slug);
create index if not exists items_city_idx     on public.items(city);
create index if not exists items_score_idx    on public.items(score desc);
create index if not exists items_price_idx    on public.items(price);

create table if not exists public.offers (
  id            text primary key,
  item_id       text not null references public.items(id) on delete cascade,
  seller_name   text not null,
  seller_rating numeric not null default 0,
  price         numeric not null,
  in_stock      boolean not null default true,
  url           text
);
create index if not exists offers_item_idx on public.offers(item_id);

create table if not exists public.price_history (
  id          bigint generated always as identity primary key,
  item_id     text not null references public.items(id) on delete cascade,
  price       numeric not null,
  recorded_at timestamptz not null default now()
);
create index if not exists price_history_item_idx on public.price_history(item_id, recorded_at);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  item_id     text not null references public.items(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text,
  rating      int not null check (rating between 1 and 5),
  criteria    jsonb not null default '{}',
  comment     text,
  is_verified boolean not null default false,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);
create index if not exists reviews_item_idx   on public.reviews(item_id);
create index if not exists reviews_status_idx on public.reviews(status);

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_id    text not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'user' check (role in ('user','business','admin')),
  created_at   timestamptz not null default now()
);

create table if not exists public.lists (
  id          text primary key,
  slug        text unique not null,
  title       text not null,
  description text,
  updated_at  timestamptz not null default now()
);

create table if not exists public.list_items (
  list_id  text not null references public.lists(id) on delete cascade,
  item_id  text not null references public.items(id) on delete cascade,
  position int not null default 0,
  primary key (list_id, item_id)
);

-- =============== OTOMASYON ===============

-- Yeni üye kaydında otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Yorum onaylandığında item'ın puan önbelleğini tazele
create or replace function public.refresh_item_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target text := coalesce(new.item_id, old.item_id);
begin
  update public.items i set
    rating_avg   = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.item_id = target and r.status = 'approved'), 0),
    rating_count = (select count(*) from public.reviews r where r.item_id = target and r.status = 'approved')
  where i.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_item_rating();

-- RLS içinde güvenli admin kontrolü (profiles'a RLS'siz bakar)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- =============== RLS ===============

alter table public.categories    enable row level security;
alter table public.items         enable row level security;
alter table public.offers        enable row level security;
alter table public.price_history enable row level security;
alter table public.reviews       enable row level security;
alter table public.favorites     enable row level security;
alter table public.profiles      enable row level security;
alter table public.lists         enable row level security;
alter table public.list_items    enable row level security;

-- NOT: PostgreSQL `create policy ... if not exists` desteklemez. Dosyanın yeniden
-- çalıştırılabilir olması için her politika önce düşürülür. Kurulum yarıda kalırsa
-- (ağ hatası, kopyala-yapıştır eksiği) dosyayı baştan çalıştırmak yeterli olmalı.
drop policy if exists "public read categories"    on public.categories;
drop policy if exists "public read items"         on public.items;
drop policy if exists "public read offers"        on public.offers;
drop policy if exists "public read price_history" on public.price_history;
drop policy if exists "public read lists"         on public.lists;
drop policy if exists "public read list_items"    on public.list_items;
drop policy if exists "admin write items"         on public.items;
drop policy if exists "owner update items"        on public.items;
drop policy if exists "admin write categories"    on public.categories;
drop policy if exists "admin write offers"        on public.offers;
drop policy if exists "admin write lists"         on public.lists;
drop policy if exists "admin write list_items"    on public.list_items;
drop policy if exists "read approved reviews"     on public.reviews;
drop policy if exists "insert own review"         on public.reviews;
drop policy if exists "admin moderate reviews"    on public.reviews;
drop policy if exists "delete own review"         on public.reviews;
drop policy if exists "own favorites"             on public.favorites;
drop policy if exists "read profiles"             on public.profiles;
drop policy if exists "update own profile"        on public.profiles;

-- Herkese açık okuma (katalog verisi)
create policy "public read categories"    on public.categories    for select using (true);
create policy "public read items"         on public.items         for select using (true);
create policy "public read offers"        on public.offers        for select using (true);
create policy "public read price_history" on public.price_history for select using (true);
create policy "public read lists"         on public.lists         for select using (true);
create policy "public read list_items"    on public.list_items    for select using (true);

-- İçerik yönetimi: admin her şeyi, işletme sahibi kendi kaydını günceller
create policy "admin write items"  on public.items for all    using (public.is_admin()) with check (public.is_admin());
create policy "owner update items" on public.items for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write offers"     on public.offers     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write lists"      on public.lists      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write list_items" on public.list_items for all using (public.is_admin()) with check (public.is_admin());

-- Yorumlar: onaylılar herkese; kendi yorumun + admin tümünü görür
create policy "read approved reviews" on public.reviews for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "insert own review" on public.reviews for insert
  with check (auth.uid() is not null and user_id = auth.uid() and status = 'pending');
create policy "admin moderate reviews" on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());
create policy "delete own review" on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- Favoriler: yalnızca sahibi
create policy "own favorites" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Profiller: herkes görünen adı okuyabilir; kendi profilini günceller
create policy "read profiles"      on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
