import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = pageMetadata({
  title: "Giriş Yap",
  description: "TavsiyeHane hesabınıza giriş yapın; deneyimlerinizi paylaşın ve favorilerinizi saklayın.",
  path: "/giris",
  noIndex: true,
});

export default function GirisPage() {
  return (
    // Modal ile aynı bileşen; iki ayrı giriş uygulaması tutmak, birinde
    // düzeltilen hatanın diğerinde kalması demek.
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
        <AuthPanel initialMode="giris" compact />
      </div>
    </div>
  );
}
