"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AuthPanel } from "./AuthPanel";
import type { AuthMode } from "./AuthModalProvider";

/**
 * Giriş/kayıt modalı.
 *
 * `<dialog showModal>` kullanılıyor: odak tuzağı, ESC ile kapatma ve arka planın
 * erişilebilirlik ağacından çıkarılması tarayıcıdan geliyor. Bunları elle yazmak
 * her seferinde bir köşesi eksik kalan bir iş.
 */
export function AuthModal({
  initialMode,
  reason,
  onClose,
}: {
  initialMode: AuthMode;
  reason?: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d || d.open) return;
    d.showModal();
    // Modal açıkken arka planın kaymaması için gövde kilitlenir.
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = onceki;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Yalnızca dış çerçeveye (backdrop) tıklandığında kapat.
        if (e.target === ref.current) ref.current?.close();
      }}
      aria-label="Giriş ve kayıt"
      className="overlay-dialog m-auto w-[min(440px,calc(100vw-2rem))] rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-0 text-[var(--ink)] shadow-[var(--shadow-pop)]"
    >
      <div className="relative max-h-[85vh] overflow-y-auto p-6">
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Kapat"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
        >
          <X size={18} />
        </button>

        {reason && (
          <p className="mb-4 rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-xs font-semibold leading-relaxed text-[var(--brand-ink)]">
            {reason}
          </p>
        )}

        <AuthPanel initialMode={initialMode} compact onDone={() => ref.current?.close()} />
      </div>
    </dialog>
  );
}
