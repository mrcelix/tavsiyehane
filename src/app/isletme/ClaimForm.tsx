"use client";

import { AlertCircle, Check, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";

/**
 * İşletme başvuru formu.
 *
 * Eskiden hiçbir yere yazmıyordu: `setSent(true)` deyip "Başvurunuz alındı,
 * editör ekibi sizinle iletişime geçecek" gösteriyordu. Artık başvuru gerçekten
 * kaydediliyor (api/isletme → 0010_business_claims) ve panelde görünüyor.
 *
 * METİN: "iletişime geçecek" ifadesi korundu ama neye dayandığı netleşti —
 * başvuru panele düşüyor ve oradan insan takip ediyor. Olmayan bir otomatik
 * akış vaat edilmiyor.
 */
export function ClaimForm() {
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "gonderildi">("bos");
  const [hata, setHata] = useState<string | null>(null);

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setDurum("gonderiliyor");

    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/isletme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business: fd.get("isletme"),
          contactName: fd.get("yetkili"),
          email: fd.get("eposta"),
          phone: fd.get("telefon"),
          category: fd.get("kategori"),
          note: fd.get("tanitim"),
        }),
      });
      const veri = await r.json().catch(() => null);

      if (veri?.demo) {
        setHata("Bu kurulumda başvuru alma kapalı.");
        setDurum("bos");
        return;
      }
      if (!r.ok || veri?.error) {
        setHata(veri?.error ?? "Başvuru kaydedilemedi. Lütfen biraz sonra tekrar deneyin.");
        setDurum("bos");
        return;
      }
      setDurum("gonderildi");
    } catch {
      setHata("Bağlantı kurulamadı. Lütfen biraz sonra tekrar deneyin.");
      setDurum("bos");
    }
  }

  if (durum === "gonderildi")
    return (
      <div className="rounded-xl bg-[var(--up-soft)] p-4 text-sm text-[var(--up)]">
        <span className="flex items-center gap-2 font-semibold">
          <Check size={16} />
          Başvurunuz alındı.
        </span>
        <span className="mt-1 block text-xs opacity-80">
          Kaydedildi ve editör panelinde görünüyor. Belge doğrulaması için bıraktığınız adresten iletişime geçilir.
        </span>
      </div>
    );

  return (
    <form onSubmit={gonder} className="grid gap-3 sm:grid-cols-2">
      <Input required name="isletme" minLength={2} maxLength={160} placeholder="İşletme adı" aria-label="İşletme adı" className="w-full" />
      <Input
        required
        name="yetkili"
        minLength={2}
        maxLength={120}
        placeholder="Yetkili adı soyadı"
        aria-label="Yetkili adı soyadı"
        className="w-full"
      />
      <Input
        required
        name="eposta"
        type="email"
        maxLength={200}
        placeholder="Kurumsal e-posta"
        aria-label="Kurumsal e-posta"
        className="w-full"
      />
      <Input required name="telefon" type="tel" minLength={7} maxLength={40} placeholder="Telefon" aria-label="Telefon" className="w-full" />
      <Select required name="kategori" defaultValue="" aria-label="Kategori" className="w-full sm:col-span-2">
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
        name="tanitim"
        rows={3}
        maxLength={2000}
        placeholder="Kısaca işletmenizi tanıtın (isteğe bağlı)"
        aria-label="İşletme tanıtımı"
        className="w-full sm:col-span-2"
      />

      {hata && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--down-soft)] p-2.5 text-xs font-medium text-[var(--down)] sm:col-span-2">
          <AlertCircle size={14} className="mt-px shrink-0" />
          {hata}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={durum === "gonderiliyor"}
        className="w-full sm:col-span-2"
      >
        <Send size={15} />
        {durum === "gonderiliyor" ? "Gönderiliyor…" : "Başvuruyu Gönder"}
      </Button>
    </form>
  );
}
