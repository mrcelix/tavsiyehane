"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Field";

/** Hizmet detayındaki "Teklif Al" formu (demo: yerel onay gösterir). */
export function QuoteForm({ businessName }: { businessName: string }) {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="rounded-xl bg-[var(--up-soft)] p-4 text-sm text-[var(--up)]">
        <span className="flex items-center gap-2 font-semibold">
          <Check size={16} />
          Teklif talebiniz {businessName} firmasına iletildi.
        </span>
        <span className="mt-1 block text-xs opacity-80">
          Genellikle 24 saat içinde dönüş yapılır. (Demo sürümde talep gerçek işletmeye gönderilmez.)
        </span>
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
      <Input required placeholder="Adınız" />
      <Input required placeholder="Telefon veya e-posta" />
      <Textarea required rows={3} placeholder="İhtiyacınızı kısaca anlatın (tarih, adres, işin kapsamı…)" />
      <Button type="submit" variant="gold" size="lg" shine className="w-full">
        <Send size={15} />
        Ücretsiz Teklif Al
      </Button>
      <p className="text-xs text-[var(--muted)]">İletişim bilgileriniz yalnızca bu işletmeyle paylaşılır.</p>
    </form>
  );
}
