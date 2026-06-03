import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && (path.startsWith('/admin') || path.startsWith('/employee'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (user && path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (user && path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (!['superadmin', 'admin'].includes(profile?.role || '')) {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url))
    }
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/auth/:path*'],
}
