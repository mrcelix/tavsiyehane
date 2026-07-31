"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export function ClaimForm() {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="rounded-xl bg-[var(--up-soft)] p-4 text-sm text-[var(--up)] ring-1 ring-[color-mix(in_oklab,var(--up)_30%,transparent)]">
        ✓ Başvurunuz alındı. Editör ekibi belge doğrulaması için sizinle iletişime geçecek.
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input required placeholder="İşletme adı" className={inputCls} />
      <input required placeholder="Yetkili adı soyadı" className={inputCls} />
      <input required type="email" placeholder="Kurumsal e-posta" className={inputCls} />
      <input required placeholder="Telefon" className={inputCls} />
      <select required className={`${inputCls} sm:col-span-2`} defaultValue="">
        <option value="" disabled>Kategori seçin</option>
        <option>Ev Temizliği</option>
        <option>Nakliye</option>
        <option>Teknik Servis</option>
        <option>Restoran</option>
        <option>Kafe</option>
        <option>Otel</option>
        <option>Diğer</option>
      </select>
      <textarea rows={3} placeholder="Kısaca işletmenizi tanıtın (isteğe bağlı)" className={`${inputCls} sm:col-span-2`} />
      <button type="submit" className="rounded-lg bg-[var(--brand)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-ink)] sm:col-span-2">
        Başvuruyu Gönder
      </button>
    </form>
  );
}
