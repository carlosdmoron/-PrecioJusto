import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["es", "it", "en"] as const;
const defaultLocale = "es";

function hasLocale(candidate: string): boolean {
  return (locales as readonly string[]).includes(candidate);
}

function getPreferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  const preferences = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of preferences) {
    if (hasLocale(tag)) return tag;
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (pathnameHasLocale) return;

  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
