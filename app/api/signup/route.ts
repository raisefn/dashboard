import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { notifySlack } from "@/lib/slack";

export async function POST(req: Request) {
  try {
    const { email, password, name, company, role, raising_status } = await req.json();

    if (!email || !password || !name || !company || !role || !raising_status) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: false,
      user_metadata: { name: name.trim(), company: company.trim(), role, raising_status },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send Slack notification
    await notifySlack(
      "earlyAccess",
      `New signup: *${name}* (${role})\n${email} — ${company}\nRaising: ${raising_status}`
    );

    return NextResponse.json({ success: true, user_id: data.user?.id });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
