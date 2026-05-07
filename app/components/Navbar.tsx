"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { validateSession, handleAuthError, signOut } from "@/lib/authSession";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await validateSession();
        setUser(session?.user ?? null);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (
          !errorMsg.includes("Invalid Refresh Token") &&
          !errorMsg.includes("Refresh Token Not Found") &&
          !errorMsg.includes("invalid_token")
        ) {
          console.error("Auth error:", error);
        }

        const { shouldLogout } = handleAuthError(error);
        if (shouldLogout) {
          await signOut();
        }

        setUser(null);
      }
    }

    void checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white p-6 shadow">
      <div className="flex items-center gap-3">
        <Image
          src="/chickens.png"
          alt="logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-orange-500">ELYAN Chicken Hub</h1>
      </div>

      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:text-orange-500">
          Home
        </Link>
        <Link href="/menu" className="hover:text-orange-500">
          Menu
        </Link>
        <Link href="/about" className="hover:text-orange-500">
          About
        </Link>
        {user && (
          <Link href="/cart" className="hover:text-orange-500">
            Cart
          </Link>
        )}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 font-medium hover:text-orange-500"
            >
              Profile
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-gray-100 bg-white shadow-lg">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-500"
                >
                  Profile
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-500"
                >
                  Messages
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-500"
                >
                  My Orders
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-500"
                >
                  Contact
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="hover:text-orange-500">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
