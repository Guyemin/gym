import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwner } from "@/lib/supabase/admin";

// Next.js 16: middleware.ts was renamed to proxy.ts, exported function must be `proxy`.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without Supabase configured (e.g. local dev) the app runs without login, progress stays in the browser.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders ?? {}).forEach(([k, v]) => response.headers.set(k, v as string));
      },
    },
  });

  // getUser() validates the session with the auth server (do not use getSession here).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/login") || path.startsWith("/auth");

  // Optional allow-list: ALLOWED_EMAILS="me@example.com,other@example.com"
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  let permitted = !!user && (allowed.length === 0 || allowed.includes((user.email ?? "").toLowerCase()));
  // Single-owner lock: the first account to log in owns the app; anyone else is refused.
  if (user && permitted) {
    try {
      permitted = await isOwner(user.id);
    } catch (e) {
      console.error("owner check failed", e);
    }
  }

  if (user && !permitted) {
    await supabase.auth.signOut();
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "?error=not_allowed";
    return NextResponse.redirect(to);
  }

  if (!permitted && !isPublic) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "";
    return NextResponse.redirect(to);
  }

  if (permitted && path.startsWith("/login")) {
    const to = request.nextUrl.clone();
    to.pathname = "/";
    to.search = "";
    return NextResponse.redirect(to);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
