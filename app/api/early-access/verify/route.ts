import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(req: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(errorPage("Missing verification token."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const { data, error } = await supabase
    .from("early_access")
    .update({ verified: true, token: null })
    .eq("token", token)
    .select("name")
    .single();

  if (error || !data) {
    return new NextResponse(
      errorPage("Invalid or expired verification link."),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(successPage(escapeHtml(data.name)), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function successPage(name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verified — raise(fn)</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e4e4e7}
.card{text-align:center;max-width:400px;padding:40px 20px}
h1{font-size:24px;margin-bottom:8px}
.orange{color:#f97316}.teal{color:#2dd4bf}
p{color:#a1a1aa;font-size:14px;line-height:1.6}
a{display:inline-block;margin-top:24px;color:#2dd4bf;text-decoration:none;font-size:14px;font-weight:500}
a:hover{text-decoration:underline}</style></head>
<body><div class="card">
<h1><span class="orange">raise</span><span class="teal">(fn)</span></h1>
<p>You're in, ${name}. We'll be in touch when early access opens.</p>
<a href="https://raisefn.com">Back to raisefn.com</a>
</div></body></html>`;
}

function errorPage(message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error — raise(fn)</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e4e4e7}
.card{text-align:center;max-width:400px;padding:40px 20px}
h1{font-size:24px;margin-bottom:8px}
.orange{color:#f97316}.teal{color:#2dd4bf}
p{color:#a1a1aa;font-size:14px;line-height:1.6}
a{display:inline-block;margin-top:24px;color:#2dd4bf;text-decoration:none;font-size:14px;font-weight:500}
a:hover{text-decoration:underline}</style></head>
<body><div class="card">
<h1><span class="orange">raise</span><span class="teal">(fn)</span></h1>
<p>${message}</p>
<a href="https://raisefn.com">Back to raisefn.com</a>
</div></body></html>`;
}
