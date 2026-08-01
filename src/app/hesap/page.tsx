import type { Metadata } from "next";
import { Heart, LogOut, Store, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { maskEmail } from "@/lib/identity";
import { pageMetadata } from "@/lib/seo";
import { signOutAction } from "./actions";

export const metadata: Metadata = pageMetadata({
  title: "Hesabım",
  description: "Hesap bilgileriniz, favorileriniz ve yetkilerinize göre yönetim bağlantıları.",
  path: "/hesap",
  noIndex: true,
});

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
        <p className="text-sm text-[var(--muted)]">E-posta (hesap kimliğin)</p>
        <p className="font-semibold">{profile.email}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Yorumlarda görünen ad</p>
        {/* Herkese açık yerlerde tam adres gösterilmez; toplanıp spam için kullanılıyor. */}
        <p className="font-semibold">{maskEmail(profile.email)}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Rol</p>
        <p className="font-semibold capitalize">{profile.role}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/favoriler" variant="secondary">
            <Heart size={15} />
            Favorilerim
          </ButtonLink>
          {profile.role === "admin" && (
            <ButtonLink href="/panel" variant="primary">
              <Wrench size={15} />
              Yönetim Paneli
            </ButtonLink>
          )}
          {(profile.role === "business" || profile.role === "admin") && (
            <ButtonLink href="/isletme" variant="secondary">
              <Store size={15} />
              İşletmem
            </ButtonLink>
          )}
        </div>

        <form action={signOutAction} className="mt-6">
          <button className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-[var(--down)] transition-colors hover:bg-[var(--down-soft)]">
            <LogOut size={15} />
            Çıkış yap
          </button>
        </form>
      </div>
    </div>
  );
}
