import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/forgot-password?error_description=Email+link+is+invalid+or+has+expired`
      );
    }

    return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
  }
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error_description=Email+link+is+invalid+or+has+expired`
  );
}
