"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

export default function Checkout() {
  const [order, setOrder] = useState<{ total: number; payment_method: string; status: string } | null>(null);

  useEffect(() => {
    async function fetchLatestOrder() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("total, payment_method, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setOrder(data);
    }
    fetchLatestOrder();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">Thank you for your order. We're preparing your delicious chicken now!</p>

          {order && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-gray-700"><span className="font-semibold">Total:</span> ₱{order.total}</p>
              <p className="text-gray-700"><span className="font-semibold">Payment:</span> {order.payment_method === "cash" ? "💵 Cash on Delivery" : order.payment_method === "gcash" ? "📱 GCash" : "💳 Card"}</p>
              <p className="text-gray-700"><span className="font-semibold">Status:</span> <span className="text-orange-500 capitalize">{order.status}</span></p>
            </div>
          )}

          <Link href="/menu" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
}
