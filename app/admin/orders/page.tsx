"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchOrders = useCallback(async (manualRefresh = false) => {
    setError("");
    if (manualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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

      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const ordersWithProfiles = await Promise.all(
          data.map(async (order) => {
            const { data: orderProfile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", order.user_id)
              .single();

            return { ...order, profiles: orderProfile };
          })
        );

        setOrders(ordersWithProfiles as unknown as Order[]);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch {
      setError("Network error. Please check your connection then refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchOrders();

    const interval = setInterval(() => {
      void fetchOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateStatus(id: string, status: string) {
    setError("");
    setStatusMessage("");

    const order = orders.find((item) => item.id === id);
    if (!order) {
      setError("Order not found.");
      return;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError("Failed to update order status.");
      return;
    }

    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setLastUpdated(new Date().toLocaleString());

    if ((status === "preparing" || status === "ready") && order.profiles?.email) {
      const emailType = status === "preparing" ? "order_preparing" : "order_ready";
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          email: order.profiles.email,
          data: {
            orderId: order.id,
            total: order.total,
            address: order.shipping_address,
          },
        }),
      });

      if (!response.ok) {
        setError(`Order status updated, but the ${status} email could not be sent.`);
        return;
      }

      setStatusMessage(`Order updated and ${status} email sent.`);
      return;
    }

    setStatusMessage("Order status updated.");
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
          <Link href="/admin/contacts" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Contacts</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Orders</h2>
            {lastUpdated && (
              <p className="mt-1 text-sm text-gray-500">Last updated: {lastUpdated}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders(true)}
            disabled={refreshing}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {statusMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Delivery</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                )}

                {!loading && orders.map((order) => (
                  <tr key={order.id} className="border-t align-top">
                    <td className="p-4">
                      <p className="font-semibold">{order.profiles?.full_name || "Unknown customer"}</p>
                      <p className="text-xs text-gray-400">{order.profiles?.email || "No email"}</p>
                    </td>
                    <td className="p-4 font-semibold">PHP {order.total}</td>
                    <td className="p-4 capitalize">{order.payment_method}</td>
                    <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-4 text-xs text-gray-600">
                      <p className="font-medium text-gray-800">{order.shipping_name || "-"}</p>
                      <p>{order.shipping_phone || "-"}</p>
                      <p>{order.shipping_address || "-"}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => void updateStatus(order.id, e.target.value)}
                        className="rounded-lg border border-gray-300 p-1 text-sm focus:border-orange-500 focus:outline-none"
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

                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
