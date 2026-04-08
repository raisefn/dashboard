import { NextResponse } from "next/server";
import { notifySlack } from "@/lib/slack";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, email, company, role, raising_status } = await req.json();

    // Slack notification for all signups
    await notifySlack(
      "earlyAccess",
      `New signup: *${name}* (${role})\n${email} — ${company}\nStatus: ${raising_status}`
    );

    // Save builders to early_access table for future follow-up
    if (role === "builder") {
      try {
        const supabase = getSupabase();
        await supabase.from("early_access").insert({
          name,
          email: email.trim().toLowerCase(),
          company: company || null,
          role: "builder",
          message: raising_status, // "sdk", "opportunities", "advising", or "curious"
          verified: true, // no email verification needed for builders
        });
      } catch (e) {
        console.error("Failed to save builder to early_access:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Signup notification error:", e);
    return NextResponse.json({ success: true });
  }
}
