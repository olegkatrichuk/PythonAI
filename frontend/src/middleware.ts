// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['ru', 'en', 'uk'];
const defaultLocale = 'ru';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  // Убедитесь, что sitemap.xml добавлен в этот список исключений
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|sitemap.xml|robots.txt).*)'],
};