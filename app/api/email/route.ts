import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send email using Resend API
 * Works with confirmation emails, OTPs, notifications
 */
export async function POST(req: Request) {
  try {
    const { type, email, data } = await req.json();

    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured. Add RESEND_API_KEY to .env" },
        { status: 500 }
      );
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "confirmation":
        subject = "Confirm your email - ELYAN Chicken Hub";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
            <h2>Welcome!</h2>
            <p>Thank you for registering. Please confirm your email address.</p>
            <a href="${data.confirmUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Confirm Email
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `;
        break;

      case "otp":
        subject = "Your OTP Code - ELYAN Chicken Hub";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
            <h2>Your Verification Code</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${data.otp}</span>
            </div>
            <p>This code expires in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        `;
        break;

      case "order_confirmation":
        subject = `Order Confirmed #${data.orderId} - ELYAN Chicken Hub`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
            <h2>Order Confirmed! 🍗</h2>
            <p>Thank you for your order #${data.orderId}</p>
            <p><strong>Total:</strong> ₱${data.total}</p>
            <p><strong>Delivery Address:</strong> ${data.address}</p>
            <p>We'll notify you when your order is ready!</p>
          </div>
        `;
        break;

      case "password_reset":
        subject = "Reset your password - ELYAN Chicken Hub";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
            <h2>Reset Password</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        `;
        break;

      case "delivered_confirmation":
        subject = `Order Delivered #${data.orderId} - ELYAN Chicken Hub`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
            <h2>Your order has been delivered ✅</h2>
            <p>Thanks for ordering with us!</p>
            <p><strong>Order:</strong> #${data.orderId}</p>
            ${data.total ? `<p><strong>Total:</strong> ₱${data.total}</p>` : ""}
            ${data.address ? `<p><strong>Delivered to:</strong> ${data.address}</p>` : ""}
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If you didn't receive this order, please reply to this email.
            </p>
          </div>
        `;
        break;

      default:
        subject = data.subject || "ELYAN Chicken Hub";
        html = data.html || "<p>Message from ELYAN Chicken Hub</p>";
    }

    const result = await resend.emails.send({
      from: "ELYAN Chicken Hub <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
