import { NextResponse } from "next/server";

// Supabase redirects here with ?code=xxx after magic link / invite click.
// We redirect to a client page that exchanges the code for a session.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  // Pass code to client page that will exchange it for a session
  return NextResponse.redirect(
    new URL(`/auth/confirm?code=${encodeURIComponent(code)}`, url.origin)
  );
}
