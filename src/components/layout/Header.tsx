import Link from "next/link";
import { Heart, Scale, Sparkles } from "lucide-react";
import { getBundle } from "@/lib/data";
import { buildMenu } from "@/lib/menu";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ButtonLink } from "@/components/ui/Button";
import { AuthTrigger } from "@/components/auth/AuthTrigger";
import { emailInitials } from "@/lib/identity";
import { CategoryMenu } from "./CategoryMenu";
import { HeaderSearch } from "./HeaderSearch";
import { MobileMenu } from "./MobileMenu";

/**
 * §5 Kat 2 — ana header.
 * 64px, sticky, z-40, paper @90% + blur(8px), alt kenarlık line.
 */
export async function Header() {
  const profile = await getCurrentProfile();
  const authReady = isSupabaseConfigured();
  const groups = buildMenu(await getBundle());

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_90%,transparent)] backdrop-blur-lg supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--paper)_75%,transparent)]"
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4">
        <Link href="/" className="shrink-0 font-display text-2xl font-extrabold tracking-tight">
          <span className="text-[var(--ink)]">Tavsiye</span>
          <span className="text-[var(--gold)]">Hane</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <CategoryMenu groups={groups} />
          <Link
            href="/listeler"
            className="flex h-9 items-center rounded-[10px] px-3 text-sm font-bold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            Listeler
          </Link>
          <Link
            href="/ara?sihirbaz=1"
            className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-bold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            <Sparkles size={15} className="text-[var(--gold)]" />
            Sihirbaz
          </Link>
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 justify-end lg:max-w-sm">
          <HeaderSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/karsilastir"
            aria-label="Karşılaştırma"
            title="Karşılaştırma"
            className="hidden h-10 w-10 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] sm:flex"
          >
            <Scale size={18} />
          </Link>
          <Link
            href="/favoriler"
            aria-label="Favoriler"
            title="Favoriler"
            className="hidden h-10 w-10 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] sm:flex"
          >
            <Heart size={18} />
          </Link>

          {/* Görünürlük sarmalayıcıda tutulur: Button'ın kendi `inline-flex` sınıfı
              dışarıdan gelen `hidden`ı ezdiği için doğrudan buton üzerine konamaz. */}
          <span className="hidden md:inline-flex">
            <ButtonLink href="/ara?sihirbaz=1" variant="gold-cta" size="default" shine className="font-bold">
              Ücretsiz Tavsiye Al
            </ButtonLink>
          </span>

          {profile ? (
            <Link
              href="/hesap"
              title={profile.email}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-white"
            >
              {emailInitials(profile.email)}
            </Link>
          ) : (
            <span className="hidden sm:inline-flex">
              {/* Sayfaya götürmek yerine modal: kullanıcı baktığı listeyi kaybetmiyor.
                  /giris ve /kayit sayfaları doğrudan bağlantı için duruyor. */}
              <AuthTrigger
                reason={authReady ? undefined : "Demo modunda üyelik kapalı; kurulum sonrası aktifleşir."}
              />
            </span>
          )}

          <MobileMenu groups={groups} />
        </div>
      </div>
    </header>
  );
}
