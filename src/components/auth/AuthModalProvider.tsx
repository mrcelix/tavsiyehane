"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AuthModal } from "./AuthModal";

export type AuthMode = "giris" | "kayit";

interface AuthModalState {
  /** Modalı açar. `reason` verilirse başlıkta neden giriş gerektiği yazar. */
  open: (mode?: AuthMode, reason?: string) => void;
  close: () => void;
}

const Ctx = createContext<AuthModalState | null>(null);

/**
 * Giriş/kayıt modalı tek bir yerden yönetilir: header butonu, yorum formu ve
 * oylama gibi giriş isteyen her yer aynı modalı açar. Ayrı sayfaya yönlendirmek
 * kullanıcının bulunduğu bağlamı kaybettirir — yorum yazarken sayfadan çıkmak,
 * yazdıklarını da götürür.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [durum, setDurum] = useState<{ mode: AuthMode; reason?: string } | null>(null);

  const open = useCallback((mode: AuthMode = "giris", reason?: string) => setDurum({ mode, reason }), []);
  const close = useCallback(() => setDurum(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {durum && <AuthModal initialMode={durum.mode} reason={durum.reason} onClose={close} />}
    </Ctx.Provider>
  );
}

export function useAuthModal(): AuthModalState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal, AuthModalProvider içinde çağrılmalı");
  return ctx;
}
