"use client";

import { Handshake, MapPinned, Package, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PRIORITIES } from "@/lib/priorities";
import type { ItemType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Field";

export interface PickerCategory {
  slug: string;
  name: string;
  type: ItemType;
}

interface Props {
  categories: PickerCategory[];
  /** Tipe göre şehir listesi — ürünlerde boştur. */
  citiesByType: Record<ItemType, string[]>;
}

const TABS: { value: ItemType; label: string; icon: React.ReactNode }[] = [
  { value: "urun", label: "Ürün", icon: <Package size={16} /> },
  { value: "hizmet", label: "Hizmet", icon: <Handshake size={16} /> },
  { value: "mekan", label: "Mekân", icon: <MapPinned size={16} /> },
];

const PRICE_LEVELS = [
  { v: "1", l: "₺ — Ekonomik" },
  { v: "2", l: "₺₺ — Orta" },
  { v: "3", l: "₺₺₺ — Yüksek" },
  { v: "4", l: "₺₺₺₺ — Premium" },
];

const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]";

/**
 * Hero'daki hızlı seçim formu. Sihirbazın adım adım akışının tek ekranlık hâli:
 * seçimler doğrudan /ara sonuç sayfasının parametrelerine çevrilir.
 */
export function HeroPicker({ categories, citiesByType }: Props) {
  const router = useRouter();
  const [type, setType] = useState<ItemType>("urun");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("");
  const [priority, setPriority] = useState("");

  const cats = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);
  const cities = citiesByType[type] ?? [];
  const showCity = type !== "urun" && cities.length > 0;

  function switchType(next: ItemType) {
    setType(next);
    // Tipe özgü alanlar sıfırlanır — aksi halde geçersiz kategori/öncelik taşınır.
    setCategory("");
    setBudget("");
    setCity("");
    setPriority("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    p.set("tip", type);
    if (category) p.set("kategori", category);
    if (budget) p.set("butce", budget);
    if (city) p.set("sehir", city);
    if (priority) p.set("oncelik", priority);
    router.push(`/ara?${p.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-pop)] sm:p-5"
    >
      {/* Tip seçimi */}
      <div
        role="tablist"
        aria-label="Ne arıyorsun?"
        className="mb-4 inline-flex rounded-[12px] bg-[var(--mist)] p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={type === t.value}
            onClick={() => switchType(t.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold transition-all",
              type === t.value
                ? "bg-[var(--paper)] text-[var(--ink)] shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-3", showCity ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
        <div>
          <label htmlFor="hp-kategori" className={LABEL}>
            Kategori
          </label>
          <Select id="hp-kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Hepsi</option>
            {cats.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="hp-butce" className={LABEL}>
            Bütçe
          </label>
          {type === "mekan" ? (
            <Select id="hp-butce" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Fark etmez</option>
              {PRICE_LEVELS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              id="hp-butce"
              type="number"
              inputMode="numeric"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Üst sınır (TL)"
              className="font-num"
            />
          )}
        </div>

        {showCity && (
          <div>
            <label htmlFor="hp-sehir" className={LABEL}>
              Şehir
            </label>
            <Select id="hp-sehir" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Tümü</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label htmlFor="hp-oncelik" className={LABEL}>
            Önceliğin
          </label>
          <Select id="hp-oncelik" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Genel tavsiye puanı</option>
            {PRIORITIES[type].map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          Seçimlerin, {type === "urun" ? "ürün" : type === "hizmet" ? "hizmet" : "mekân"} kategorisine özel puanlama
          modeliyle sıralanır.
        </p>
        <Button type="submit" variant="gold" size="lg" shine className="font-bold">
          <Sparkles size={16} />
          Tavsiye Getir
        </Button>
      </div>
    </form>
  );
}
