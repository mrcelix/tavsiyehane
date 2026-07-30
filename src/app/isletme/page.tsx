import type { Metadata } from "next";
import { getBundle } from "@/lib/data";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { itemHref } from "@/lib/routes";
import Link from "next/link";
import { ClaimForm } from "./ClaimForm";

export const metadata: Metadata = {
  title: "İşletmeniz için TavsiyeHane",
  description: "İşletme profilinizi sahiplenin, bilgilerinizi güncel tutun ve doğrulanmış sağlayıcı rozeti kazanın.",
};

export default async function IsletmePage() {
  const profile = await getCurrentProfile();
  const bundle = await getBundle();
  const owned = profile ? bundle.items.filter((i) => i.ownerId === profile.id) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">İşletmeniz için TavsiyeHane</h1>
      <p className="mt-2 max-w-2xl text-zinc-500 dark:text-zinc-400">
        Profilinizi sahiplenin: bilgilerinizi güncel tutun, yorumlara yanıt verin ve belge doğrulamasıyla
        <strong> Doğrulanmış Sağlayıcı</strong> rozeti kazanın.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "📝", title: "Profili sahiplen", desc: "Kaydınızdaki bilgi, saat ve fiyatları siz yönetin." },
          { icon: "🛡️", title: "Doğrulama rozeti", desc: "Vergi levhası ve belgelerle doğrulanmış rozet alın." },
          { icon: "📣", title: "Sponsorlu görünürlük", desc: "Görünürlük satın alın — puan ve sıralama satılmaz." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-2xl">{c.icon}</div>
            <h2 className="mt-2 font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.desc}</p>
          </div>
        ))}
      </div>

      {owned.length > 0 && (
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold">Sahiplendiğiniz kayıtlar</h2>
          <ul className="mt-3 space-y-2">
            {owned.map((i) => (
              <li key={i.id}>
                <Link href={itemHref(i)} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {i.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-500/30 dark:bg-indigo-500/5">
        <h2 className="font-bold">İşletmenizi sahiplenin veya ekletin</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Başvurunuz editör ekibince incelenir; belge doğrulaması sonrası profil yönetimi hesabınıza tanımlanır.
          {!isSupabaseConfigured() && " (Demo modunda başvuru kaydedilmez.)"}
        </p>
        <ClaimForm />
      </section>
    </div>
  );
}
