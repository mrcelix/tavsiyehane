"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900";

export function ClaimForm() {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
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
      <button type="submit" className="rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 sm:col-span-2">
        Başvuruyu Gönder
      </button>
    </form>
  );
}
