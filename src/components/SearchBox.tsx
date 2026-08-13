"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  }

  /*
   * DÜZEN: mutlak konumlandırma değil, flex satırı.
   *
   * Buton `absolute right-2` ile konumlandırılıyordu ama `.btn-shine` kendi
   * parıltı efekti için `position: relative` tanımlıyor ve Tailwind'in
   * `absolute` yardımcı sınıfını eziyordu. Sonuç: buton akışın içinde kalıp
   * kutunun ortasına düşüyor ve yer tutucu metnin üstüne biniyordu.
   *
   * Flex satırında konumlandırmaya gerek yok, dolayısıyla çakışacak bir şey de
   * yok. `min-w-0 flex-1` girdinin butonun altına taşmasını da engelliyor —
   * eski `pr-32` tahmini yer tutucu metin uzayınca yetmiyordu (390px alana
   * 479px'lik metin).
   */
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="group flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--paper)] py-2 pl-4 pr-2 shadow-[var(--shadow-soft)] transition-colors focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
        <Search
          size={20}
          className="pointer-events-none shrink-0 text-[var(--muted-2)] transition-colors group-focus-within:text-[var(--brand)]"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ne arıyorsun? Örn: 25.000 TL altı telefon"
          aria-label="Arama"
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]"
        />
        <button
          type="submit"
          className="btn-shine h-10 shrink-0 rounded-xl bg-[var(--gold)] px-5 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-colors hover:bg-[var(--gold-ink)]"
        >
          Ara
        </button>
      </div>
    </form>
  );
}
