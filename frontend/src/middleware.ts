import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    // API isteklerini yakala
    '/api/:path*',
  ],
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // API isteklerini backend'e yönlendir
  if (pathname.startsWith('/api/')) {
    // Development ortamında backend adresi
    const backendUrl = 'http://localhost:8000'
    const newUrl = `${backendUrl}${pathname}`
    
    console.log(`[Middleware] API isteği yönlendiriliyor: ${pathname} -> ${newUrl}`)
    
    // CORS başlıkları ekle
    const response = NextResponse.rewrite(new URL(newUrl))
    
    // CORS başlıklarını ekle
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }

  return NextResponse.next()
} 