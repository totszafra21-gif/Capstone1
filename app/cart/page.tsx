"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

type CartItem = {
  id: string;
  quantity: number;
  menu_items: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("full_name, phone, address").eq("id", user.id).single();
    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    }
  }

  async function fetchCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data } = await supabase
      .from("cart")
      .select("id, quantity, menu_items(id, name, price, image)")
      .eq("user_id", user.id);

    if (data) setCartItems(data as unknown as CartItem[]);
    setLoading(false);
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      await supabase.from("cart").delete().eq("id", id);
    } else {
      await supabase.from("cart").update({ quantity }).eq("id", id);
    }
    fetchCart();
  }

  async function handleCheckout() {
    if (!fullName || !phone || !address) {
      setShippingError("Please fill in all shipping information.");
      return;
    }
    setShippingError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const total = cartItems.reduce((sum, item) => sum + item.menu_items.price * item.quantity, 0);

    const { data: order } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "pending", payment_method: paymentMethod, shipping_name: fullName, shipping_phone: phone, shipping_address: address })
      .select()
      .single();

    if (order) {
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_items.id,
        quantity: item.quantity,
        price: item.menu_items.price,
      }));

      await supabase.from("order_items").insert(orderItems);
      await supabase.from("cart").delete().eq("user_id", user.id);
      router.push("/checkout");
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.menu_items.price * item.quantity, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-20 py-10">
        <h1 className="text-3xl font-bold mb-8 text-orange-500">Your Cart 🛒</h1>

        <div className="bg-white p-6 rounded-xl shadow">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Your cart is empty. <Link href="/menu" className="text-orange-500">Order now!</Link></p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Image src={item.menu_items.image} alt={item.menu_items.name} width={80} height={80} className="rounded" />
                    <div>
                      <h3 className="font-semibold">{item.menu_items.name}</h3>
                      <p className="text-gray-500">₱{item.menu_items.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-gray-200 px-3 py-1 rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-200 px-3 py-1 rounded">+</button>
                  </div>
                  <p className="font-semibold">₱{item.menu_items.price * item.quantity}</p>
                </div>
              ))}

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">🚚 Shipping Information</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
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
                    <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      rows={3}
                      className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  {shippingError && <p className="text-red-500 text-sm">{shippingError}</p>}
                </div>

                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                <div className="flex gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                    <span>💵 Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="gcash" checked={paymentMethod === "gcash"} onChange={() => setPaymentMethod("gcash")} />
                    <span>📱 GCash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                    <span>💳 Card</span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Total: ₱{total}</h2>
                  <button
                    onClick={handleCheckout}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
