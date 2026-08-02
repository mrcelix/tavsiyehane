import { createSupabaseServer, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import { maskEmail } from "@/lib/identity";
import { Baslik, Bos, Dugme, Kart, Tablo } from "@/components/admin/ui";
import { rolDegistirAction } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ROLLER = [
  { deger: "user", etiket: "Üye" },
  { deger: "business", etiket: "İşletme" },
  { deger: "admin", etiket: "Admin" },
];

export default async function UyelerPage() {
  const yapilandirildi = isSupabaseConfigured();
  const ben = await getCurrentProfile();

  let uyeler: { id: string; role: string; created_at: string }[] = [];
  if (yapilandirildi) {
    const supabase = await createSupabaseServer();
    const { data } = await (supabase as any)
      .from("profiles")
      .select("id, role, created_at")
      .order("created_at", { ascending: false });
    uyeler = data ?? [];
  }

  const adminSayisi = uyeler.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Üyeler</h1>

      <Kart>
        <Baslik
          aciklama="Kimlik e-posta adresidir; ayrı kullanıcı adı yoktur. Şifreler hash'lenmiş tutulur ve hiç kimse — proje sahibi dahil — düz metnini göremez."
        >
          Kayıtlı üyeler — {uyeler.length}
        </Baslik>

        {adminSayisi === 1 && (
          <p className="mb-4 rounded-xl bg-[var(--gold-soft)] p-3 text-xs leading-relaxed text-[var(--gold-ink)]">
            Sistemde <strong>tek admin</strong> var. Kendi rolünüzü düşürürseniz panele erişimi kaybedersiniz ve geri
            almak için SQL Editor gerekir. İkinci bir admin atamadan rolünüzü değiştirmeyin.
          </p>
        )}

        {!yapilandirildi ? (
          <Bos>Demo modunda üye listesi boştur.</Bos>
        ) : uyeler.length === 0 ? (
          <Bos>Henüz kayıtlı üye yok.</Bos>
        ) : (
          <Tablo basliklar={["Üye", "Rol", "Kayıt", "Rolü değiştir"]}>
            {uyeler.map((u) => {
              const benMiyim = u.id === ben?.id;
              return (
                <tr key={u.id}>
                  <td className="py-2.5 pr-3 font-mono text-xs">
                    {benMiyim && ben ? (
                      <>
                        {ben.email}
                        <span className="ml-1.5 rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-ink)]">
                          siz
                        </span>
                      </>
                    ) : (
                      // Başkasının adresi maskeli: panelde de olsa toplu e-posta
                      // görüntülemek, sızdığında toplu adres listesi demektir.
                      maskEmail(`${u.id.slice(0, 8)}@gizli`)
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded bg-[var(--mist-2)] px-1.5 py-0.5 text-xs font-semibold capitalize text-[var(--ink-2)]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-[var(--muted-2)]">{formatDate(u.created_at)}</td>
                  <td className="py-2.5">
                    <form action={rolDegistirAction} className="flex gap-1.5">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="rol"
                        defaultValue={u.role}
                        className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-xs"
                      >
                        {ROLLER.map((r) => (
                          <option key={r.deger} value={r.deger}>
                            {r.etiket}
                          </option>
                        ))}
                      </select>
                      <Dugme tur="sessiz" type="submit">
                        Uygula
                      </Dugme>
                    </form>
                  </td>
                </tr>
              );
            })}
          </Tablo>
        )}
      </Kart>

      <Kart>
        <Baslik>Roller ne yapar?</Baslik>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Üye</dt>
            <dd className="text-[var(--muted)]">Oy verir, yorum yazar, favori tutar. Varsayılan rol.</dd>
          </div>
          <div>
            <dt className="font-semibold">İşletme</dt>
            <dd className="text-[var(--muted)]">
              Sahiplendiği kaydın bilgilerini günceller. Kendi kaydına oy veremez (0002).
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Admin</dt>
            <dd className="text-[var(--muted)]">
              Bu panelin tamamı. Yaptığı her yazma işlemi denetim kaydına düşer.
            </dd>
          </div>
        </dl>
      </Kart>
    </div>
  );
}
