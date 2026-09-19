import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const protectedPaths = [
  "/dashboard",
  "/contacts",
  "/accounts",
  "/finance",
  "/team",
  "/tasks",
  "/documents",
  "/synchronization",
  "/history",
  "/company",
  "/settings",
  "/messages",
  "/profile",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contacts/:path*",
    "/accounts/:path*",
    "/finance/:path*",
    "/team/:path*",
    "/tasks/:path*",
    "/documents/:path*",
    "/synchronization/:path*",
    "/history/:path*",
    "/company/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/profile/:path*",
  ],
};
