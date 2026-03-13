import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // Admin-only: verify with a simple shared secret
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, role } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const validRoles = ["founder", "investor", "builder"];
  const userRole = validRoles.includes(role) ? role : "founder";

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com";

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      data: {
        name: name?.trim() || email.split("@")[0],
        role: userRole,
      },
      redirectTo: `${baseUrl}/auth/callback`,
    }
  );

  if (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user_id: data.user.id,
    email: data.user.email,
    role: userRole,
  });
}
