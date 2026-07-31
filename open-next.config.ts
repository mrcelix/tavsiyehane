import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Varsayılan yapılandırma: SSR, server action'lar ve proxy (middleware) çalışır.
// İleride ISR/önbellek için KV binding'i eklenecekse incrementalCache burada tanımlanır.
export default defineCloudflareConfig();
