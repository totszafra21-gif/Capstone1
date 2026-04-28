import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/emailSender";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Verify user JWT
    const supabaseAuthed = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await supabaseAuthed.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, status, total, shipping_address, delivered_confirmed")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Order is not marked as delivered yet." }, { status: 400 });
    }

    if (order.delivered_confirmed) {
      return NextResponse.json({ success: true, message: "Already confirmed." });
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ delivered_confirmed: true, delivered_confirmed_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Confirm delivered update error:", updateError);
      return NextResponse.json({ error: "Failed to confirm delivery." }, { status: 500 });
    }

    // Get customer email (fallback to auth user email)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    const toEmail = (profile?.email || userData.user.email || "").toLowerCase();
    let emailResult: { provider: "resend" | "smtp"; id?: string } | null = null;
    let emailError: string | null = null;
    if (toEmail) {
      try {
        emailResult = await sendEmail({
          to: toEmail,
          subject: `Delivery Confirmed #${String(orderId).slice(0, 8)} - ELYAN Chicken Hub`,
          text: `Thanks! You confirmed your order was delivered. Order: #${String(orderId).slice(0, 8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f97316;">ELYAN Chicken Hub</h1>
              <h2>Delivery Confirmed ✅</h2>
              <p>Thank you! You confirmed your order was delivered.</p>
              <p><strong>Order:</strong> #${String(orderId).slice(0, 8)}</p>
              ${order.total ? `<p><strong>Total:</strong> ₱${order.total}</p>` : ""}
              ${order.shipping_address ? `<p><strong>Delivered to:</strong> ${order.shipping_address}</p>` : ""}
            </div>
          `,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        emailError = msg;
        console.error("Confirm delivered email error:", msg);
      }
    } else {
      emailError = "Missing customer email address.";
    }

    return NextResponse.json({
      success: true,
      message: emailResult ? "Delivery confirmed. Email sent." : "Delivery confirmed. Email not sent.",
      emailTo: toEmail || null,
      emailProvider: emailResult?.provider || null,
      emailId: emailResult?.id || null,
      emailError,
    });
  } catch (error) {
    console.error("Confirm delivered error:", error);
    const message = error instanceof Error ? error.message : "Failed to confirm delivery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
