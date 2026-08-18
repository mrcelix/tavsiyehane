-- =====================================================================
-- 0011 — Puan anlık görüntüleri (Puan Günlüğü)
--
-- Site "sıralamalar her gün yeniden hesaplanır" diyor ama hesabın DÜNKÜ hâli
-- hiçbir yerde tutulmuyordu. Yani bir kaydın puanı düştüğünde kullanıcı da,
-- editör de bunu göremiyordu; "neden değişti" sorusunun cevabı yoktu.
--
-- Bu tablo her gün her kaydın puanını, kategori sırasını, dayanağını ve puan
-- bileşenlerini saklar. Günlük tek satır: birincil anahtar (item_id, taken_on)
-- olduğu için aynı gün ikinci kez çalıştırmak satırı GÜNCELLER, çoğaltmaz —
-- cron iki kez tetiklenirse geçmiş bozulmaz.
--
-- NEDEN BILESENLER DE SAKLANIYOR: yalnızca puanı saklamak "84'tü, 82 oldu"
-- demeye yeter ama NEDEN olduğunu söyleyemez. Bileşenler saklanınca
-- "fiyat karşılığı 8 puan düştü" denebiliyor — asıl anlatan cümle o.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

create table if not exists public.score_snapshots (
  item_id       text not null references public.items(id) on delete cascade,
  taken_on      date not null default (now() at time zone 'utc')::date,
  score         int  not null,
  category_rank int  not null default 0,
  score_basis   text not null,
  breakdown     jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  primary key (item_id, taken_on)
);

-- Detay sayfası tek kaydın son 30 gününü okur; kayıt + tarih sırası şart.
create index if not exists score_snapshots_item_idx on public.score_snapshots(item_id, taken_on desc);
create index if not exists score_snapshots_date_idx on public.score_snapshots(taken_on desc);

-- =============== RLS ===============
-- Okuma herkese açık: puan geçmişi zaten sitede gösterilecek, gizli bir tarafı
-- yok. Yazma yalnızca service_role (cron) — anonim bir istemcinin geçmişe
-- satır eklemesi, geçmişin kendisini uydurulabilir yapardı.

alter table public.score_snapshots enable row level security;

drop policy if exists "public read snapshots" on public.score_snapshots;
create policy "public read snapshots" on public.score_snapshots for select using (true);
