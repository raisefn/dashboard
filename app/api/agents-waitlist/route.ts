import { NextResponse } from "next/server";
import { notifySlack } from "@/lib/slack";

// /agents waitlist signup. Captures email + audience (founder/investor)
// when someone wants to be notified the AI-assistant connection ships.
//
// v1: Slack notification only. No DB schema until we know what volume to
// expect. If signups take off, swap this for a Supabase agents_waitlist
// table — the route signature stays the same.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const audience = (body.audience || "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (audience !== "founder" && audience !== "investor") {
    return NextResponse.json({ error: "Pick founder or investor." }, { status: 400 });
  }

  // Slack ping — same channel as the early-access notifications.
  // Surfaces interest in raise(fn)'s real-time signal so Justin can
  // gauge demand before building the infra.
  const label = audience === "founder" ? "Founder" : "Investor";
  await notifySlack(
    "earlyAccess",
    `🤖 Agents waitlist signup: *${email}* (${label})`,
  );

  console.log(`agents waitlist: ${email} (${audience})`);
  return NextResponse.json({ ok: true });
}
