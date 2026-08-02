import { Check, X } from "lucide-react";
import { getBundle } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { Baslik, Bos, Dugme, Kart } from "@/components/admin/ui";
import { moderateReviewAction } from "../actions";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function YorumlarPage() {
  const bundle = await getBundle();
  const yapilandirildi = isSupabaseConfigured();

  let bekleyen: Review[] = [];
  if (yapilandirildi) {
    const supabase = await createSupabaseServer();
    const { data } = await (supabase as any)
      .from("reviews")
      .select("*")
      .eq("status", "pending")
      .order("created_at");
    bekleyen = (data ?? []).map((r: any) => ({
      id: r.id,
      itemId: r.item_id,
      userName: r.user_name ?? "Üye",
      rating: r.rating,
      criteria: r.criteria ?? {},
      comment: r.comment ?? "",
      isVerified: r.is_verified ?? false,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  const baslik = new Map(bundle.items.map((i) => [i.id, i.title]));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Yorumlar</h1>

      <Kart>
        <Baslik aciklama="Yeni yorumlar onaylanana kadar yayımlanmaz. Doğrulanmamış e-postaya sahip hesapların yorumu bu kuyruğa hiç girmez (0004).">
          Moderasyon kuyruğu — {bekleyen.length}
        </Baslik>
        {bekleyen.length === 0 ? (
          <Bos>{yapilandirildi ? "Bekleyen yorum yok." : "Demo modunda kuyruk boş görünür."}</Bos>
        ) : (
          <ul className="space-y-3">
            {bekleyen.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{r.userName}</span>
                  <StarRating value={r.rating} small />
                  <span className="text-[var(--muted-2)]">→ {baslik.get(r.itemId) ?? r.itemId}</span>
                  <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{r.comment}</p>
                <div className="mt-3 flex gap-2">
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--up)] px-3 py-2 text-xs font-bold text-white hover:opacity-90">
                      <Check size={13} /> Onayla
                    </button>
                  </form>
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Dugme tur="tehlike" type="submit">
                      <X size={13} className="mr-1 inline" /> Reddet
                    </Dugme>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Kart>

      <Kart>
        <Baslik aciklama="Sitede görünen onaylı yorumlar.">Onaylı yorumlar — {bundle.reviews.length}</Baslik>
        {bundle.reviews.length === 0 ? (
          <Bos>Henüz onaylı yorum yok.</Bos>
        ) : (
          <ul className="divide-y divide-[var(--line)] text-sm">
            {bundle.reviews.slice(0, 30).map((r) => (
              <li key={r.id} className="py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{r.userName}</span>
                  <StarRating value={r.rating} small />
                  <span className="text-xs text-[var(--muted-2)]">{baslik.get(r.itemId) ?? r.itemId}</span>
                  <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[var(--muted)]">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </Kart>
    </div>
  );
}
