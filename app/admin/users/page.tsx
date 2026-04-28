"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/authSession";

type Profile = { id: string; full_name: string; email: string; phone: string; address: string; is_admin: boolean; created_at: string };

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      setError("");
      try {
        const user = await getAuthenticatedUser();
        if (!user) {
          router.push("/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        if (profileError) {
          setError("Failed to verify admin access. Please try again.");
          return;
        }
        if (!profile?.is_admin) {
          router.push("/");
          return;
        }

        const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (data) setUsers(data);
      } catch {
        setError("Network error. Please check your connection then refresh.");
      }
    }
    checkAdminAndFetch();
  }, []);

  async function toggleAdmin(id: string, is_admin: boolean) {
    await supabase.from("profiles").update({ is_admin: !is_admin }).eq("id", id);
    setUsers(users.map(u => u.id === id ? { ...u, is_admin: !is_admin } : u));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    setUsers(users.filter(u => u.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold text-orange-400 mb-8">ELYAN Admin</h1>
        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/admin" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Dashboard</Link>
          <Link href="/admin/orders" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Orders</Link>
          <Link href="/admin/menu" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="bg-orange-500 px-4 py-2 rounded-lg">Users</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Users</h2>
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4 font-semibold">{user.full_name}</td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4 text-gray-500">{user.phone || "-"}</td>
                  <td className="p-4 text-gray-500">{user.address || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_admin ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => toggleAdmin(user.id, user.is_admin)} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-xs">
                      {user.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
