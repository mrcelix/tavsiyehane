import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { maskEmail } from "@/lib/identity";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.json({ demo: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authRequired: true });
  // Oyla aynı kural: doğrulanmamış hesabın yorumu moderasyon kuyruğuna girmez.
  if (!user.email_confirmed_at) return NextResponse.json({ verificationRequired: true });

  const body = await request.json().catch(() => null);
  if (!body?.itemId || !body?.rating || !body?.comment) {
    return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    item_id: body.itemId,
    user_id: user.id,
    // Kimlik e-postadır ama yorumda tam adres yayımlanmaz — maskeli yazılır.
    user_name: user.email ? maskEmail(user.email) : "Üye",
    rating: Math.max(1, Math.min(5, Number(body.rating))),
    criteria: body.criteria ?? {},
    comment: String(body.comment).slice(0, 2000),
    is_verified: false,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
