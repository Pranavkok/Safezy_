import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const redirectTo = `${requestUrl.origin}/reset-password`;
    const errorRedirect = `${requestUrl.origin}/forgot-password?error_description=Email+link+is+invalid+or+has+expired`;

    // Build the response first so we can attach cookies to it directly.
    // Using next/headers cookies() here won't work because the Set-Cookie
    // headers won't be carried over when we return a new NextResponse.redirect().
    const response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(errorRedirect);
    }

    return response;
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?error_description=Email+link+is+invalid+or+has+expired`
  );
}
