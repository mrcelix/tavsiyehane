import type { BadgeVariant } from "@/components/ui/Badge";
import type { BadgeKey } from "./types";

export interface BadgeDef {
  key: BadgeKey;
  label: string;
  description: string;
  variant: BadgeVariant;
}

/** Tavsiye rozetleri — servis.net rozet varyantlarına eşlenir (§4.4). */
export const BADGES: Record<BadgeKey, BadgeDef> = {
  "editor-secimi": {
    key: "editor-secimi",
    label: "Editör Seçimi",
    description: "Editör ekibimizin incelemesi sonucu öne çıkan seçim",
    variant: "halo",
  },
  "kullanici-tercihi": {
    key: "kullanici-tercihi",
    label: "Kullanıcıların Tercihi",
    description: "Kullanıcı puanlarında en üst dilim",
    variant: "up",
  },
  "fiyat-performans": {
    key: "fiyat-performans",
    label: "Fiyat-Performans",
    description: "Fiyatına göre en yüksek değeri sunar",
    variant: "soft",
  },
  premium: {
    key: "premium",
    label: "Premium Tercih",
    description: "Bütçeden bağımsız en iyi deneyim",
    variant: "gold-halo",
  },
  "en-ekonomik": {
    key: "en-ekonomik",
    label: "En Ekonomik",
    description: "Kategorisindeki en düşük bütçeli sağlam seçenek",
    variant: "up",
  },
  "en-cok-tercih": {
    key: "en-cok-tercih",
    label: "En Çok Tercih Edilen",
    description: "En çok satın alınan / ziyaret edilen",
    variant: "default",
  },
  "yeni-yukselen": {
    key: "yeni-yukselen",
    label: "Yeni ve Yükselen",
    description: "Kısa sürede dikkat çeken yeni seçenek",
    variant: "soft",
  },
  dogrulanmis: {
    key: "dogrulanmis",
    label: "Doğrulanmış Sağlayıcı",
    description: "Belge ve kimlik doğrulaması tamamlandı",
    variant: "up",
  },
  "en-iyi-alternatif": {
    key: "en-iyi-alternatif",
    label: "En İyi Alternatif",
    description: "Popüler seçeneğin en güçlü alternatifi",
    variant: "soft",
  },
  sponsorlu: {
    key: "sponsorlu",
    label: "Sponsorlu",
    description: "Bu içerik için görünürlük ücreti alınmıştır; tavsiye puanı satılmaz",
    variant: "gold-soft",
  },
};
