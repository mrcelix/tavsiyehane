import Link from "next/link";
import {
  BarChart3,
  FileText,
  FolderTree,
  Building2,
  Inbox,
  LayoutDashboard,
  ListOrdered,
  MessageSquare,
  Package,
  PanelTop,
  ScrollText,
  Users,
} from "lucide-react";
import { createSupabaseServer, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Panel kabuğu.
 *
 * Yetki kontrolü burada, tek yerde: her alt sayfanın kendi kontrolünü yazması,
 * birinde unutulduğunda o sayfanın herkese açık kalması demek. Alt sayfalar
 * yalnızca veriyi çizer.
 */

const MENU = [
  { href: "/panel", label: "Özet", icon: LayoutDashboard },
  { href: "/panel/icerik", label: "İçerik", icon: Package },
  { href: "/panel/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/panel/listeler", label: "Listeler", icon: ListOrdered },
  { href: "/panel/site", label: "Hero & Menü", icon: PanelTop },
  { href: "/panel/blog", label: "Blog", icon: FileText },
  { href: "/panel/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/panel/teklifler", label: "Teklifler", icon: Inbox },
  { href: "/panel/isletmeler", label: "İşletmeler", icon: Building2 },
  { href: "/panel/uyeler", label: "Üyeler", icon: Users },
  { href: "/panel/istatistik", label: "İstatistik", icon: BarChart3 },
  { href: "/panel/kayit", label: "Denetim kaydı", icon: ScrollText },
];

/**
 * Menüdeki bekleyen iş sayıları.
 *
 * Yöneticinin "bir şey var mı?" diye sayfa sayfa dolaşması gerekmesin diye:
 * moderasyon kuyruğu, yeni teklif ve yeni başvuru menüde görünür.
 *
 * Sayım başarısız olursa (tablo yok, yetki yok) sessizce 0 döner — panelin
 * kendisi bir sayaç yüzünden açılmamazlık etmemeli.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function bekleyenler(): Promise<Record<string, number>> {
  const supabase = await createSupabaseServer();
  if (!supabase) return {};
  const say = async (tablo: string, kolon: string, deger: string) => {
    try {
      const { count } = await (supabase as any)
        .from(tablo)
        .select("*", { count: "exact", head: true })
        .eq(kolon, deger);
      return count ?? 0;
    } catch {
      return 0;
    }
  };
  const [yorum, teklif, basvuru] = await Promise.all([
    say("reviews", "status", "pending"),
    say("quote_requests", "status", "yeni"),
    say("business_claims", "status", "yeni"),
  ]);
  return { "/panel/yorumlar": yorum, "/panel/teklifler": teklif, "/panel/isletmeler": basvuru };
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const yapilandirildi = isSupabaseConfigured();
  const profile = await getCurrentProfile();
  const admin = profile?.role === "admin";

  if (yapilandirildi && !admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <h1 className="text-2xl font-extrabold">Yönetim Paneli</h1>
        <p className="mt-3 rounded-xl bg-[var(--down-soft)] p-4 text-sm leading-relaxed text-[var(--down)]">
          Bu bölüm yalnızca <strong>admin</strong> rolündeki üyeler içindir.
          {!profile && (
            <>
              {" "}
              <Link href="/giris" className="font-semibold underline">
                Giriş yapın
              </Link>
              .
            </>
          )}
        </p>
      </div>
    );
  }

  const sayilar = yapilandirildi ? await bekleyenler() : {};

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-2)]">Yönetim</p>
        <nav className="space-y-0.5">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
            >
              <m.icon size={16} className="shrink-0 text-[var(--muted)]" />
              {m.label}
              {/* Bekleyen iş sayısı: sıfırsa rozet hiç çizilmiyor, yoksa her
                  satırda bir "0" gezinip gürültü yapardı. */}
              {(sayilar[m.href] ?? 0) > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1.5 font-num text-[10px] font-bold text-white">
                  {sayilar[m.href]}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {profile && (
          <p className="mt-4 break-all px-3 text-[11px] leading-relaxed text-[var(--muted-2)]">{profile.email}</p>
        )}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobilde kenar çubuğu yerine yatay kaydırılan şerit */}
        <nav className="mb-5 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-2)]"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        {!yapilandirildi && (
          <p className="mb-5 rounded-xl bg-[var(--gold-soft)] p-4 text-sm leading-relaxed text-[var(--gold-ink)]">
            <strong>Demo modu:</strong> Supabase bağlı değil, panel salt okunur. Anahtarlar tanımlanıp{" "}
            <code>profiles.role = &apos;admin&apos;</code> yapılmış bir hesapla girildiğinde yazma işlemleri açılır.
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
