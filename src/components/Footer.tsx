import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white py-10 text-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">✓</span>
            <span className="font-extrabold">
              Tavsiye<span className="text-indigo-600 dark:text-indigo-400">Hane</span>
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">
            Ne alacağına, kimi seçeceğine ve nereye gideceğine kolay karar ver.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Keşfet</h3>
          <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-400">
            <li><Link className="hover:text-indigo-600" href="/urunler">Ürünler</Link></li>
            <li><Link className="hover:text-indigo-600" href="/hizmetler">Hizmetler</Link></li>
            <li><Link className="hover:text-indigo-600" href="/mekanlar">Mekânlar</Link></li>
            <li><Link className="hover:text-indigo-600" href="/listeler">En iyi listeleri</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Araçlar</h3>
          <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-400">
            <li><Link className="hover:text-indigo-600" href="/ara">İhtiyaç sihirbazı</Link></li>
            <li><Link className="hover:text-indigo-600" href="/karsilastir">Karşılaştırma</Link></li>
            <li><Link className="hover:text-indigo-600" href="/favoriler">Favoriler</Link></li>
            <li><Link className="hover:text-indigo-600" href="/isletme">İşletmem</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Şeffaflık</h3>
          <p className="text-zinc-500 dark:text-zinc-400">
            Sponsorlu içerikler açıkça işaretlenir. Görünürlük satılabilir;{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">tavsiye puanı asla satılmaz.</span>
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-4 text-xs text-zinc-400 dark:text-zinc-500">
        © 2026 TavsiyeHane — Demo sürüm. Puan ve yorumlar örnek veridir.
      </div>
    </footer>
  );
}
