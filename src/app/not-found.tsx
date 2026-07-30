import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-6xl">🧭</div>
      <h1 className="mt-4 text-2xl font-extrabold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">Aradığınız içerik taşınmış ya da hiç var olmamış olabilir.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Ana sayfa</Link>
        <Link href="/ara" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Aramayı dene</Link>
      </div>
    </div>
  );
}
