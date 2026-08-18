-- =====================================================================
-- 0012 — Olaylara oturum kimliği
--
-- "Şu anda kaç kişi bakıyor" sorusunu GERÇEK veriyle cevaplayabilmek için.
-- `events` tablosu görüntülemeleri kaydediyordu ama oturum ayırt edilemiyordu:
-- bir kişinin beş kez yenilemesi ile beş kişinin bakması aynı görünüyordu.
--
-- GİZLİLİK BOZULMUYOR: `oturum` rastgele üretilen, sekmeye özel, KİMLİĞE
-- BAĞLANAMAYAN bir dize. Tarayıcı sekmesi kapanınca kaybolur (sessionStorage),
-- kalıcı çerez değildir, kullanıcıya da cihaza da geri bağlanamaz. IP ve
-- user-agent hâlâ saklanmıyor.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

alter table public.events add column if not exists oturum text;

-- Canlı sayım sorgusu: son 5 dakikada belirli bir yoldaki tekil oturumlar.
-- İndeks olmadan bu sorgu her rozet çiziminde tam tarama yapardı.
create index if not exists events_canli_idx
  on public.events(yol, created_at desc)
  where tur = 'goruntuleme';
