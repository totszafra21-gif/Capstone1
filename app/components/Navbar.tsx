"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <nav className="flex justify-between items-center p-6 bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <Image src="/chickens.png" alt="logo" width={40} height={40} className="rounded-full" />
        <h1 className="text-2xl font-bold text-orange-500">ELYAN Chicken Hub</h1>
      </div>
      <div className="space-x-6 flex items-center">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <Link href="/menu" className="hover:text-orange-500">Menu</Link>
        {user && (
          <Link href="/cart" className="hover:text-orange-500">Cart</Link>
        )}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 hover:text-orange-500 font-medium"
            >
              Profile ▾
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-orange-50 hover:text-orange-500 text-sm">👤 Profile</Link>
                <Link href="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-orange-50 hover:text-orange-500 text-sm">📋 My Orders</Link>
                <Link href="/contact" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 hover:bg-orange-50 hover:text-orange-500 text-sm">✉️ Contact</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm">🚪 Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="hover:text-orange-500">Login</Link>
        )}
      </div>
    </nav>
  );
}
