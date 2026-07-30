import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Giriş Yap" };

export default function GirisPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-1 text-2xl font-extrabold">Giriş Yap</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Yorum yazmak ve favorilerini eşitlemek için giriş yap.</p>
      <AuthForm mode="giris" />
    </div>
  );
}
