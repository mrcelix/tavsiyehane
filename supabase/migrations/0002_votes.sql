-- TavsiyeHane — oylama ve sinyal katmanı
-- 0001_init.sql sonrasında çalıştırın.

-- =============== SİNYAL ALANI ===============

-- Ham sinyaller item üzerinde tutulur; puan okuma anında kohorttan hesaplanır.
alter table public.items add column if not exists signals jsonb not null default '{}';

-- =============== OYLAR ===============

create table if not exists public.votes (
  item_id    text not null references public.items(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('up','down','interest')),
  created_at timestamptz not null default now(),
  primary key (item_id, user_id)
);
create index if not exists votes_item_idx on public.votes(item_id);
create index if not exists votes_created_idx on public.votes(created_at);

alter table public.votes enable row level security;

-- Sayımlar herkese açık; oy verme yalnızca giriş yapana ve yalnızca kendi adına.
create policy "public read votes"  on public.votes for select using (true);
create policy "insert own vote"    on public.votes for insert with check (user_id = auth.uid());
create policy "update own vote"    on public.votes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own vote"    on public.votes for delete using (user_id = auth.uid());

-- İşletme sahibi kendi kaydına oy veremez.
create or replace function public.block_owner_vote()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.items i where i.id = new.item_id and i.owner_id = new.user_id) then
    raise exception 'İşletme sahibi kendi kaydına oy veremez';
  end if;
  return new;
end;
$$;

drop trigger if exists on_vote_owner_check on public.votes;
create trigger on_vote_owner_check
  before insert or update on public.votes
  for each row execute function public.block_owner_vote();

-- =============== AĞIRLIKLANDIRMA ===============

/*
 * Oy ağırlığı üç şeye bakar:
 *  - hesap yaşı: yeni açılmış hesabın oyu düşük ağırlıkla sayılır
 *  - oy çeşitliliği: yalnızca tek kayda oy vermiş hesap organik görünmez
 *  - zaman sönümü: eski oy bugünü anlatmaz (90 günde yarılanır)
 * Ağırlık istemciden değil, veritabanından gelir.
 */
create or replace function public.vote_weight(p_user uuid, p_created timestamptz)
returns numeric
language sql
security definer set search_path = public, auth
stable
as $$
  select
    -- hesap yaşı: 0.3 ile 1.0 arası, 180 günde dolar
    least(1.0, 0.3 + 0.7 * least(1.0, extract(epoch from (now() - u.created_at)) / (180 * 86400)))
    -- çeşitlilik: tek kayda oy vermişse yarıya iner
    * (case when (select count(distinct v.item_id) from public.votes v where v.user_id = p_user) <= 1 then 0.5 else 1.0 end)
    -- zaman sönümü: 90 günde yarılanır
    * power(0.5, extract(epoch from (now() - p_created)) / (90 * 86400))
  from auth.users u
  where u.id = p_user;
$$;

-- Ağırlıklı sayımlar; okuma katmanı bunu kullanır.
create or replace view public.item_vote_stats as
select
  i.id as item_id,
  coalesce(sum(case when v.kind = 'up'       then public.vote_weight(v.user_id, v.created_at) end), 0)::numeric(10,2) as votes_up,
  coalesce(sum(case when v.kind = 'down'     then public.vote_weight(v.user_id, v.created_at) end), 0)::numeric(10,2) as votes_down,
  coalesce(sum(case when v.kind = 'interest' then public.vote_weight(v.user_id, v.created_at) end), 0)::numeric(10,2) as votes_interest,
  count(*) as raw_total
from public.items i
left join public.votes v on v.item_id = i.id
group by i.id;

-- =============== GÜNLÜK ANLIK GÖRÜNTÜ ===============

-- İvme ve kalıcılık sinyalleri için günlük kayıt.
create table if not exists public.item_stats (
  item_id   text not null references public.items(id) on delete cascade,
  day       date not null default current_date,
  interest  integer not null default 0,
  top_rank  boolean not null default false,
  primary key (item_id, day)
);
create index if not exists item_stats_day_idx on public.item_stats(day);

alter table public.item_stats enable row level security;
create policy "public read item_stats" on public.item_stats for select using (true);
create policy "admin write item_stats" on public.item_stats for all using (public.is_admin()) with check (public.is_admin());
