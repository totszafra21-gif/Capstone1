import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("cart")
    .select("id, quantity, menu_items(id, name, price, image)")
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const { user_id, menu_item_id } = await req.json();

  const { data: existing } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user_id)
    .eq("menu_item_id", menu_item_id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("cart")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("cart")
    .insert({ user_id, menu_item_id, quantity: 1 })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const { id, quantity } = await req.json();

  if (quantity < 1) {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Item removed" });
  }

  const { data, error } = await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await supabase.from("cart").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Item removed" });
}
