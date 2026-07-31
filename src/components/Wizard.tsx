"use client";

import { ArrowLeft, ArrowRight, MapPin, Package, MapPinned, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryIcon } from "@/lib/category-icons";
import { PRIORITIES } from "@/lib/priorities";
import type { Category, ItemType } from "@/lib/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";

interface Props {
  categories: Category[];
  cities: string[];
}

const TYPE_OPTS: { value: ItemType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "urun",
    label: "Ürün",
    desc: "Telefon, robot süpürge, kedi ürünleri…",
    icon: <Package size={22} className="shrink-0 text-[var(--brand)]" />,
  },
  {
    value: "hizmet",
    label: "Hizmet",
    desc: "Temizlik, nakliye, teknik servis…",
    icon: <Handshake size={22} className="shrink-0 text-[var(--up)]" />,
  },
  {
    value: "mekan",
    label: "Mekân",
    desc: "Restoran, kafe, otel…",
    icon: <MapPinned size={22} className="shrink-0 text-[var(--gold-ink)]" />,
  },
];

const OPTION =
  "flex w-full items-center gap-3 rounded-xl border-2 border-[var(--line)] bg-[var(--paper)] p-4 text-left transition-all hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]";

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

  function go(extra: Record<string, string> = {}) {
    const p = new URLSearchParams();
    if (type) p.set("tip", type);
    if (category) p.set("kategori", category);
    if (budget) p.set("butce", budget);
    if (priority) p.set("oncelik", priority);
    Object.entries(extra).forEach(([k, v]) => v && p.set(k, v));
    router.push(`/ara?${p.toString()}`);
  }

  return (
    <div className="mx-auto max-w-xl rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: steps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-[var(--brand)]" : "bg-[var(--mist-2)]"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-lg font-bold">1. Ne arıyorsun?</h2>
          <div className="mt-4 space-y-2.5">
            {TYPE_OPTS.map((o) => (
              <button
                key={o.value}
                className={OPTION}
                onClick={() => {
                  setType(o.value);
                  setCategory("");
                  setStep(1);
                }}
              >
                {o.icon}
                <span>
                  <span className="block font-bold text-[var(--ink)]">{o.label}</span>
                  <span className="mt-0.5 block text-sm text-[var(--muted)]">{o.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && type && (
        <div>
          <h2 className="text-lg font-bold">2. Hangi kategori?</h2>
          <div className="mt-4 space-y-2.5">
            {cats.map((c) => {
              return (
                <button
                  key={c.slug}
                  className={OPTION}
                  onClick={() => {
                    setCategory(c.slug);
                    setStep(2);
                  }}
                >
                  <CategoryIcon slug={c.slug} size={20} className="shrink-0 text-[var(--brand)]" />
                  <span className="font-bold text-[var(--ink)]">{c.name}</span>
                </button>
              );
            })}
            <button
              className={`${OPTION} text-[var(--muted)]`}
              onClick={() => {
                setCategory("");
                setStep(2);
              }}
            >
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
              [
                { v: "1", l: "₺ — Ekonomik" },
                { v: "2", l: "₺₺ — Orta" },
                { v: "3", l: "₺₺₺ — Yüksek" },
                { v: "4", l: "₺₺₺₺ — Fark etmez / Premium" },
              ].map((o) => (
                <button
                  key={o.v}
                  className={OPTION}
                  onClick={() => {
                    setBudget(o.v);
                    setStep(3);
                  }}
                >
                  <span className="font-bold text-[var(--ink)]">{o.l}</span>
                </button>
              ))
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Üst sınır (TL) — örn. 25000"
                    className="h-12 w-full flex-1 font-num"
                  />
                  <Button variant="primary" size="lg" onClick={() => setStep(3)}>
                    İleri
                  </Button>
                </div>
                <button
                  className={`${OPTION} text-[var(--muted)]`}
                  onClick={() => {
                    setBudget("");
                    setStep(3);
                  }}
                >
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
                className={OPTION}
                onClick={() => {
                  setPriority(o.key);
                  if (needsCity) setStep(4);
                  else {
                    const p = new URLSearchParams();
                    p.set("tip", type);
                    if (category) p.set("kategori", category);
                    if (budget) p.set("butce", budget);
                    p.set("oncelik", o.key);
                    router.push(`/ara?${p.toString()}`);
                  }
                }}
              >
                <span className="font-bold text-[var(--ink)]">{o.label}</span>
                <ArrowRight size={16} className="ml-auto text-[var(--muted-2)]" />
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
              <button key={c} className={OPTION} onClick={() => go({ sehir: c })}>
                <MapPin size={18} className="shrink-0 text-[var(--brand)]" />
                <span className="font-bold text-[var(--ink)]">{c}</span>
              </button>
            ))}
            <button className={`${OPTION} text-[var(--muted)]`} onClick={() => go()}>
              Fark etmez
            </button>
          </div>
        </div>
      )}

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand)]"
        >
          <ArrowLeft size={14} /> Geri
        </button>
      )}
    </div>
  );
}
