"use client";

import { AlertCircle, Check, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Field";

/**
 * Hizmet detayındaki "Teklif Al" formu.
 *
 * Eskiden hiçbir yere yazmıyordu: `setSent(true)` deyip "talebiniz iletildi"
 * gösteriyordu. Artık talep gerçekten kaydediliyor (api/teklif → 0009_quotes).
 *
 * METİN NEDEN "İLETİLDİ" DEĞİL "ALINDI": talep veritabanına yazılıyor ve
 * panelde görünüyor, ama işletmeye otomatik e-posta gitmiyor (SMTP yok).
 * Kullanıcıya olmayan bir bildirimi vaat etmek, formun eski hâlinin daha
 * kibar bir sürümü olurdu.
 */
export function QuoteForm({ itemId, businessName }: { itemId: string; businessName: string }) {
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "gonderildi">("bos");
  const [hata, setHata] = useState<string | null>(null);

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setDurum("gonderiliyor");

    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/teklif", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemId,
          name: fd.get("ad"),
          contact: fd.get("iletisim"),
          message: fd.get("mesaj"),
        }),
      });
      const veri = await r.json().catch(() => null);

      // Supabase yapılandırılmamışsa (demo kurulum) talep kaydedilemez;
      // bunu başarı gibi göstermiyoruz.
      if (veri?.demo) {
        setHata("Bu kurulumda teklif alma kapalı. Lütfen işletmeyle doğrudan iletişime geçin.");
        setDurum("bos");
        return;
      }
      if (!r.ok || veri?.error) {
        setHata(veri?.error ?? "Talep kaydedilemedi. Lütfen biraz sonra tekrar deneyin.");
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
          Teklif talebiniz alındı.
        </span>
        <span className="mt-1 block text-xs opacity-80">
          {businessName} için kaydedildi ve moderasyon panelinde görünüyor. İşletmeye iletildiğinde bıraktığınız
          iletişim adresinden dönüş yapılır.
        </span>
      </div>
    );

  return (
    <form onSubmit={gonder} className="space-y-3">
      <Input required name="ad" minLength={2} maxLength={120} placeholder="Adınız" />
      <Input required name="iletisim" minLength={5} maxLength={200} placeholder="Telefon veya e-posta" />
      <Textarea
        required
        name="mesaj"
        rows={3}
        minLength={10}
        maxLength={2000}
        placeholder="İhtiyacınızı kısaca anlatın (tarih, adres, işin kapsamı…)"
      />

      {hata && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--down-soft)] p-2.5 text-xs font-medium text-[var(--down)]">
          <AlertCircle size={14} className="mt-px shrink-0" />
          {hata}
        </p>
      )}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        shine
        disabled={durum === "gonderiliyor"}
        className="w-full font-bold"
      >
        <Send size={15} />
        {durum === "gonderiliyor" ? "Gönderiliyor…" : "Ücretsiz Teklif Al"}
      </Button>
      <p className="text-xs text-[var(--muted)]">İletişim bilgileriniz yalnızca bu işletmeyle paylaşılır.</p>
    </form>
  );
}
