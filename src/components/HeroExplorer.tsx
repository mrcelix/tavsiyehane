"use client";

import Link from "next/link";
import { ArrowRight, Handshake, MapPinned, Package } from "lucide-react";
import { useState } from "react";
import type { ItemType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./ui/Button";
import { RankBadge } from "./RankBadge";

/**
 * Hero'daki canlı keşif kartı.
 *
 * Buradaki asıl fark, eskisinin bir FORM olmasıydı: kullanıcı dört kutuyu
 * doldurup "getir"e basana kadar sitenin elinde ne olduğunu göremiyordu. Şimdi
 * tersi — tipe dokunduğu anda gerçek kategoriler, kategoriye dokunduğu anda
 * gerçek ilk beş çıkıyor. Hiçbir adım sayfa değiştirmiyor, tek gezinme sonda.
 *
 * Adım adım daraltmayı tercih edenler için sihirbaz duruyor (`/ara?sihirbaz=1`);
 * bütçe ve öncelik seçimleri orada, hero'daki kutulardan taşınmadan.
 *
 * Veri sunucuda hazırlanır (bkz. app/page.tsx): kategori başına yalnızca ilk beş
 * kayıt taşınır, tüm katalog istemciye inmez.
 */

export interface HeroTopItem {
  slug: string;
  title: string;
  brand: string;
  score: number;
  href: string;
}

export interface HeroCategory {
  slug: string;
  name: string;
  type: ItemType;
  /** Kategorideki toplam kayıt — ilk beşin kaçtan seçildiğini gösterir. */
  count: number;
  href: string;
  top: HeroTopItem[];
}

const TABS: { value: ItemType; label: string; icon: React.ReactNode }[] = [
  { value: "urun", label: "Ürün", icon: <Package size={15} /> },
  { value: "hizmet", label: "Hizmet", icon: <Handshake size={15} /> },
  { value: "mekan", label: "Mekân", icon: <MapPinned size={15} /> },
];

export function HeroExplorer({ categories }: { categories: HeroCategory[] }) {
  const [type, setType] = useState<ItemType>("urun");
  const [secilenSlug, setSecilenSlug] = useState<string | null>(null);

  const kategoriler = categories.filter((c) => c.type === type);
  /*
   * Seçim tip değişince sıfırlanmıyor, düşüyor: başka tipin slug'ı listede
   * bulunmaz ve ilk kategoriye dönülür. Tipler arasında gidip gelen kullanıcı
   * seçimini kaybetmiyor, ayrıca sıfırlayan bir effect'e de gerek kalmıyor.
   */
  const aktif = kategoriler.find((c) => c.slug === secilenSlug) ?? kategoriler[0];

  if (!aktif) return null;

  return (
    <div className="mx-auto w-full rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-pop)] sm:p-5">
      {/* Başlık solda, tip seçimi sağ üstte: sekmeler kendi satırını bırakınca
          kart bir satır kısalıyor ve "ne seçiyorum" ile "neye göre seçiyorum"
          aynı hizada duruyor. Dar ekranda alt alta düşer, sekmeler tam genişlik
          alır. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-bold tracking-tight">Ne tavsiye ediliyor?</p>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">Tip seç, kategoriyi gör, listeyi aç</p>
        </div>

        <div
          role="tablist"
          aria-label="Ne arıyorsun?"
          className="flex rounded-[12px] bg-[var(--mist)] p-1 max-sm:w-full"
        >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={type === t.value}
            onClick={() => setType(t.value)}
            className={cn(
              // Mobilde 44px: parmakla vurulacak hedef, imleçle vurulacak
              // hedefle aynı boyutta olamaz.
              "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-all max-sm:min-h-11 max-sm:flex-1",
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
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] sm:gap-5">
        {/* Kategori listesi */}
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Kategori · <span className="font-num">{kategoriler.length}</span>
          </p>
          {/* Mobilde yatay kaydırılan şerit, masaüstünde alt alta liste.
              Altı kategoriyi telefonda alt alta dizmek kartı 270px uzatıyor ve
              hero'yu iki ekrana çıkarıyordu; şeritte hepsi tek satırda ve
              dokunma hedefi de büyüyor. */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-col sm:gap-1 sm:overflow-x-visible sm:pb-0">
            {kategoriler.map((c) => {
              const acik = c.slug === aktif.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSecilenSlug(c.slug)}
                  aria-pressed={acik}
                  className={cn(
                    "flex shrink-0 items-center justify-between gap-2 rounded-[10px] border px-3 py-2 text-left text-[13px] font-semibold whitespace-nowrap transition-colors",
                    "max-sm:min-h-11 sm:w-full sm:shrink sm:whitespace-normal",
                    acik
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                      : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--brand)]/40 hover:bg-[var(--mist)]"
                  )}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="font-num text-[11px] text-[var(--muted-2)]">{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçilen kategorinin ilk beşi. `aria-live`: seçim değişince ekran
            okuyucu da yeni listeyi duyar, sessizce değişmez. */}
        <div className="min-w-0" aria-live="polite">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-bold tracking-tight">{aktif.name}</p>
            <span className="shrink-0 font-num text-[11px] text-[var(--muted-2)]">{aktif.count} kayıt</span>
          </div>

          {aktif.top.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">Bu kategoride henüz yayımlanmış kayıt yok.</p>
          ) : (
            <ol className="flex flex-col">
              {aktif.top.map((it, i) => (
                <li key={it.slug}>
                  <Link
                    href={it.href}
                    className="group flex items-center gap-2.5 rounded-[10px] px-1.5 py-1.5 transition-colors hover:bg-[var(--mist)]"
                  >
                    <RankBadge rank={i + 1} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold leading-tight transition-colors group-hover:text-[var(--brand)]">
                        {it.title}
                      </span>
                      <span className="block truncate text-[11px] text-[var(--muted-2)]">{it.brand}</span>
                    </span>
                    <span className="shrink-0 font-num text-[13px] font-bold text-[var(--brand)]">{it.score}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <ButtonLink href={aktif.href} variant="gold" size="lg" shine className="mt-3 w-full font-bold">
            Listeyi aç ve karşılaştır
            <ArrowRight size={15} />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
