import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run the Supabase session check on routes that need auth
  if (!pathname.startsWith('/tracker') && pathname !== '/login') {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  if (!user && pathname.startsWith('/tracker')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/tracker'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/tracker/:path*', '/login'],
}
