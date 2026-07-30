import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutAction } from "./actions";

export const metadata: Metadata = { title: "Hesabım" };

export default async function HesapPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="mb-4 text-2xl font-extrabold">Hesabım</h1>
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
          Demo modunda üyelik kapalı. Supabase anahtarları eklendiğinde bu sayfa aktifleşir.
        </p>
      </div>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-6 text-2xl font-extrabold">Hesabım</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Görünen ad</p>
        <p className="font-semibold">{profile.displayName}</p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Rol</p>
        <p className="font-semibold capitalize">{profile.role}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/favoriler" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            ♥ Favorilerim
          </Link>
          {profile.role === "admin" && (
            <Link href="/panel" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              🛠️ Yönetim Paneli
            </Link>
          )}
          {(profile.role === "business" || profile.role === "admin") && (
            <Link href="/isletme" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
              🏪 İşletmem
            </Link>
          )}
        </div>

        <form action={signOutAction} className="mt-6">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            Çıkış yap
          </button>
        </form>
      </div>
    </div>
  );
}
