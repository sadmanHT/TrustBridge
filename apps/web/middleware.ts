import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const url = new URL(req.nextUrl)
        const isLogin = url.pathname === '/login'
        // If no session token and the route is protected -> NOT authorized
        const isProtected = url.pathname.startsWith('/dashboard')
        if (!token && isProtected) return false
        // If already authenticated and visiting /login, treat as authorized so middleware won't bounce to /login again
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Stop middleware on static & api assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
  ],
}