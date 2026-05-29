import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'mm_session'

const PROTECTED_ROUTES = ['/dashboard', '/expert', '/admin', '/booking', '/consultation', '/payment']
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value

  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard/consultations', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
