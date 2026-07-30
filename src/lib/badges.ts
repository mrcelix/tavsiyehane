import type { BadgeKey } from "./types";

export interface BadgeDef {
  key: BadgeKey;
  label: string;
  description: string;
  /** Tailwind sınıfları (açık + koyu mod) */
  className: string;
}

export const BADGES: Record<BadgeKey, BadgeDef> = {
  "editor-secimi": {
    key: "editor-secimi",
    label: "Editör Seçimi",
    description: "Editör ekibimizin incelemesi sonucu öne çıkan seçim",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
  "kullanici-tercihi": {
    key: "kullanici-tercihi",
    label: "Kullanıcıların Tercihi",
    description: "Kullanıcı puanlarında en üst dilim",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  "fiyat-performans": {
    key: "fiyat-performans",
    label: "Fiyat-Performans",
    description: "Fiyatına göre en yüksek değeri sunar",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  premium: {
    key: "premium",
    label: "Premium Tercih",
    description: "Bütçeden bağımsız en iyi deneyim",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  "en-ekonomik": {
    key: "en-ekonomik",
    label: "En Ekonomik",
    description: "Kategorisindeki en düşük bütçeli sağlam seçenek",
    className: "bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300",
  },
  "en-cok-tercih": {
    key: "en-cok-tercih",
    label: "En Çok Tercih Edilen",
    description: "En çok satın alınan / ziyaret edilen",
    className: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
  },
  "yeni-yukselen": {
    key: "yeni-yukselen",
    label: "Yeni ve Yükselen",
    description: "Kısa sürede dikkat çeken yeni seçenek",
    className: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  },
  dogrulanmis: {
    key: "dogrulanmis",
    label: "Doğrulanmış Sağlayıcı",
    description: "Belge ve kimlik doğrulaması tamamlandı",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300",
  },
  "en-iyi-alternatif": {
    key: "en-iyi-alternatif",
    label: "En İyi Alternatif",
    description: "Popüler seçeneğin en güçlü alternatifi",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  },
  sponsorlu: {
    key: "sponsorlu",
    label: "Sponsorlu",
    description: "Bu içerik için görünürlük ücreti alınmıştır; tavsiye puanı satılmaz",
    className: "bg-orange-100 text-orange-800 ring-1 ring-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-500/40",
  },
};
