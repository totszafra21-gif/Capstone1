"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow">
      <h1 className="text-2xl font-bold text-orange-500">ELYAN Chicken Hub</h1>
      <div className="space-x-6 flex items-center">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <Link href="/menu" className="hover:text-orange-500">Menu</Link>
        <Link href="/cart" className="hover:text-orange-500">Cart</Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="hover:text-orange-500">Profile</Link>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600">Logout</button>
          </div>
        ) : (
          <Link href="/login" className="hover:text-orange-500">Login</Link>
        )}
      </div>
    </nav>
  );
}
