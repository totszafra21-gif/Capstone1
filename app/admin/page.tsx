"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, orders: 0, menu: 0, revenue: 0 });

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) { router.push("/"); return; }

      const [{ count: users }, { count: orders }, { count: menu }, { data: revenue }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);

      const totalRevenue = revenue?.reduce((sum, o) => sum + o.total, 0) || 0;
      setStats({ users: users || 0, orders: orders || 0, menu: menu || 0, revenue: totalRevenue });
    }
    checkAdmin();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold text-orange-400 mb-8">ELYAN Admin</h1>
        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/admin" className="bg-orange-500 px-4 py-2 rounded-lg">Dashboard</Link>
          <Link href="/admin/orders" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Orders</Link>
          <Link href="/admin/menu" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Users</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-4xl font-bold text-orange-500">{stats.users}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-4xl font-bold text-orange-500">{stats.orders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Menu Items</p>
            <p className="text-4xl font-bold text-orange-500">{stats.menu}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-4xl font-bold text-orange-500">₱{stats.revenue}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
