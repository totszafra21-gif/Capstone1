import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST login or register
export async function POST(req: NextRequest) {
  const { type, email, password, full_name } = await req.json();

  if (type === "register") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: data.user });
  }

  if (type === "login") {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ user: data.user, session: data.session });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// POST logout
export async function DELETE() {
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Logged out" });
}
