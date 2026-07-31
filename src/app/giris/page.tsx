import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = pageMetadata({
  title: "Giriş Yap",
  description: "TavsiyeHane hesabınıza giriş yapın; deneyimlerinizi paylaşın ve favorilerinizi saklayın.",
  path: "/giris",
  noIndex: true,
});

export default function GirisPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-1 text-2xl font-extrabold">Giriş Yap</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Yorum yazmak ve favorilerini eşitlemek için giriş yap.</p>
      <AuthForm mode="giris" />
    </div>
  );
}
