"use client";

import { Button } from "@/components/ui/Button";
import { useAuthModal, type AuthMode } from "./AuthModalProvider";

/**
 * Giriş modalını açan buton. Header sunucu bileşeni olduğu için tetikleyici
 * ayrı bir istemci bileşenidir; böylece tüm başlık istemciye taşınmaz.
 */
export function AuthTrigger({
  mode = "giris",
  label = "Giriş",
  variant = "ghost",
  reason,
}: {
  mode?: AuthMode;
  label?: string;
  variant?: "ghost" | "primary" | "outline";
  reason?: string;
}) {
  const { open } = useAuthModal();
  return (
    /* `sm` boyutu 32px; header'daki tek metin düğmesi bu ve mobilde parmakla
       ıskalanıyordu. Yalnızca dar ekranda 44px'e çıkıyor. */
    <Button variant={variant} size="sm" className="max-sm:min-h-11" onClick={() => open(mode, reason)}>
      {label}
    </Button>
  );
}
