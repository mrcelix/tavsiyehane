-- =====================================================================
-- 0003 — Üye kimliği e-posta oldu
--
-- Ayrı kullanıcı adı kavramı kaldırıldı: kayıtta sorulmuyor, girişte
-- kullanılmıyor, yönetimde aranmıyor. `profiles.display_name` kolonu artık
-- hiçbir yerden okunmuyor; şemada bırakmak sonraki geliştiriciyi onun kimlik
-- olduğunu sanmaya iter.
--
-- Veri kaybı riski yok: kolon e-postanın yerel kısmından türetiliyordu
-- (split_part(email,'@',1)), yani gerekirse auth.users'tan yeniden üretilebilir.
--
-- Herkese açık gösterim `reviews.user_name` üzerinden yapılır ve orada TAM adres
-- değil maskeli hâli yazılır (bkz. src/lib/identity.ts). Yorumlarda yayımlanan
-- e-postalar toplanıp spam için kullanılıyor.
--
-- Bu dosya yeniden çalıştırılabilir.
-- =====================================================================

-- Yeni üye kaydında profil satırı yalnızca id ve rol ile oluşur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles drop column if exists display_name;
