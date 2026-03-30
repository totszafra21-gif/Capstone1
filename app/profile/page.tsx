"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; email: string; phone: string; address: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setEmail(data.email);
        setPhone(data.phone || "");
        setAddress(data.address || "");
      }
    }
    fetchProfile();
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({ full_name: fullName, email, phone, address }).eq("id", user.id);
    if (error) {
      setMessage("Failed to update profile.");
    } else {
      setMessage("Profile updated successfully!");
      setProfile({ full_name: fullName, email, phone, address });
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setDeleting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[450px]">

          {/* Avatar */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
          </div>

          {/* Update Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {message && <p className={`text-sm text-center ${message.includes("Failed") ? "text-red-500" : "text-green-600"}`}>{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-full py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
