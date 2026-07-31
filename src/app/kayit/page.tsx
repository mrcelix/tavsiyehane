import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function KayitPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-1 text-2xl font-extrabold">Kayıt Ol</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Ücretsiz hesap oluştur; deneyimlerini paylaş, favorilerini sakla.</p>
      <AuthForm mode="kayit" />
    </div>
  );
}
