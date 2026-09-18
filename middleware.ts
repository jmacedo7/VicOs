import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPaths = ["/dashboard","/contacts","/accounts","/finance","/team","/synchronization","/history","/company","/settings","/messages","/profile"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); });
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*","/contacts/:path*","/accounts/:path*","/finance/:path*","/team/:path*","/synchronization/:path*","/history/:path*","/company/:path*","/settings/:path*","/messages/:path*","/profile/:path*"] };
