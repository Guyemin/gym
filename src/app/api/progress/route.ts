import { NextResponse, type NextRequest } from "next/server";
import { getAdmin, isOwner, loadProgress, saveProgress } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function authorize() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!getAdmin()) return { error: NextResponse.json({ error: "storage not configured" }, { status: 503 }) };
  if (!(await isOwner(user.id))) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const a = await authorize();
  if (a.error) return a.error;
  try {
    return NextResponse.json({ data: await loadProgress(a.user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const a = await authorize();
  if (a.error) return a.error;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("data" in body)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    await saveProgress(a.user.id, body.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
