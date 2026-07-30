"use client";

import { useState } from "react";

/** Hizmet detayındaki "Teklif Al" formu (demo: yerel onay gösterir). */
export function QuoteForm({ businessName }: { businessName: string }) {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
        ✓ Teklif talebiniz {businessName} firmasına iletildi. Genellikle 24 saat içinde dönüş yapılır.
        <span className="mt-1 block text-xs opacity-75">(Demo sürümde talep gerçek işletmeye gönderilmez.)</span>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-3"
    >
      <input
        required
        placeholder="Adınız"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        required
        placeholder="Telefon veya e-posta"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        required
        rows={3}
        placeholder="İhtiyacınızı kısaca anlatın (tarih, adres, işin kapsamı…)"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
        📨 Ücretsiz Teklif Al
      </button>
      <p className="text-xs text-zinc-400">İletişim bilgileriniz yalnızca bu işletmeyle paylaşılır.</p>
    </form>
  );
}
