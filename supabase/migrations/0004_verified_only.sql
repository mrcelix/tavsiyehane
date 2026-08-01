-- =====================================================================
-- 0004 — Oy ve yorum için e-posta doğrulaması zorunlu
--
-- Kayıt formunda ve metodoloji sayfasında "doğrulanmamış hesapların oyu
-- sayılmaz" yazıyordu ama hiçbir katman bunu uygulamıyordu. Yazdığı kuralı
-- uygulamayan bir puanlama, puanın kendisinden daha çok güven kaybettirir.
--
-- Kural üç yerde birden zorlanır:
--   1. API (src/app/api/votes, src/app/api/reviews) — hızlı ve anlaşılır hata
--   2. RLS (bu dosya) — API atlanırsa da geçerli
--   3. Arayüz — kullanıcıya ne yapması gerektiğini söyler
--
-- Yalnızca RLS'e güvenmek yetmez (hata mesajı kullanıcıya bir şey anlatmaz),
-- yalnızca API'ye güvenmek ise anon anahtarla doğrudan tabloya yazmayı
-- engellemez. İkisi birden gerekir.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

/*
 * Oturum sahibinin e-postası doğrulanmış mı?
 * auth.users'ı okumak için security definer gerekir; fonksiyon yalnızca
 * boolean döndürür, satır sızdırmaz.
 */
create or replace function public.is_email_verified()
returns boolean
language sql
security definer set search_path = public, auth
stable
as $$
  select coalesce(
    (select u.email_confirmed_at is not null from auth.users u where u.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_email_verified() from public;
grant execute on function public.is_email_verified() to authenticated, anon;

-- Oy: yalnızca doğrulanmış hesap yazabilir/güncelleyebilir.
drop policy if exists "insert own vote" on public.votes;
drop policy if exists "update own vote" on public.votes;
create policy "insert own vote" on public.votes for insert
  with check (user_id = auth.uid() and public.is_email_verified());
create policy "update own vote" on public.votes for update
  using (user_id = auth.uid() and public.is_email_verified())
  with check (user_id = auth.uid() and public.is_email_verified());

-- Yorum: aynı kural. Doğrulanmamış hesabın yorumu moderasyon kuyruğuna bile girmez.
drop policy if exists "insert own review" on public.reviews;
create policy "insert own review" on public.reviews for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and status = 'pending'
    and public.is_email_verified()
  );
