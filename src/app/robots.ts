import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const BASE = await getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/hesap", "/api/"] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
