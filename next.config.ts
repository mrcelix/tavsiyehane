import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Cloudflare Workers'ta Next'in yerleşik görsel optimizasyonu çalışmaz
     * (sharp + Node çalışma zamanı gerektirir). Dönüştürmeyi Cloudflare'in
     * kenar servisine bırakıyoruz — bkz. src/lib/image-loader.ts.
     */
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    /**
     * Uzak görsellere izin verilen alan adları. Liste bilinçli olarak dar:
     * her adresten görsel çekmek, sitenin görünümünü üçüncü tarafların
     * kontrolüne bırakmak demek. Yeni kaynak eklemeden önce lisansı da
     * kaydedilmeli (bkz. ItemImage.license).
     */
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
};

export default nextConfig;
