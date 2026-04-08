import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  // New flow: token_hash from email template (signup confirmation)
  if (tokenHash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email",
    });

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
    }

    return NextResponse.redirect(new URL("/brain/deploy", url.origin));
  }

  // Old flow: code from magic link / invite
  if (code) {
    return NextResponse.redirect(
      new URL(`/auth/confirm?code=${encodeURIComponent(code)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
}
