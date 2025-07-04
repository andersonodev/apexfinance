import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Log da requisição para debug
  console.log(`🌐 ${request.method} ${request.url}`)
  
  // Verificar se é uma rota protegida
  const protectedRoutes = ['/']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) && request.nextUrl.pathname !== '/sign-in' && request.nextUrl.pathname !== '/sign-up'
  )
  
  if (isProtectedRoute) {
    const session = request.cookies.get('appwrite-session')
    
    if (!session) {
      console.log('🚫 Usuário não autenticado, redirecionando para sign-in')
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }
  
  // Adicionar headers de segurança
  const response = NextResponse.next()
  
  // Headers para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-debug-mode', 'true')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (public icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons).*)',
  ],
}
