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
        <p className="rounded-xl bg-[var(--gold-soft)] p-4 text-sm text-[var(--gold-ink)] ring-1 ring-[color-mix(in_oklab,var(--gold)_30%,transparent)]">
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
      <div className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">Görünen ad</p>
        <p className="font-semibold">{profile.displayName}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Rol</p>
        <p className="font-semibold capitalize">{profile.role}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/favoriler" className="rounded-lg bg-[var(--mist-2)] px-4 py-2 text-sm font-semibold hover:bg-[var(--line)]">
            ♥ Favorilerim
          </Link>
          {profile.role === "admin" && (
            <Link href="/panel" className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-ink)]">
              🛠️ Yönetim Paneli
            </Link>
          )}
          {(profile.role === "business" || profile.role === "admin") && (
            <Link href="/isletme" className="rounded-lg bg-[var(--mist-2)] px-4 py-2 text-sm font-semibold hover:bg-[var(--line)]">
              🏪 İşletmem
            </Link>
          )}
        </div>

        <form action={signOutAction} className="mt-6">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--down)] hover:bg-[var(--down-soft)]">
            Çıkış yap
          </button>
        </form>
      </div>
    </div>
  );
}
