import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/emailSender";
import { validateEmailSecurity } from "@/lib/emailSecurity";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email } = await req.json();

    const validation = validateEmailSecurity(email);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors.join(". ") }, { status: 400 });
    }

    const sanitizedEmail = validation.sanitized;

    // Always respond success to avoid account enumeration.
    const alwaysOk = NextResponse.json({
      success: true,
      message: "If the email exists, we sent a password reset link.",
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Create/replace any existing token for this email
    const { error: upsertError } = await supabaseAdmin.from("password_reset_tokens").upsert(
      {
        email: sanitizedEmail,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false,
        used_at: null,
      },
      { onConflict: "email" }
    );

    if (upsertError) {
      console.error("Password reset token storage error:", upsertError);
      if (upsertError.message?.includes("schema cache") || upsertError.message?.includes("Could not find the table")) {
        return NextResponse.json(
          {
            error:
              "Password reset table is missing in Supabase. Run `sql/password_reset_tokens.sql` in Supabase SQL Editor, then retry.",
            details: upsertError.message,
          },
          { status: 500 }
        );
      }
      // Still avoid enumeration; but log the error.
      return alwaysOk;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL (or NEXT_PUBLIC_SITE_URL / VERCEL_URL) for reset links.");
      return NextResponse.json(
        { error: "Server not configured. Missing NEXT_PUBLIC_APP_URL for reset links." },
        { status: 500 }
      );
    }

    const resetUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(sanitizedEmail)}&token=${encodeURIComponent(
      token
    )}`;

    await sendEmail({
      to: sanitizedEmail,
      subject: "Reset your password - ELYAN Chicken Hub",
      text: `Reset your password using this link (expires in 1 hour): ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
          <h2>Reset Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return alwaysOk;
  } catch (error) {
    console.error("Forgot password error:", error);
    const message = error instanceof Error ? error.message : "Failed to request password reset";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

