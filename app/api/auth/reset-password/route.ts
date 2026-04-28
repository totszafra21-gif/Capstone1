import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/emailSender";
import { getPasswordStrength } from "@/lib/emailSecurity";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Email, token, and newPassword are required" }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (getPasswordStrength(String(newPassword)) < 2) {
      return NextResponse.json(
        { error: "Password is too weak. Use at least 8 characters with letters, numbers, and symbols." },
        { status: 400 }
      );
    }

    const tokenHash = sha256Hex(String(token));

    const { data: record, error: fetchError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("email", String(email).toLowerCase())
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (record.used) {
      return NextResponse.json({ error: "This reset link was already used." }, { status: 400 });
    }

    const expiresAt = new Date(record.expires_at).getTime();
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    if (record.token_hash !== tokenHash) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    // Find user by email (auth admin API does not provide getUserByEmail)
    const targetEmail = String(email).toLowerCase();
    let userId: string | null = null;
    for (let page = 1; page <= 10 && !userId; page++) {
      const { data: usersPage, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (listError) {
        console.error("User list error:", listError);
        break;
      }
      const found = usersPage?.users?.find((u) => (u.email || "").toLowerCase() === targetEmail);
      if (found?.id) userId = found.id;
      if (!usersPage?.users?.length) break;
    }

    if (!userId) {
      // Avoid revealing if email exists
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: String(newPassword),
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json({ error: "Failed to update password. Please try again." }, { status: 500 });
    }

    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("email", String(email).toLowerCase());

    // Notify user that password was changed
    await sendEmail({
      to: String(email).toLowerCase(),
      subject: "Password changed - ELYAN Chicken Hub",
      text: "Your password was successfully changed. If you did not do this, please reset your password again immediately.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
          <h2>Password Changed</h2>
          <p>Your password was successfully changed.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If you didn't do this, please reset your password again immediately.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
