import { type NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login page is always accessible
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token || !(await verifySessionToken(token))) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Only intercept /admin/* — keeps proxy off all public routes
  matcher: ['/admin/:path*'],
}
