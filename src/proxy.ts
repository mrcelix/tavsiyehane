import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase oturum çerezlerini tazeler. Anahtarlar tanımlı değilse hiçbir şey yapmaz.
 *
 * Next.js 16'da `middleware.ts` → `proxy.ts` oldu. Bir süre eski sözleşmede
 * kalmıştık: Proxy zorunlu olarak Node.js runtime'da çalışıyor ve Cloudflare'in
 * OpenNext adaptörü bunu desteklemiyordu (`async_hooks` Workers'ta yok).
 * Dağıtım Vercel'e taşındığı için o kısıt kalktı ve dosya güncel sözleşmeye
 * alındı — derlemedeki deprecation uyarısı da böylece kapandı.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
