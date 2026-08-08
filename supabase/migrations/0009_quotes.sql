-- =====================================================================
-- 0009 — Teklif talepleri
--
-- Hizmet detayındaki "Ücretsiz Teklif Al" formu bugüne kadar hiçbir yere
-- yazmıyordu: kullanıcıya "talebiniz iletildi" diyip talebi düşürüyordu.
-- Güven iddiası olan bir sitede en pahalı hata türü budur — kullanıcı
-- beklemeye başlar, karşı taraf hiçbir şey görmez.
--
-- Bu tablo talebi KAYDEDER. İşletmeye e-posta göndermek ayrı bir iş (SMTP
-- gerekir) ve henüz yok; bu yüzden arayüzdeki metin de "iletildi" demiyor,
-- "alındı" diyor. Yapmadığımız şeyi yaptık diye yazmamak, yapmaktan önce gelir.
--
-- ANONİM YAZMA: form üyelik istemez. İstese işe yaramazdı — teklif almak için
-- hesap açmak, teklif istemekten pahalıdır. Bunun bedeli spam riskidir ve iki
-- katmanla sınırlanır: alan uzunluğu kısıtları ve kayıt başına saatlik tavan.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

create table if not exists public.quote_requests (
  id         uuid primary key default gen_random_uuid(),
  item_id    text not null references public.items(id) on delete cascade,
  -- Ad ve iletişim serbest metin: telefon da e-posta da kabul ediliyor, çünkü
  -- usta arayan kullanıcı telefon yazar.
  name       text not null check (length(btrim(name)) between 2 and 120),
  contact    text not null check (length(btrim(contact)) between 5 and 200),
  message    text not null check (length(btrim(message)) between 10 and 2000),
  status     text not null default 'yeni' check (status in ('yeni','iletildi','kapandi')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_item_idx    on public.quote_requests(item_id);
create index if not exists quote_requests_created_idx on public.quote_requests(created_at desc);

-- =============== HIZ SINIRI ===============
-- Anonim formda kullanıcı kimliği yok, bu yüzden sınır KAYIT BAŞINA. Bir
-- işletmeye bir saatte 20 gerçek teklif talebi gelmesi olağan değil; betiğin
-- aynı kaydı yüzlerce kez doldurması ise olağan. Sınırın amacı insanı
-- yavaşlatmak değil, betiği durdurmak (bkz. 0006 ile aynı yaklaşım).

create or replace function public.quote_rate_limit()
returns integer language sql immutable as $$ select 20 $$;

create or replace function public.check_quote_rate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  son_saat integer;
begin
  select count(*) into son_saat
  from public.quote_requests q
  where q.item_id = new.item_id
    and q.created_at > now() - interval '1 hour';

  if son_saat >= public.quote_rate_limit() then
    raise exception 'Bu kayıt için saatlik teklif sınırına ulaşıldı. Bir süre sonra tekrar deneyin.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists on_quote_rate_check on public.quote_requests;
create trigger on_quote_rate_check
  before insert on public.quote_requests
  for each row execute function public.check_quote_rate();

-- =============== RLS ===============
-- Yazma herkese açık, OKUMA yalnızca admine. Talepte ad ve telefon var; bunu
-- herkese açık okutmak, formu kişisel veri sızdıran bir kanala çevirirdi.

alter table public.quote_requests enable row level security;

drop policy if exists "insert quote request" on public.quote_requests;
drop policy if exists "admin read quotes"    on public.quote_requests;
drop policy if exists "admin update quotes"  on public.quote_requests;

create policy "insert quote request" on public.quote_requests for insert
  with check (status = 'yeni');
create policy "admin read quotes"   on public.quote_requests for select using (public.is_admin());
create policy "admin update quotes" on public.quote_requests for update
  using (public.is_admin()) with check (public.is_admin());
