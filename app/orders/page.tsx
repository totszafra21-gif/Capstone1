"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import { getAuthToken } from "@/lib/authSession";

type OrderItem = {
  quantity: number;
  price: number;
  menu_items: { name: string; image: string };
};

type Order = {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  delivered_confirmed?: boolean;
  delivered_confirmed_at?: string | null;
  order_items: OrderItem[];
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("orders")
        .select("*, order_items(quantity, price, menu_items(name, image))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setOrders(data as unknown as Order[]);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  async function confirmDelivered(orderId: string) {
    setMessage("");
    setConfirmingId(orderId);
    try {
      const token = await getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const resp = await fetch("/api/orders/confirm-delivered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMessage(payload?.error || "Failed to confirm delivery.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, delivered_confirmed: true, delivered_confirmed_at: new Date().toISOString() } : o
        )
      );
      setMessage(payload?.message || "Thanks! Delivery confirmed.");
    } catch {
      setMessage("Failed to confirm delivery.");
    } finally {
      setConfirmingId(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "preparing": return "bg-blue-100 text-blue-600";
      case "ready": return "bg-green-100 text-green-600";
      case "delivered": return "bg-gray-100 text-gray-600";
      case "cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-20 py-10">
        <h1 className="text-3xl font-bold mb-8 text-orange-500">My Orders 📋</h1>

        {message && (
          <div className="mb-6 bg-white rounded-xl shadow p-4 text-sm text-center">
            <span className={message.toLowerCase().includes("failed") ? "text-red-600" : "text-green-700"}>{message}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
            No orders yet. <a href="/menu" className="text-orange-500">Order now!</a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID: {order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 capitalize">
                      {order.payment_method === "cash" ? "💵 Cash on Delivery" : order.payment_method === "gcash" ? "📱 GCash" : "💳 Card"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Image src={item.menu_items.image} alt={item.menu_items.name} width={60} height={60} className="rounded-lg" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.menu_items.name}</p>
                        <p className="text-gray-500 text-sm">x{item.quantity}</p>
                      </div>
                      <p className="font-semibold">₱{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 flex justify-end">
                  <p className="text-lg font-bold">Total: <span className="text-orange-500">₱{order.total}</span></p>
                </div>

                {order.status === "delivered" && !order.delivered_confirmed && (
                  <div className="border-t mt-4 pt-4 flex justify-end">
                    <button
                      onClick={() => confirmDelivered(order.id)}
                      disabled={confirmingId === order.id}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {confirmingId === order.id ? "Confirming..." : "Confirm Delivered"}
                    </button>
                  </div>
                )}

                {order.status === "delivered" && order.delivered_confirmed && (
                  <div className="border-t mt-4 pt-4 flex justify-end">
                    <p className="text-sm text-green-700 font-semibold">Delivered confirmed ✅</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
