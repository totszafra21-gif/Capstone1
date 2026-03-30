"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px] text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{profile?.full_name}</h2>
          <p className="text-gray-500 mb-6">{profile?.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg w-full"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
