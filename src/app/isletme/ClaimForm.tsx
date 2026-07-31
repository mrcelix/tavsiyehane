"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";

export function ClaimForm() {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[var(--up-soft)] p-4 text-sm font-semibold text-[var(--up)]">
        <Check size={16} />
        Başvurunuz alındı. Editör ekibi belge doğrulaması için sizinle iletişime geçecek.
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
      <Input required placeholder="İşletme adı" aria-label="İşletme adı" />
      <Input required placeholder="Yetkili adı soyadı" aria-label="Yetkili adı soyadı" />
      <Input required type="email" placeholder="Kurumsal e-posta" aria-label="Kurumsal e-posta" />
      <Input required type="tel" placeholder="Telefon" aria-label="Telefon" />
      <Select required defaultValue="" aria-label="Kategori" className="sm:col-span-2">
        <option value="" disabled>
          Kategori seçin
        </option>
        <option>Ev Temizliği</option>
        <option>Nakliye</option>
        <option>Teknik Servis</option>
        <option>Restoran</option>
        <option>Kafe</option>
        <option>Otel</option>
        <option>Diğer</option>
      </Select>
      <Textarea
        rows={3}
        placeholder="Kısaca işletmenizi tanıtın (isteğe bağlı)"
        aria-label="İşletme tanıtımı"
        className="sm:col-span-2"
      />
      <Button type="submit" variant="primary" size="lg" className="sm:col-span-2">
        <Send size={15} />
        Başvuruyu Gönder
      </Button>
    </form>
  );
}
