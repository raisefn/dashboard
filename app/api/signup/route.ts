import { NextResponse } from "next/server";
import { notifySlack } from "@/lib/slack";

export async function POST(req: Request) {
  try {
    const { name, email, company, role, raising_status } = await req.json();

    await notifySlack(
      "earlyAccess",
      `New signup: *${name}* (${role})\n${email} — ${company}\nRaising: ${raising_status}`
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Signup notification error:", e);
    return NextResponse.json({ success: true }); // Don't fail signup if notification fails
  }
}
