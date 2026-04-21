import { type NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'

const LOCALES = ['fr', 'en', 'ar'] as const
const DEFAULT_LOCALE = 'fr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin auth ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Locale redirect ───────────────────────────────────────────────────────
  // If path already has a locale prefix, just update the cookie and pass through
  const firstSegment = pathname.split('/')[1]
  if ((LOCALES as readonly string[]).includes(firstSegment)) {
    const res = NextResponse.next()
    res.cookies.set('locale', firstSegment, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
    return res
  }

  // No locale prefix — detect and redirect
  const locale = request.cookies.get('locale')?.value ?? DEFAULT_LOCALE
  const validLocale = (LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE
  request.nextUrl.pathname = `/${validLocale}${pathname}`
  const res = NextResponse.redirect(request.nextUrl)
  res.cookies.set('locale', validLocale, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
  return res
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\..*).*)',
  ],
}
