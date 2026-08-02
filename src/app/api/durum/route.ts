import { NextResponse } from "next/server";
import { collectStatus } from "@/lib/status";

/**
 * Durum uç noktası — /api/durum
 *
 * Dağıtımdan sonra "çalışıyor mu?" sorusunu tek istekte cevaplar. Ölçümün
 * kendisi lib/status.ts'te; `/durum` sayfası da aynı yerden okur, böylece iki
 * kaynak iki farklı cevap veremez.
 */

// Önbelleklenmiş bir sağlık kontrolü ölçtüğü şeyi değil, geçmişi gösterir.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const durum = await collectStatus();

  // İzleme araçları gövdeyi ayrıştırmak zorunda kalmadan HTTP koduna bakabilmeli.
  return NextResponse.json(durum, {
    status: durum.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
