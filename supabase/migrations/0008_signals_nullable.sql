-- =====================================================================
-- 0008 — items.signals boş geçilebilir olmalı
--
-- 0002'de kolon `not null default '{}'` tanımlanmıştı. O sırada model henüz
-- "sinyali olmayan kayıt" kavramını tanımıyordu; sonradan puanın üç dayanağı
-- (topluluk / dış sinyal / editör) eklenince `null` bir ANLAM kazandı:
-- "bu kayıt hakkında topluluk verisi yok".
--
-- Boş nesne ('{}') bunu anlatmaz — okuma katmanı onu "tüm sayaçları sıfır olan
-- bir sinyal kaydı" olarak yorumlar. Bugün sonuç aynı görünüyor (sıfır oy zaten
-- eşiği geçmez) ama iddia farklı: biri "veri yok", diğeri "veri var ve sıfır".
-- Bu ayrımı şemada tutmazsak, ilerideki her okuma yanlış varsayımla yazılır.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

alter table public.items alter column signals drop not null;
alter table public.items alter column signals drop default;

-- Mevcut boş nesneleri null'a çevir: "veri yok" durumları böyle işaretlenmeli.
update public.items set signals = null where signals = '{}'::jsonb;
