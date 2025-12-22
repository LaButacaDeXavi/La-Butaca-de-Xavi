import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/admin', '/admin/teatros', '/admin/funciones', '/admin/artistas', '/admin/obras'];

// Rutas públicas que redirigen al dashboard si el usuario ya está autenticado
const publicRoutes = [
  '/login',
  '/reset-password',
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Si es una ruta protegida y no hay usuario autenticado
  if (protectedRoutes.includes(pathname) && !user) {
    url.pathname = '/';
    const response = NextResponse.redirect(url);

    // Copiar headers de la respuesta de Supabase
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Si es una ruta pública y el usuario ya está autenticado
  if (publicRoutes.includes(pathname) && user) {
    url.pathname = '/admin';
    const response = NextResponse.redirect(url);

    // Copiar headers de la respuesta de Supabase
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or
  // NextResponse.rewrite(), you must call supabaseResponse.headers.forEach(...)
  // and set each header in your response object.

  return supabaseResponse;
}