"use client";

import type { ReactNode } from "react";

/**
 * Yıkıcı işlemler için onay isteyen form.
 *
 * Ayrı bir istemci bileşeni: panelin geri kalanı sunucuda çiziliyor, yalnızca
 * bu form olay dinleyicisine ihtiyaç duyuyor. Geri alınamayan bir işlemde
 * "yanlışlıkla tıkladım" en sık duyulan cümledir.
 */
export function Onayli({
  soru,
  children,
  ...rest
}: { soru: string; children: ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...rest}
      onSubmit={(e) => {
        if (!confirm(soru)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
