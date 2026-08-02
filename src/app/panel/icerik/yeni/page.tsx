import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBundle } from "@/lib/data";
import { ItemForm } from "@/components/admin/ItemForm";
import { kayitOlusturAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function YeniKayitPage() {
  const bundle = await getBundle();

  return (
    <div className="space-y-5">
      <Link href="/panel/icerik" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
        <ArrowLeft size={13} /> İçerik listesi
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Yeni kayıt</h1>
      <ItemForm categories={bundle.categories} action={kayitOlusturAction} />
    </div>
  );
}
