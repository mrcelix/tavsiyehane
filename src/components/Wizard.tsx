"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, ItemType } from "@/lib/types";

interface Props {
  categories: Category[];
  cities: string[];
}

const PRIORITIES: Record<ItemType, { key: string; label: string }[]> = {
  urun: [
    { key: "fiyatPerformans", label: "💰 Fiyat-performans" },
    { key: "teknikOzellikler", label: "⚙️ En iyi özellikler" },
    { key: "kullaniciMemnuniyeti", label: "⭐ Kullanıcı memnuniyeti" },
    { key: "garantiServis", label: "🛡️ Garanti ve servis" },
  ],
  hizmet: [
    { key: "dogrulanmisDegerlendirme", label: "⭐ Güvenilirlik" },
    { key: "fiyatSeffafligi", label: "💰 Net fiyat" },
    { key: "ulasilabilirlik", label: "⚡ Hızlı randevu" },
    { key: "uzmanlikDeneyim", label: "🎓 Uzmanlık" },
  ],
  mekan: [
    { key: "amacaUygunluk", label: "🎯 Amaca uygunluk" },
    { key: "fiyatSeviyesi", label: "💰 Uygun fiyat" },
    { key: "konum", label: "📍 Konum" },
    { key: "degerlendirmeKalitesi", label: "⭐ Yorum kalitesi" },
  ],
};

const TYPE_OPTS: { value: ItemType; label: string; desc: string }[] = [
  { value: "urun", label: "🛒 Ürün", desc: "Telefon, robot süpürge, kedi ürünleri…" },
  { value: "hizmet", label: "🤝 Hizmet", desc: "Temizlik, nakliye, teknik servis…" },
  { value: "mekan", label: "📍 Mekân", desc: "Restoran, kafe, otel…" },
];

const optionCls =
  "w-full rounded-xl border-2 p-4 text-left transition hover:border-indigo-400 dark:hover:border-indigo-500";
const idle = "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900";

export function Wizard({ categories, cities }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ItemType | null>(null);
  const [category, setCategory] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const cats = categories.filter((c) => c.type === type);
  const needsCity = type !== "urun";
  const steps = needsCity ? 5 : 4;

  function finish(city?: string) {
    const p = new URLSearchParams();
    if (type) p.set("tip", type);
    if (category) p.set("kategori", category);
    if (budget) p.set("butce", budget);
    if (priority) p.set("oncelik", priority);
    if (city) p.set("sehir", city);
    router.push(`/ara?${p.toString()}`);
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-lg font-bold">1. Ne arıyorsun?</h2>
          <div className="mt-4 space-y-2.5">
            {TYPE_OPTS.map((o) => (
              <button key={o.value} className={`${optionCls} ${idle}`} onClick={() => { setType(o.value); setCategory(""); setStep(1); }}>
                <span className="font-semibold">{o.label}</span>
                <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{o.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && type && (
        <div>
          <h2 className="text-lg font-bold">2. Hangi kategori?</h2>
          <div className="mt-4 space-y-2.5">
            {cats.map((c) => (
              <button key={c.slug} className={`${optionCls} ${idle}`} onClick={() => { setCategory(c.slug); setStep(2); }}>
                <span className="font-semibold">{c.icon} {c.name}</span>
              </button>
            ))}
            <button className={`${optionCls} ${idle} text-zinc-500`} onClick={() => { setCategory(""); setStep(2); }}>
              Fark etmez, hepsine bak
            </button>
          </div>
        </div>
      )}

      {step === 2 && type && (
        <div>
          <h2 className="text-lg font-bold">3. Bütçen nedir?</h2>
          <div className="mt-4 space-y-2.5">
            {type === "mekan" ? (
              <>
                {[
                  { v: "1", l: "₺ — Ekonomik" },
                  { v: "2", l: "₺₺ — Orta" },
                  { v: "3", l: "₺₺₺ — Yüksek" },
                  { v: "4", l: "₺₺₺₺ — Fark etmez / Premium" },
                ].map((o) => (
                  <button key={o.v} className={`${optionCls} ${idle}`} onClick={() => { setBudget(o.v); setStep(3); }}>
                    <span className="font-semibold">{o.l}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Üst sınır (TL) — örn. 25000"
                    className="flex-1 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <button
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-indigo-600 px-5 font-semibold text-white hover:bg-indigo-500"
                  >
                    İleri
                  </button>
                </div>
                <button className={`${optionCls} ${idle} text-zinc-500`} onClick={() => { setBudget(""); setStep(3); }}>
                  Bütçe sınırım yok
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {step === 3 && type && (
        <div>
          <h2 className="text-lg font-bold">4. En önemli önceliğin?</h2>
          <div className="mt-4 space-y-2.5">
            {PRIORITIES[type].map((o) => (
              <button
                key={o.key}
                className={`${optionCls} ${idle}`}
                onClick={() => {
                  setPriority(o.key);
                  if (needsCity) setStep(4);
                  else {
                    // ürünlerde şehir adımı yok — doğrudan sonuç
                    const p = new URLSearchParams();
                    p.set("tip", type);
                    if (category) p.set("kategori", category);
                    if (budget) p.set("butce", budget);
                    p.set("oncelik", o.key);
                    router.push(`/ara?${p.toString()}`);
                  }
                }}
              >
                <span className="font-semibold">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && needsCity && (
        <div>
          <h2 className="text-lg font-bold">5. Hangi şehirde?</h2>
          <div className="mt-4 space-y-2.5">
            {cities.map((c) => (
              <button key={c} className={`${optionCls} ${idle}`} onClick={() => finish(c)}>
                <span className="font-semibold">📍 {c}</span>
              </button>
            ))}
            <button className={`${optionCls} ${idle} text-zinc-500`} onClick={() => finish()}>
              Fark etmez
            </button>
          </div>
        </div>
      )}

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-5 text-sm font-medium text-zinc-400 hover:text-indigo-600">
          ← Geri
        </button>
      )}
    </div>
  );
}
