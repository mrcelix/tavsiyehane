import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { Baslik, Bos, Kart, Tablo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DenetimKaydiPage() {
  let kayitlar: any[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data } = await (supabase as any)
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    kayitlar = data ?? [];
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Denetim kaydı</h1>

      <Kart>
        <Baslik aciklama="Panelden yapılan her yazma işlemi buraya düşer. Puanı ve sıralamayı etkileyen bir panelde 'bunu kim değiştirdi?' sorusunun cevabı yoksa, dışarıya verilen şeffaflık sözü içeride karşılıksız kalır.">
          Son 200 işlem
        </Baslik>
        {kayitlar.length === 0 ? (
          <Bos>
            {isSupabaseConfigured() ? "Henüz kayıtlı işlem yok." : "Demo modunda denetim kaydı tutulmaz."}
          </Bos>
        ) : (
          <Tablo basliklar={["Tarih", "Eylem", "Hedef", "Detay"]}>
            {kayitlar.map((k) => (
              <tr key={k.id}>
                <td className="whitespace-nowrap py-2 pr-3 text-xs text-[var(--muted-2)]">
                  {formatDate(k.created_at)}
                </td>
                <td className="py-2 pr-3">
                  <span className="rounded bg-[var(--mist-2)] px-1.5 py-0.5 font-mono text-xs font-semibold">
                    {k.eylem}
                  </span>
                </td>
                <td className="py-2 pr-3 text-xs text-[var(--muted)]">
                  {k.hedef_tur}
                  {k.hedef_id ? ` · ${k.hedef_id}` : ""}
                </td>
                <td className="max-w-72 truncate py-2 font-mono text-[11px] text-[var(--muted-2)]">
                  {k.detay ? JSON.stringify(k.detay) : "—"}
                </td>
              </tr>
            ))}
          </Tablo>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted-2)]">
          Kayıtlar yalnızca admin tarafından okunabilir (RLS). Silme yetkisi hiç kimsede yok — denetim kaydı
          silinebiliyorsa denetim değildir.
        </p>
      </Kart>
    </div>
  );
}
