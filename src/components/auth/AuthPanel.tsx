"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import {
  MIN_PASSWORD_SCORE,
  authErrorMessage,
  isValidEmail,
  passwordStrength,
} from "./authMessages";
import { Captcha, captchaEnabled } from "./Captcha";
import type { AuthMode } from "./AuthModalProvider";

const INPUT =
  "w-full rounded-xl border bg-[var(--card)] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--muted-2)] focus:ring-2 focus:ring-[var(--brand-soft)]";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

const GUC_RENGI = ["bg-[var(--mist-2)]", "bg-[var(--down)]", "bg-[var(--gold)]", "bg-[var(--brand)]", "bg-[var(--up)]"];

type Ekran = AuthMode | "sifirla";

/**
 * Giriş / kayıt / şifre sıfırlama panelinin tamamı.
 *
 * Hem modal içinde hem /giris ve /kayit sayfalarında aynı bileşen kullanılır:
 * iki ayrı uygulama tutmak, birinde düzeltilen hatanın diğerinde kalması demek.
 */
export function AuthPanel({
  initialMode = "giris",
  onDone,
  compact = false,
}: {
  initialMode?: AuthMode;
  /** Modal içinde başarılı akış sonrası kapatmak için */
  onDone?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const uid = useId();

  const [ekran, setEkran] = useState<Ekran>(initialMode);
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [kosul, setKosul] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [dokunulan, setDokunulan] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);

  const guc = passwordStrength(sifre);
  const emailGecerli = isValidEmail(email);
  const emailHata = dokunulan.email && email.length > 0 && !emailGecerli;
  const sifreHata = ekran === "kayit" && dokunulan.sifre && sifre.length > 0 && guc.score < MIN_PASSWORD_SCORE;

  if (!supabase) {
    return (
      <div className="rounded-xl bg-[var(--gold-soft)] p-4 text-sm leading-relaxed text-[var(--gold-ink)] ring-1 ring-[color-mix(in_oklab,var(--gold)_30%,transparent)]">
        <strong>Demo modu:</strong> Üyelik için Supabase bağlantısı gerekir. Anahtarları{" "}
        <code>.env.local</code> dosyasına ekleyince giriş ve Google ile giriş otomatik aktifleşir.
        Favoriler üyeliksiz de çalışır.
      </div>
    );
  }

  function alanUyari(hata: boolean) {
    return cn(INPUT, hata ? "border-[var(--down)]" : "border-[var(--line)] focus:border-[var(--brand)]");
  }

  async function google() {
    setMsg(null);
    setBusy("google");
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Başarılıysa tarayıcı Google'a gider; buraya dönmek hata demektir.
    if (error) {
      setMsg({ kind: "error", text: authErrorMessage(error) });
      setBusy(null);
    }
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setDokunulan({ email: true, sifre: true });
    setMsg(null);

    if (!emailGecerli) {
      setMsg({ kind: "error", text: "E-posta adresi geçerli görünmüyor." });
      return;
    }
    if (ekran === "kayit") {
      if (guc.score < MIN_PASSWORD_SCORE) {
        setMsg({ kind: "error", text: guc.hint });
        return;
      }
      if (!kosul) {
        setMsg({ kind: "error", text: "Devam etmek için kullanım koşullarını kabul etmelisiniz." });
        return;
      }
    }

    // Doğrulama açıksa jeton olmadan istek göndermek anlamsız: Supabase reddeder
    // ve kullanıcı ham captcha hatası görür.
    if (captchaEnabled() && !captcha) {
      setMsg({ kind: "error", text: "Bot doğrulamasını tamamlayın." });
      return;
    }

    setBusy("form");
    try {
      if (ekran === "sifirla") {
        const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: captcha ?? undefined,
        });
        if (error) throw error;
        setMsg({ kind: "info", text: "Sıfırlama bağlantısı e-postanıza gönderildi." });
      } else if (ekran === "kayit") {
        // Kullanıcı adı sorulmuyor: kimlik e-postadır. Görünen ad, veritabanı
        // tetikleyicisi tarafından e-postadan türetilir (bkz. 0001_init.sql).
        const { error } = await supabase!.auth.signUp({
          email: email.trim(),
          password: sifre,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            captchaToken: captcha ?? undefined,
          },
        });
        if (error) throw error;
        setMsg({
          kind: "info",
          text: "Kayıt alındı. E-postanıza gelen doğrulama bağlantısına tıklayın; hesabınız o zaman aktifleşir.",
        });
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password: sifre });
        if (error) throw error;
        onDone?.();
        router.refresh();
      }
    } catch (err) {
      setMsg({ kind: "error", text: authErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  }

  const baslik =
    ekran === "kayit" ? "Hesap oluştur" : ekran === "sifirla" ? "Şifreni sıfırla" : "Tekrar hoş geldin";
  const altBaslik =
    ekran === "kayit"
      ? "Deneyimini paylaş, oylarını ve favorilerini her cihazda yanında taşı."
      : ekran === "sifirla"
        ? "Hesabının e-posta adresini yaz; sıfırlama bağlantısını gönderelim."
        : "Oylarını, favorilerini ve yorumlarını kaldığın yerden sürdür.";

  return (
    <div className={compact ? "" : "space-y-5"}>
      {/* Giriş ve kayıt aynı pencerede: kullanıcı hangi durumda olduğunu görmeden
          önce hangi formu doldurduğunu bilmeli. Ayrı sayfalara bölmek, "hesabım
          var mıydı?" diye düşünen kullanıcıyı gidip gelmeye zorluyor. */}
      {ekran !== "sifirla" && (
        <div
          role="tablist"
          aria-label="Giriş veya kayıt"
          className="mb-4 flex gap-1 rounded-[12px] bg-[var(--mist)] p-1"
        >
          {(["giris", "kayit"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={ekran === m}
              onClick={() => {
                setEkran(m);
                setMsg(null);
              }}
              className={cn(
                "flex-1 rounded-[9px] py-2 text-sm font-bold transition-colors",
                ekran === m
                  ? "bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-card)]"
                  : "text-[var(--muted)] hover:text-[var(--ink-2)]"
              )}
            >
              {m === "giris" ? "Giriş yap" : "Kayıt ol"}
            </button>
          ))}
        </div>
      )}

      <div className={compact ? "mb-4" : ""}>
        {ekran === "sifirla" && (
          <button
            type="button"
            onClick={() => setEkran("giris")}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
          >
            <ArrowLeft size={13} /> Girişe dön
          </button>
        )}
        <h2 className="text-xl font-extrabold tracking-tight">{baslik}</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{altBaslik}</p>
      </div>

      {ekran !== "sifirla" && (
        <>
          {/* Google en üstte: kullanıcıların çoğu tek tıkla girmeyi tercih ediyor,
              formu doldurttuktan sonra sunmak boşuna emek harcatır. */}
          <button
            type="button"
            onClick={google}
            disabled={busy !== null}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--card)] py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--mist)] disabled:opacity-60"
          >
            {busy === "google" ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Google ile devam et
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-[var(--muted-2)]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            veya e-posta ile
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>
        </>
      )}

      <form onSubmit={gonder} className="space-y-3.5">
        <div>
          <label htmlFor={`${uid}-email`} className="mb-1 block text-xs font-semibold text-[var(--ink-2)]">
            E-posta
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setDokunulan((d) => ({ ...d, email: true }))}
            placeholder="ornek@eposta.com"
            autoComplete="email"
            aria-invalid={emailHata || undefined}
            aria-describedby={emailHata ? `${uid}-email-hata` : undefined}
            className={alanUyari(!!emailHata)}
          />
          {emailHata && (
            <p id={`${uid}-email-hata`} className="mt-1 text-xs text-[var(--down)]">
              Adreste bir eksik var gibi — @ ve alan adını kontrol edin.
            </p>
          )}
        </div>

        {ekran !== "sifirla" && (
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label htmlFor={`${uid}-sifre`} className="block text-xs font-semibold text-[var(--ink-2)]">
                Şifre
              </label>
              {ekran === "giris" && (
                <button
                  type="button"
                  onClick={() => setEkran("sifirla")}
                  className="text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  Şifremi unuttum
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id={`${uid}-sifre`}
                type={sifreGoster ? "text" : "password"}
                required
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                onBlur={() => setDokunulan((d) => ({ ...d, sifre: true }))}
                placeholder={ekran === "kayit" ? "En az 8 karakter" : "Şifreniz"}
                autoComplete={ekran === "kayit" ? "new-password" : "current-password"}
                aria-invalid={sifreHata || undefined}
                className={cn(alanUyari(!!sifreHata), "pr-11")}
              />
              <button
                type="button"
                onClick={() => setSifreGoster((v) => !v)}
                aria-label={sifreGoster ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
              >
                {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {ekran === "kayit" && sifre.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i <= guc.score ? GUC_RENGI[guc.score] : "bg-[var(--mist-2)]"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <span className="font-semibold text-[var(--ink-2)]">{guc.label}.</span> {guc.hint}
                </p>
              </div>
            )}
          </div>
        )}

        {ekran === "kayit" && (
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
            <input
              type="checkbox"
              checked={kosul}
              onChange={(e) => setKosul(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
            />
            <span>
              Kullanım koşullarını ve gizlilik politikasını kabul ediyorum. Oy verirken hesabımın
              ağırlıklandırıldığını biliyorum.
            </span>
          </label>
        )}

        {/* Bot doğrulaması kayıt ve şifre sıfırlamada; girişte yok, çünkü giriş
            için zaten geçerli bir hesap gerekiyor ve orada asıl koruma şifre. */}
        {ekran !== "giris" && <Captcha onToken={setCaptcha} />}

        {msg && (
          <p
            role={msg.kind === "error" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-2 rounded-xl p-3 text-sm leading-relaxed",
              msg.kind === "error"
                ? "bg-[var(--down-soft)] text-[var(--down)]"
                : "bg-[var(--up-soft)] text-[var(--up)]"
            )}
          >
            {msg.kind === "error" ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            )}
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-ink)] disabled:opacity-60"
        >
          {busy === "form" && <Loader2 size={16} className="animate-spin" />}
          {ekran === "kayit" ? "Hesabı oluştur" : ekran === "sifirla" ? "Sıfırlama bağlantısı gönder" : "Giriş yap"}
        </button>
      </form>

      {/* Sekmeler zaten geçiş sağlıyor; altta ikinci bir "kayıt ol" bağlantısı
          aynı işi iki yerden yaptırıp hangisinin doğru olduğunu belirsizleştirir. */}
      {ekran === "kayit" && (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--muted-2)]">
          <Mail size={13} className="mt-0.5 shrink-0" />
          Kayıttan sonra e-posta doğrulaması gerekir. Doğrulanmamış hesapların oyu sayılmaz.
          Ayrı kullanıcı adı yok; hesabın e-posta adresinle tanımlanır.
        </p>
      )}
    </div>
  );
}
