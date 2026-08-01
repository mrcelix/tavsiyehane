-- =====================================================================
-- 0006 — Oy hız sınırı
--
-- Oylama sitesinin baş tehdidi Sybil saldırısıdır. Savunma katmanlı:
--   1. Doğrulanmış e-posta zorunlu           (0004)
--   2. Kayıtta bot doğrulaması (Turnstile)   — Supabase Auth ayarı
--   3. Oy ağırlığı: hesap yaşı + çeşitlilik  (0002)
--   4. Hız sınırı                            (bu dosya)
--
-- Hız sınırı neden ağırlıklandırmaya ek olarak gerekli: ağırlık oyun ETKİSİNİ
-- azaltır ama kaydını engellemez. Saniyede yüz oy yazan bir betik, ağırlığı
-- düşük olsa bile tabloyu şişirir ve `item_vote_stats` görünümünü yavaşlatır.
--
-- Sınır bilinçli olarak GENİŞ: gerçek kullanıcı bir oturumda otuz kayda oy
-- verebilir, bu normaldir. Amaç insanı yavaşlatmak değil, betiği durdurmak.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

/** Saatte kaç oy yazılabilir. */
create or replace function public.vote_rate_limit()
returns integer language sql immutable as $$ select 60 $$;

create or replace function public.check_vote_rate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  son_saat integer;
begin
  select count(*) into son_saat
  from public.votes v
  where v.user_id = new.user_id
    and v.created_at > now() - interval '1 hour';

  if son_saat >= public.vote_rate_limit() then
    -- Mesaj kullanıcıya döner; ne olduğunu ve ne yapacağını söylemeli.
    raise exception 'Saatlik oy sınırına ulaştınız. Bir süre sonra tekrar deneyin.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists on_vote_rate_check on public.votes;
create trigger on_vote_rate_check
  before insert on public.votes
  for each row execute function public.check_vote_rate();

-- Hız kontrolü her oyda bu sorguyu çalıştırır; indekssiz tam tarama olurdu.
create index if not exists votes_user_created_idx on public.votes(user_id, created_at desc);
