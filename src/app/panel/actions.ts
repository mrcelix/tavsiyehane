"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer, getCurrentProfile } from "@/lib/supabase/server";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") throw new Error("Yetkisiz");
  const supabase = await createSupabaseServer();
  if (!supabase) throw new Error("Supabase yapılandırılmamış");
  return supabase;
}

export async function moderateReviewAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")); // approved | rejected
  if (!id || !["approved", "rejected"].includes(status)) return;
  await supabase.from("reviews").update({ status }).eq("id", id);
  revalidatePath("/panel");
}

export async function toggleSponsorAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const current = formData.get("current") === "true";
  await supabase.from("items").update({ is_sponsored: !current }).eq("id", id);
  revalidatePath("/panel");
  revalidatePath("/");
}

export async function touchItemAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("items").update({ updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/panel");
}
