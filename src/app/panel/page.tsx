import type { Metadata } from "next";
import Link from "next/link";
import { getBundle } from "@/lib/data";
import { createSupabaseServer, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { itemHref } from "@/lib/routes";
import { BadgeChip } from "@/components/BadgeChip";
import { moderateReviewAction, toggleSponsorAction, touchItemAction } from "./actions";
import type { Review } from "@/lib/types";

export const metadata: Metadata = { title: "Yönetim Paneli" };

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function PanelPage() {
  const demo = !isSupabaseConfigured();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  if (!demo && !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <h1 className="text-2xl font-extrabold">Yönetim Paneli</h1>
        <p className="mt-3 rounded-xl bg-[var(--down-soft)] p-4 text-sm text-[var(--down)] ring-1 ring-[color-mix(in_oklab,var(--down)_30%,transparent)]">
          Bu sayfa yalnızca <strong>admin</strong> rolündeki üyeler içindir.
          {!profile && (
            <>
              {" "}<Link href="/giris" className="font-semibold underline">Giriş yapın</Link>.
            </>
          )}
        </p>
      </div>
    );
  }

  const bundle = await getBundle();

  // Bekleyen yorumlar (yalnızca gerçek DB'de anlamlı)
  let pending: Review[] = [];
  if (!demo) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase!.from("reviews").select("*").eq("status", "pending").order("created_at");
    pending = (data ?? []).map((r: any) => ({
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

  const itemTitle = new Map(bundle.items.map((i) => [i.id, i.title]));

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Yönetim Paneli</h1>
      {demo && (
        <p className="mt-3 rounded-xl bg-[var(--gold-soft)] p-4 text-sm text-[var(--gold-ink)] ring-1 ring-[color-mix(in_oklab,var(--gold)_30%,transparent)]">
          <strong>Demo modu:</strong> Panel salt okunur önizlemede. Supabase bağlanıp <code>profiles.role = &apos;admin&apos;</code> yapılan hesapla
          giriş yapıldığında moderasyon ve düzenleme aktifleşir.
        </p>
      )}

      {/* Özet kartları */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Toplam içerik", value: bundle.items.length },
          { label: "Onaylı yorum", value: bundle.reviews.length },
          { label: "Bekleyen yorum", value: demo ? "—" : pending.length },
          { label: "Sponsorlu içerik", value: bundle.items.filter((i) => i.isSponsored).length },
        ].map((s) => (
          <div key={s.label} className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-2)]">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Yorum moderasyonu */}
      <section className="mt-8 rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5">
        <h2 className="font-bold">Yorum Moderasyonu</h2>
        <p className="mt-1 text-xs text-[var(--muted-2)]">Yeni yorumlar onaylanana kadar yayınlanmaz.</p>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-xl bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">
            {demo ? "Demo modunda moderasyon kuyruğu boş görünür." : "Bekleyen yorum yok. 🎉"}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{r.userName}</span>
                  <span className="text-[var(--gold)]">{"★".repeat(r.rating)}</span>
                  <span className="text-[var(--muted-2)]">→ {itemTitle.get(r.itemId) ?? r.itemId}</span>
                  <span className="ml-auto text-xs text-[var(--muted-2)]">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-2)]">{r.comment}</p>
                <div className="mt-3 flex gap-2">
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-lg bg-[var(--up)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">✓ Onayla</button>
                  </form>
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-lg bg-[var(--down)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">✗ Reddet</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* İçerik yönetimi */}
      <section className="mt-8 rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5">
        <h2 className="font-bold">İçerik Yönetimi</h2>
        <p className="mt-1 text-xs text-[var(--muted-2)]">
          Sponsorluk görünürlüğü buradan yönetilir; tavsiye puanına asla dokunmaz. &quot;Güncelle&quot; son güncelleme tarihini tazeler.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wide text-[var(--muted-2)]">
                <th className="py-2 pr-3">Başlık</th>
                <th className="py-2 pr-3">Tip</th>
                <th className="py-2 pr-3">Puan</th>
                <th className="py-2 pr-3">Rozetler</th>
                <th className="py-2 pr-3">Güncelleme</th>
                <th className="py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {bundle.items.map((it) => (
                <tr key={it.id}>
                  <td className="max-w-64 py-2.5 pr-3">
                    <Link href={itemHref(it)} className="font-medium hover:text-[var(--brand)]">{it.title}</Link>
                  </td>
                  <td className="py-2.5 pr-3 capitalize text-[var(--muted)]">{it.type}</td>
                  <td className="py-2.5 pr-3 font-bold tabular-nums">{it.score}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {it.badges.map((b) => <BadgeChip key={b} badge={b} small />)}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted-2)]">{formatDate(it.updatedAt)}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-2">
                      <form action={toggleSponsorAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <input type="hidden" name="current" value={String(it.isSponsored)} />
                        <button
                          disabled={demo}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                            it.isSponsored
                              ? "bg-[var(--gold-soft)] text-[var(--gold-ink)] hover:opacity-80"
                              : "bg-[var(--mist-2)] text-[var(--ink-2)] hover:bg-[var(--line)]"
                          }`}
                        >
                          {it.isSponsored ? "Sponsorluğu kaldır" : "Sponsor yap"}
                        </button>
                      </form>
                      <form action={touchItemAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <button
                          disabled={demo}
                          className="rounded-lg bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-ink)] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Güncelle
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
