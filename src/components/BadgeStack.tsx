/**
 * SOSYAL KANIT ROZETLERİNİN YIĞINI
 *
 * İki rozet de sayfanın altında ortalanır. Her birine ayrı ayrı sabit bir alt
 * boşluk vermek (biri 1rem, diğeri 4.5rem gibi) kırılgan: metin dar ekranda iki
 * satıra sardığında rozetin yüksekliği büyür ve üst üste binerler.
 *
 * Onun yerine tek bir sabit kap: rozetler normal akışta dizilir, aradaki boşluk
 * `gap` ile tutulur, yükseklikleri ne olursa olsun çakışmazlar. `col-reverse`
 * çünkü canlı ziyaretçi rozeti en altta olmalı — ilk çizilen en alta düşsün
 * diye çocuklar da o sırayla veriliyor.
 *
 * `pointer-events-none` kapta, `auto` rozetlerin kendisinde: rozetlerin
 * arasındaki boşluk altındaki sayfayı tıklanamaz hâle getirmesin.
 */
export function BadgeStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col-reverse items-center gap-2 px-4">
      {children}
    </div>
  );
}
