-- =====================================================================
-- 0005 — Kayıt görselleri
--
-- Görsel alanları TEK PARÇA değil, künyesiyle birlikte tutulur: adres, alt
-- metin, telif sahibi ve kullanım hakkı. Okuma katmanı künyesi eksik görseli
-- hiç göstermez (bkz. src/lib/data.ts) — "internette vardı" diye konulmuş bir
-- fotoğraf, karşılaştırma sitelerinin en sık dava aldığı yerdir.
--
-- Alt metin de zorunlu: görseli göremeyen kullanıcı için betimleme olmadan
-- yayımlanan görsel erişilebilirlik açığıdır.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

alter table public.items add column if not exists image_url        text;
alter table public.items add column if not exists image_alt        text;
alter table public.items add column if not exists image_credit     text;
alter table public.items add column if not exists image_license    text;
alter table public.items add column if not exists image_source_url text;

-- Künye ya tamamen dolu ya tamamen boş olmalı; yarım künye sessizce görseli
-- gizlerdi ve editör neden görünmediğini anlamazdı.
alter table public.items drop constraint if exists items_image_kunye_tam;
alter table public.items add constraint items_image_kunye_tam check (
  image_url is null
  or (image_alt is not null and image_credit is not null and image_license is not null)
);

-- =============== DEPOLAMA ===============

-- Görseller için herkese açık okunabilir kova. Yazma yalnızca adminde.
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do update set public = true;

drop policy if exists "item images public read"  on storage.objects;
drop policy if exists "item images admin write"  on storage.objects;
drop policy if exists "item images admin delete" on storage.objects;

create policy "item images public read" on storage.objects for select
  using (bucket_id = 'item-images');

create policy "item images admin write" on storage.objects for insert
  with check (bucket_id = 'item-images' and public.is_admin());

create policy "item images admin delete" on storage.objects for delete
  using (bucket_id = 'item-images' and public.is_admin());
