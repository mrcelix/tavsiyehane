import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Görsel optimizasyonu Vercel'in yerleşik servisine bırakıldı.
     *
     * Daha önce Cloudflare Workers'a dağıtım yapıldığı için özel bir yükleyici
     * vardı (`/cdn-cgi/image/...`); Next'in yerleşik optimizasyonu sharp ve Node
     * çalışma zamanı gerektirdiğinden Workers'ta çalışmıyordu. Vercel'de böyle
     * bir kısıt yok ve özel yükleyici bırakılırsa yerleşik optimizasyonu
     * DEVRE DIŞI bırakır — bu yüzden kaldırıldı.
     */
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
