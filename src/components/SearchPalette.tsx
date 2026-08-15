"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CornerDownLeft, FolderTree, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Gelişmiş arama paleti.
 *
 * `<dialog showModal>` kullanılıyor: odak tuzağı, ESC ile kapatma ve arka planın
 * erişilebilirlik ağacından çıkarılması tarayıcıdan geliyor — elle yazılan her
 * uygulamada bir köşesi eksik kalır.
 *
 * Açılış tetikleyicisi bir pencere olayı (`ARAMA_OLAYI`). Header'daki düğme ile
 * palet arasında üçüncü bir sağlayıcı katmanı kurmak yerine tek satırlık bir
 * olay yeterli; palet zaten tek örnek ve düzende bir kez çiziliyor.
 */

export const ARAMA_OLAYI = "tvh:arama";

export function aramayiAc() {
  window.dispatchEvent(new Event(ARAMA_OLAYI));
}

interface KayitOzet {
  slug: string;
  baslik: string;
  marka: string;
  tip: string;
  kategori: string;
  href: string;
  puan: number;
  dayanak: "topluluk" | "dis-sinyal" | "editor";
  fiyat: string | null;
  sehir: string | null;
}

interface KategoriOzet {
  ad: string;
  tip: string;
  href: string;
  adet: number;
}

interface Sonuc {
  sorgu: string;
  toplam: number;
  oneri: boolean;
  kayitlar: KayitOzet[];
  kategoriler: KategoriOzet[];
}

const BOS: Sonuc = { sorgu: "", toplam: 0, oneri: true, kayitlar: [], kategoriler: [] };

export function SearchPalette() {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [acik, setAcik] = useState(false);
  const [q, setQ] = useState("");
  const [sonuc, setSonuc] = useState<Sonuc>(BOS);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secili, setSecili] = useState(0);

  const ac = useCallback(() => setAcik(true), []);
  const kapat = useCallback(() => {
    setAcik(false);
    setQ("");
    setSonuc(BOS);
    setSecili(0);
  }, []);

  // Klavye kısayolları: Ctrl/Cmd+K ve "/" — ikisi de yaygın beklenti.
  useEffect(() => {
    function tus(e: KeyboardEvent) {
      const hedef = e.target as HTMLElement | null;
      const yaziyor =
        hedef?.tagName === "INPUT" || hedef?.tagName === "TEXTAREA" || hedef?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ac();
      } else if (e.key === "/" && !yaziyor) {
        // "/" yalnızca bir alana yazmıyorken; aksi halde metne bölü işareti
        // yazmak imkânsız hale gelir.
        e.preventDefault();
        ac();
      }
    }
    window.addEventListener("keydown", tus);
    window.addEventListener(ARAMA_OLAYI, ac);
    return () => {
      window.removeEventListener("keydown", tus);
      window.removeEventListener(ARAMA_OLAYI, ac);
    };
  }, [ac]);

  // Diyaloğu aç/kapat ve gövde kaydırmasını kilitle.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (acik && !d.open) {
      d.showModal();
      const onceki = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = onceki;
      };
    }
    if (!acik && d.open) d.close();
  }, [acik]);

  // Sorgu değişince sunucudan ara. 180 ms bekleme: her tuşta istek atmak
  // hem sunucuyu hem sonuçların titremesini gereksiz yorar.
  useEffect(() => {
    if (!acik) return;
    const kontrol = new AbortController();
    const zaman = setTimeout(async () => {
      setYukleniyor(true);
      try {
        const r = await fetch(`/api/ara?q=${encodeURIComponent(q)}`, { signal: kontrol.signal });
        if (r.ok) {
          setSonuc(await r.json());
          setSecili(0);
        }
      } catch {
        /* iptal edilen istek hata değildir */
      } finally {
        setYukleniyor(false);
      }
    }, 180);
    return () => {
      clearTimeout(zaman);
      kontrol.abort();
    };
  }, [q, acik]);

  const satirlar = [
    ...sonuc.kayitlar.map((k) => ({ tur: "kayit" as const, href: k.href, veri: k })),
    ...sonuc.kategoriler.map((k) => ({ tur: "kategori" as const, href: k.href, veri: k })),
  ];

  function git(href: string) {
    kapat();
    router.push(href);
  }

  function listeTusu(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSecili((s) => Math.min(s + 1, satirlar.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSecili((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hedef = satirlar[secili];
      if (hedef) git(hedef.href);
      else if (q.trim()) git(`/ara?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={kapat}
      onCancel={kapat}
      onClick={(e) => {
        if (e.target === ref.current) kapat();
      }}
      aria-label="Arama"
      className="overlay-dialog mx-auto mt-[8vh] w-[min(680px,calc(100vw-1.5rem))] rounded-[16px] border border-[var(--line)] bg-[var(--card)] p-0 text-[var(--ink)] shadow-[var(--shadow-pop)]"
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4">
        <Search size={18} className="shrink-0 text-[var(--muted-2)]" />
        <input
          ref={inputRef}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={listeTusu}
          placeholder="Ürün, hizmet, mekân ara — “25.000 TL altı telefon” de yazabilirsin"
          aria-label="Arama"
          className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--muted-2)]"
        />
        {yukleniyor && <Loader2 size={16} className="shrink-0 animate-spin text-[var(--muted-2)]" />}
        <button
          type="button"
          onClick={kapat}
          aria-label="Kapat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--mist)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="max-h-[min(60vh,460px)] overflow-y-auto p-2">
        {sonuc.oneri && (
          <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-2)]">
            En yüksek puanlılar
          </p>
        )}

        {!sonuc.oneri && satirlar.length === 0 && !yukleniyor && (
          <p className="px-3 py-6 text-center text-sm text-[var(--muted)]">
            “{sonuc.sorgu}” için sonuç yok. Daha kısa bir kelime deneyin.
          </p>
        )}

        {satirlar.map((s, i) => {
          const aktif = i === secili;
          return s.tur === "kayit" ? (
            <button
              key={`k-${s.veri.slug}`}
              type="button"
              onMouseEnter={() => setSecili(i)}
              onClick={() => git(s.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                aktif ? "bg-[var(--brand-soft)]" : "hover:bg-[var(--mist)]"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.veri.baslik}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                  {s.veri.tip} · {s.veri.kategori}
                  {s.veri.sehir ? ` · ${s.veri.sehir}` : ""}
                </span>
              </span>
              {s.veri.fiyat && (
                <span className="shrink-0 font-num text-xs font-bold text-[var(--brand)]">{s.veri.fiyat}</span>
              )}
              <span className="flex shrink-0 flex-col items-center">
                <span className="font-num text-sm font-extrabold">{s.veri.puan}</span>
                {s.veri.dayanak !== "topluluk" && (
                  <span className="text-[9px] font-bold uppercase text-[var(--muted-2)]">
                    {s.veri.dayanak === "dis-sinyal" ? "dış" : "editör"}
                  </span>
                )}
              </span>
            </button>
          ) : (
            <button
              key={`c-${s.veri.href}`}
              type="button"
              onMouseEnter={() => setSecili(i)}
              onClick={() => git(s.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                aktif ? "bg-[var(--brand-soft)]" : "hover:bg-[var(--mist)]"
              )}
            >
              <FolderTree size={16} className="shrink-0 text-[var(--muted)]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.veri.ad}</span>
                <span className="text-xs text-[var(--muted)]">
                  {s.veri.tip} kategorisi · {s.veri.adet} kayıt
                </span>
              </span>
            </button>
          );
        })}

        {!sonuc.oneri && sonuc.toplam > sonuc.kayitlar.length && (
          <button
            type="button"
            onClick={() => git(`/ara?q=${encodeURIComponent(q.trim())}`)}
            className="mt-1 w-full rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold text-[var(--brand)] hover:bg-[var(--mist)]"
          >
            {sonuc.toplam} sonucun tamamını gör →
          </button>
        )}
      </div>

      <div className="hidden items-center gap-4 border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--muted-2)] sm:flex">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> gezin
        </span>
        <span className="flex items-center gap-1">
          <Kbd>
            <CornerDownLeft size={10} />
          </Kbd>
          aç
        </span>
        <span className="flex items-center gap-1">
          <Kbd>Esc</Kbd> kapat
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Kbd>/</Kbd> veya <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd> ile aç
        </span>
      </div>
    </dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-[var(--line)] bg-[var(--paper)] px-1 font-sans text-[10px] font-semibold text-[var(--muted)]">
      {children}
    </kbd>
  );
}
