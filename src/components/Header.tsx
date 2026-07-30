import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";

const NAV = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/mekanlar", label: "Mekânlar" },
  { href: "/listeler", label: "Listeler" },
  { href: "/karsilastir", label: "Karşılaştır" },
];

export async function Header() {
  const profile = await getCurrentProfile();
  const authReady = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">✓</span>
          <span className="text-lg font-extrabold tracking-tight">
            Tavsiye<span className="text-indigo-600 dark:text-indigo-400">Hane</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 justify-end lg:max-w-xs">
          <SearchBox compact />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/favoriler"
            aria-label="Favoriler"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-rose-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Favoriler"
          >
            ♥
          </Link>
          {profile ? (
            <Link
              href="/hesap"
              className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              {profile.displayName.split("@")[0]}
            </Link>
          ) : (
            <Link
              href={authReady ? "/giris" : "/giris?demo=1"}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Giriş
            </Link>
          )}
        </div>
      </div>

      {/* Mobil menü şeridi */}
      <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-1.5 lg:hidden dark:border-zinc-900">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
