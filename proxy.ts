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
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const hasUser = !claimsError && Boolean(claimsData?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );

  if (isProtected && !hasUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
