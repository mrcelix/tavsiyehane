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

export async function getCurrentProfile(): Promise<{ id: string; displayName: string; role: string } | null> {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", data.user.id)
    .single();
  if (!profile) return { id: data.user.id, displayName: data.user.email ?? "Üye", role: "user" };
  return { id: profile.id, displayName: profile.display_name ?? data.user.email ?? "Üye", role: profile.role ?? "user" };
}
