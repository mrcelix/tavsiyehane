import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Server Component / Server Action / Route Handler için Supabase istemcisi. */
export async function createSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component içinden çağrıldığında yazma yapılamaz; middleware oturumu tazeler.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Oturum sahibinin profili. Kimlik e-postadır; ayrı kullanıcı adı tutulmaz.
 * `email` yalnızca üyenin kendisine gösterilecek yerlerde kullanılmalı —
 * herkese açık gösterim için lib/identity.ts'teki `maskEmail` geçerlidir.
 */
export async function getCurrentProfile(): Promise<{ id: string; email: string; role: string } | null> {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const email = data.user.email ?? "";
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", data.user.id).single();
  return { id: data.user.id, email, role: profile?.role ?? "user" };
}
