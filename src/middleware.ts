import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Supabase oturum çerezlerini tazeler. Anahtarlar tanımlı değilse hiçbir şey yapmaz.
//
// NOT: Next.js 16 bu dosyayı `proxy.ts` olarak yeniden adlandırdı ve Proxy'yi zorunlu olarak
// Node.js runtime'da çalıştırıyor. Cloudflare'in OpenNext adaptörü henüz Node runtime'lı
// middleware'i desteklemediğinden (async_hooks Workers'ta yok) dağıtım kırılıyor.
// Bu yüzden geçici olarak eski `middleware.ts` sözleşmesinde kalıyoruz — derlemede
// deprecation uyarısı verir ama Edge runtime'da çalışır ve Workers'a dağıtılabilir.
// Adaptör desteği gelince dosya `proxy.ts`, fonksiyon `proxy` olarak geri alınmalı.
// Takip: https://github.com/cloudflare/workers-sdk/issues/13755
export async function middleware(request: NextRequest) {
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
