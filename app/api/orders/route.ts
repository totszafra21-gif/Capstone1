import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET orders for a user
export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price, menu_items(name, image))")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST place an order
export async function POST(req: NextRequest) {
  const { user_id, cart_items } = await req.json();

  const total = cart_items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id, total, status: "pending" })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const orderItems = cart_items.map((item: { menu_item_id: string; quantity: number; price: number }) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  // Clear cart after order
  await supabase.from("cart").delete().eq("user_id", user_id);

  return NextResponse.json(order);
}
