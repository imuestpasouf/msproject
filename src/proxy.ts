import { type NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'

const LOCALES = ['fr', 'en', 'ar'] as const
const DEFAULT_LOCALE = 'fr'
const BRAND = '/D1-Milano'

function getLocaleFromCookie(request: NextRequest): string {
  const cookie = request.cookies.get('locale')?.value ?? DEFAULT_LOCALE
  return (LOCALES as readonly string[]).includes(cookie) ? cookie : DEFAULT_LOCALE
}

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

  // ── Brand routes: /D1-Milano/... ──────────────────────────────────────────
  if (pathname.startsWith(BRAND)) {
    const afterBrand = pathname.slice(BRAND.length) // e.g. '/fr/catalogue' or '' or '/'
    const subSegment = afterBrand.split('/')[1]      // e.g. 'fr', 'en', 'ar', or ''

    if ((LOCALES as readonly string[]).includes(subSegment)) {
      // Valid locale present — pass through and refresh cookie
      const res = NextResponse.next()
      res.cookies.set('locale', subSegment, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
      return res
    }

    // /D1-Milano with no locale — redirect to /D1-Milano/{locale}{rest}
    const locale = getLocaleFromCookie(request)
    const rest = afterBrand === '' || afterBrand === '/' ? '' : afterBrand
    request.nextUrl.pathname = `${BRAND}/${locale}${rest}`
    const res = NextResponse.redirect(request.nextUrl)
    res.cookies.set('locale', locale, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
    return res
  }

  // ── Legacy locale-prefixed paths (/fr/..., /en/..., /ar/...) ─────────────
  const firstSegment = pathname.split('/')[1]
  if ((LOCALES as readonly string[]).includes(firstSegment)) {
    const res = NextResponse.redirect(new URL(`${BRAND}${pathname}`, request.url))
    res.cookies.set('locale', firstSegment, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
    return res
  }

  // ── Everything else (/, /catalogue, etc.) → redirect to brand home ────────
  const locale = getLocaleFromCookie(request)
  const dest = pathname === '/' ? BRAND : `${BRAND}/${locale}${pathname}`
  request.nextUrl.pathname = dest.replace(/\/+/g, '/')
  const res = NextResponse.redirect(request.nextUrl)
  res.cookies.set('locale', locale, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' })
  return res
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\..*).*)',
  ],
}
