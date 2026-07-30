"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900";

export function AuthForm({ mode }: { mode: "giris" | "kayit" }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
        <strong>Demo modu:</strong> Üyelik için Supabase bağlantısı gerekir. Kurulum adımları proje README dosyasında —
        anahtarları <code>.env.local</code> dosyasına ekleyince bu sayfa otomatik aktifleşir. Favoriler üyeliksiz de çalışır.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "kayit") {
        const { error } = await supabase!.auth.signUp({ email, password });
        if (error) throw error;
        setMsg({ kind: "info", text: "Kayıt alındı! E-postanıza gelen doğrulama bağlantısına tıklayın." });
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "Bir hata oluştu" });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMsg(null);
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMsg({ kind: "error", text: error.message });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inputCls} />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre (en az 6 karakter)"
        className={inputCls}
      />
      {msg && (
        <p className={`rounded-lg p-3 text-sm ${msg.kind === "error" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
          {msg.text}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {busy ? "İşleniyor…" : mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        veya
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <button
        type="button"
        onClick={google}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white py-2.5 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Google ile devam et
      </button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {mode === "giris" ? (
          <>Hesabın yok mu? <Link href="/kayit" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Kayıt ol</Link></>
        ) : (
          <>Zaten üye misin? <Link href="/giris" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Giriş yap</Link></>
        )}
      </p>
    </form>
  );
}
