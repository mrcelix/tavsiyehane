import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <Compass size={56} className="mx-auto text-[var(--muted-2)]" strokeWidth={1.5} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Sayfa bulunamadı</h1>
      <p className="mt-2 text-[var(--muted)]">Aradığınız içerik taşınmış ya da hiç var olmamış olabilir.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/" variant="primary">
          Ana sayfa
        </ButtonLink>
        <ButtonLink href="/ara" variant="outline">
          Aramayı dene
        </ButtonLink>
      </div>
    </div>
  );
}
