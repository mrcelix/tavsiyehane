import type { Metadata } from "next";
import { Megaphone, PencilLine, ShieldCheck } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getBundle } from "@/lib/data";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { itemHref } from "@/lib/routes";
import Link from "next/link";
import { ClaimForm } from "./ClaimForm";

export const metadata: Metadata = pageMetadata({
  title: "İşletmeniz için TavsiyeHane",
  description: "İşletme profilinizi sahiplenin, bilgilerinizi güncel tutun ve doğrulanmış sağlayıcı rozeti kazanın.",
  path: "/isletme",
});

export default async function IsletmePage() {
  const profile = await getCurrentProfile();
  const bundle = await getBundle();
  const owned = profile ? bundle.items.filter((i) => i.ownerId === profile.id) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">İşletmeniz için TavsiyeHane</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Profilinizi sahiplenin: bilgilerinizi güncel tutun, yorumlara yanıt verin ve belge doğrulamasıyla
        <strong> Doğrulanmış Sağlayıcı</strong> rozeti kazanın.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: <PencilLine size={20} />,
            tone: "bg-[var(--brand-soft)] text-[var(--brand)]",
            title: "Profili sahiplen",
            desc: "Kaydınızdaki bilgi, saat ve fiyatları siz yönetin.",
          },
          {
            icon: <ShieldCheck size={20} />,
            tone: "bg-[var(--up-soft)] text-[var(--up)]",
            title: "Doğrulama rozeti",
            desc: "Vergi levhası ve belgelerle doğrulanmış rozet alın.",
          },
          {
            icon: <Megaphone size={20} />,
            tone: "bg-[var(--gold-soft)] text-[var(--gold-ink)]",
            title: "Sponsorlu görünürlük",
            desc: "Görünürlük satın alın — puan ve sıralama satılmaz.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>{c.icon}</span>
            <h2 className="mt-3 text-base font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{c.desc}</p>
          </div>
        ))}
      </div>

      {owned.length > 0 && (
        <section className="mt-8 rounded-[14px] border border-[var(--line)] bg-[var(--card)] p-5">
          <h2 className="font-bold">Sahiplendiğiniz kayıtlar</h2>
          <ul className="mt-3 space-y-2">
            {owned.map((i) => (
              <li key={i.id}>
                <Link href={itemHref(i)} className="font-medium text-[var(--brand)] hover:underline">
                  {i.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-[14px] border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] p-6">
        <h2 className="font-bold">İşletmenizi sahiplenin veya ekletin</h2>
        <p className="mb-4 mt-1 text-sm text-[var(--muted)]">
          Başvurunuz editör ekibince incelenir; belge doğrulaması sonrası profil yönetimi hesabınıza tanımlanır.
          {!isSupabaseConfigured() && " (Demo modunda başvuru kaydedilmez.)"}
        </p>
        <ClaimForm />
      </section>
    </div>
  );
}
