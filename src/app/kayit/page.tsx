import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = pageMetadata({
  title: "Kayıt Ol",
  description: "Ücretsiz TavsiyeHane hesabı oluşturun; yorum yazın, favorilerinizi saklayın.",
  path: "/kayit",
  noIndex: true,
});

export default function KayitPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
        <AuthPanel initialMode="kayit" compact />
      </div>
    </div>
  );
}
