import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = pageMetadata({
  title: "Kayıt Ol",
  description: "Ücretsiz TavsiyeHane hesabı oluşturun; yorum yazın, favorilerinizi saklayın.",
  path: "/kayit",
  noIndex: true,
});

export default function KayitPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-1 text-2xl font-extrabold">Kayıt Ol</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Ücretsiz hesap oluştur; deneyimlerini paylaş, favorilerini sakla.</p>
      <AuthForm mode="kayit" />
    </div>
  );
}
