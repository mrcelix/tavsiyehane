-- =====================================================================
-- 0010 — İşletme başvuruları
--
-- `/isletme` sayfasındaki "Başvuruyu Gönder" formu bugüne kadar hiçbir yere
-- yazmıyordu: kullanıcıya "Başvurunuz alındı, editör ekibi sizinle iletişime
-- geçecek" deyip başvuruyu düşürüyordu. Teklif formunda düzeltilen hatanın
-- (0009) aynısı — güven iddiası olan bir sitede en pahalı hata türü budur,
-- çünkü karşı taraf beklemeye başlar ve kimse haberdar olmaz.
--
-- Bu tablo başvuruyu KAYDEDER. Belge doğrulaması ve iletişim insan işi;
-- otomatik bir akış yok. Arayüzdeki metin de bu yüzden ne olacağını söylüyor.
--
-- ANONİM YAZMA: başvuru üyelik istemez — işletme sahibinin önce hesap açması,
-- başvurmaktan pahalıdır. Bedeli spam riskidir; alan uzunluğu kısıtları ve
-- saatlik tavan ile sınırlanır (0009 ile aynı yaklaşım).
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

create table if not exists public.business_claims (
  id           uuid primary key default gen_random_uuid(),
  business     text not null check (length(btrim(business)) between 2 and 160),
  contact_name text not null check (length(btrim(contact_name)) between 2 and 120),
  email        text not null check (length(btrim(email)) between 5 and 200 and position('@' in email) > 1),
  phone        text not null check (length(btrim(phone)) between 7 and 40),
  category     text not null check (length(btrim(category)) between 2 and 80),
  note         text check (note is null or length(btrim(note)) <= 2000),
  status       text not null default 'yeni' check (status in ('yeni','incelemede','onaylandi','reddedildi')),
  admin_note   text,
  created_at   timestamptz not null default now()
);

create index if not exists business_claims_created_idx on public.business_claims(created_at desc);
create index if not exists business_claims_status_idx  on public.business_claims(status);

-- =============== HIZ SINIRI ===============
-- Anonim formda kullanıcı kimliği yok. Sınır e-posta başına: aynı adresten
-- saatte 5 başvuru gerçek bir senaryo değil, betiğin yüzlerce yazması ise
-- olağan. Amaç insanı yavaşlatmak değil, betiği durdurmak (bkz. 0006, 0009).

create or replace function public.claim_rate_limit()
returns integer language sql immutable as $$ select 5 $$;

create or replace function public.check_claim_rate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  son_saat integer;
begin
  select count(*) into son_saat
  from public.business_claims c
  where lower(c.email) = lower(new.email)
    and c.created_at > now() - interval '1 hour';

  if son_saat >= public.claim_rate_limit() then
    raise exception 'Bu e-posta için saatlik başvuru sınırına ulaşıldı. Bir süre sonra tekrar deneyin.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists on_claim_rate_check on public.business_claims;
create trigger on_claim_rate_check
  before insert on public.business_claims
  for each row execute function public.check_claim_rate();

-- =============== RLS ===============
-- Yazma herkese açık, OKUMA yalnızca admine: başvuruda ad, e-posta ve telefon
-- var. Herkese açık okutmak formu kişisel veri sızdıran bir kanala çevirirdi.

alter table public.business_claims enable row level security;

drop policy if exists "insert business claim" on public.business_claims;
drop policy if exists "admin read claims"     on public.business_claims;
drop policy if exists "admin update claims"   on public.business_claims;

create policy "insert business claim" on public.business_claims for insert
  with check (status = 'yeni');
create policy "admin read claims"   on public.business_claims for select using (public.is_admin());
create policy "admin update claims" on public.business_claims for update
  using (public.is_admin()) with check (public.is_admin());
