"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/authSession";

type Order = {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  profiles: { full_name: string; email: string };
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
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

        const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

        if (data) {
          const ordersWithProfiles = await Promise.all(
            data.map(async (order) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", order.user_id)
                .single();
              return { ...order, profiles: profile };
            })
          );
          setOrders(ordersWithProfiles as unknown as Order[]);
        }
      } catch {
        setError("Network error. Please check your connection then refresh.");
      }
    }
    checkAdminAndFetch();
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updatedOrders);
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
          <Link href="/admin/orders" className="bg-orange-500 px-4 py-2 rounded-lg">Orders</Link>
          <Link href="/admin/menu" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Users</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Orders</h2>
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4">
                    <p className="font-semibold">{order.profiles?.full_name}</p>
                    <p className="text-gray-400 text-xs">{order.profiles?.email}</p>
                  </td>
                  <td className="p-4 font-semibold">₱{order.total}</td>
                  <td className="p-4 capitalize">{order.payment_method}</td>
                  <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg p-1 text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
