import "server-only";
import { createSupabaseServer } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Blog okuma katmanı.
 *
 * Taslakları RLS zaten gizliyor (0007), ama sorgu da açıkça `yayinda` filtresi
 * uyguluyor: iki katman aynı şeyi söylediğinde, birinde yapılan bir hata
 * diğerini de aşmadan yakalanır.
 */
export interface Yazi {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover: { url: string; alt: string; credit: string; license: string } | null;
  publishedAt: string | null;
  updatedAt: string;
}

function map(r: any): Yazi {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? null,
    body: r.body ?? "",
    cover:
      r.cover_url && r.cover_alt && r.cover_credit && r.cover_license
        ? { url: r.cover_url, alt: r.cover_alt, credit: r.cover_credit, license: r.cover_license }
        : null,
    publishedAt: r.published_at ?? null,
    updatedAt: r.updated_at,
  };
}

export async function yayindakiYazilar(): Promise<Yazi[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await (supabase as any)
    .from("posts")
    .select("*")
    .eq("status", "yayinda")
    .order("published_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(map);
}

export async function yaziOku(slug: string): Promise<Yazi | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await (supabase as any)
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "yayinda")
    .maybeSingle();
  if (error || !data) return null;
  return map(data);
}
