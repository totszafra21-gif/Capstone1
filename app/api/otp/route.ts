import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateOTP, isOTPExpired } from "@/lib/otp";
import { Resend } from "resend";
import nodemailer from "nodemailer";

async function sendOtpEmail(to: string, otp: string) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "ELYAN Chicken Hub <onboarding@resend.dev>",
      to,
      subject: "Your OTP Code - ELYAN Chicken Hub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
          <h2>Your Verification Code</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (result.error) throw new Error(result.error.message || "Failed to send OTP email (Resend).");
    return { provider: "resend" as const, id: result.data?.id };
  }

  const host = process.env.MAIL_SERVER;
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
  const username = process.env.MAIL_USERNAME;
  const password = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM || username;
  const fromName = process.env.MAIL_FROM_NAME;
  const useTls = (process.env.MAIL_USE_TLS ?? "true").toLowerCase() !== "false";
  const useSsl = (process.env.MAIL_USE_SSL ?? "false").toLowerCase() === "true";

  if (!host || !port || !username || !password || !from) {
    throw new Error(
      "Email service not configured. Set RESEND_API_KEY or MAIL_SERVER/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD/MAIL_FROM."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: useSsl,
    auth: { user: username, pass: password },
    ...(useTls ? { requireTLS: true } : {}),
  });

  const info = await transporter.sendMail({
    from: fromName ? `${fromName} <${from}>` : from,
    to,
    subject: "Your OTP Code - ELYAN Chicken Hub",
    text: `Your 6-digit OTP is: ${otp}\nThis code expires in 10 minutes.\n\nIf you didn't request this code, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
        <h2>Your Verification Code</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
        </div>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  return { provider: "smtp" as const, id: info.messageId };
}

/**
 * POST - Send OTP to email
 * Body: { email }
 */
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP in database
    const { error: otpError } = await supabaseAdmin.from("email_otp").upsert(
      { email, otp, expires_at: expiresAt, verified: false },
      { onConflict: "email" }
    );

    if (otpError) {
      console.error("OTP storage error:", otpError);
      if (otpError.message?.includes("schema cache") || otpError.message?.includes("Could not find the table")) {
        return NextResponse.json(
          {
            error:
              "OTP table is missing in Supabase. Run `sql/email_otp.sql` in Supabase SQL Editor, then retry.",
            details: otpError.message,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Failed to generate OTP: ${otpError.message}` },
        { status: 500 }
      );
    }

    const emailResult = await sendOtpEmail(email, otp);

    // Log for testing
    console.log(`📧 OTP for ${email}: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent to your email",
      provider: emailResult.provider,
      emailId: emailResult.id,
      otp: process.env.NODE_ENV === "development" ? otp : undefined
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT - Verify OTP
 * Body: { email, otp }
 */
export async function PUT(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Get stored OTP
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("email_otp")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
    }

    // Check if already verified
    if (otpRecord.verified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Check if expired
    if (isOTPExpired(otpRecord.expires_at)) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment failed attempts
      await supabaseAdmin
        .from("email_otp")
        .update({ failed_attempts: (otpRecord.failed_attempts || 0) + 1 })
        .eq("email", email);

      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark as verified
    await supabaseAdmin
      .from("email_otp")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("email", email);

    return NextResponse.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
