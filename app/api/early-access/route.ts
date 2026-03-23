import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, company, role, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !company?.trim() || !role?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const validRoles = ["investor", "founder", "builder"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check for existing signup
    const { data: existing } = await supabase
      .from("early_access")
      .select("id, verified")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing?.verified) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }

    // Generate verification token
    const token = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raisefn.com";
    const verifyUrl = `${baseUrl}/api/early-access/verify?token=${token}`;

    if (existing) {
      // Re-send verification for unverified signup
      await supabase
        .from("early_access")
        .update({ name: name.trim(), company: company.trim(), role, message: message?.trim() || null, token })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("early_access")
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          company: company.trim(),
          role,
          message: message?.trim() || null,
          token,
          verified: false,
        });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json(
          { error: "Something went wrong. Please try again." },
          { status: 500 }
        );
      }
    }

    // Send verification email
    const { error: emailError } = await resend.emails.send({
      from: "raise(fn) <noreply@raisefn.com>",
      to: email.toLowerCase().trim(),
      subject: "Verify your raise(fn) early access signup",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #fff; font-size: 20px; margin-bottom: 8px;">
            <span style="color: #f97316;">raise</span><span style="color: #2dd4bf;">(fn)</span>
          </h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Hey ${name.trim()}, thanks for signing up for early access. Click below to verify your email and lock in your spot.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #f97316; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 500;">
            Verify Email
          </a>
          <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
            If you didn't sign up for raise(fn), you can ignore this email.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: "Could not send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Early access error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
