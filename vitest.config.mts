import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Test kapsamı bilinçli olarak saf mantıkla sınırlı: puanlama, öznitelik
 * normalizasyonu, filtre üretimi, arama ve kimlik yardımcıları. Bunlar sitenin
 * en kırılgan ve en çok değişen kısmı; hepsi girdi-çıktı fonksiyonu olduğu için
 * DOM'a ihtiyaç duymadan test edilebiliyor.
 *
 * Arayüz davranışı (modal, filtre paneli) gerçek tarayıcıda scripts/*-check.mjs
 * ile doğrulanır — jsdom taklidi yerine gerçek tarayıcı, çünkü <dialog> ve
 * hidratasyon gibi konularda taklit ile gerçek arasındaki fark tam da hatanın
 * saklandığı yer.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: { include: ["src/lib/**"], reporter: ["text", "html"] },
  },
});
