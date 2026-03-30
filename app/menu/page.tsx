"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase.from("menu_items").select("*");
      if (data) setMenuItems(data);
    }
    fetchMenu();
  }, []);

  async function addToCart(menuItemId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login to add items to cart.");
      return;
    }

    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("menu_item_id", menuItemId)
      .single();

    if (existing) {
      await supabase.from("cart").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({ user_id: user.id, menu_item_id: menuItemId, quantity: 1 });
    }

    setMessage("Added to cart!");
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-orange-500">ELYAN Chicken Hub</h1>
        <div className="space-x-6">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <Link href="/menu" className="hover:text-orange-500">Menu</Link>
          <Link href="/cart" className="hover:text-orange-500">Cart</Link>
          <Link href="/login" className="hover:text-orange-500">Login</Link>
        </div>
      </nav>

      <section className="px-20 py-10">
        <h2 className="text-4xl font-bold mb-8 text-center">Our Menu</h2>

        {message && (
          <p className="text-center text-green-600 font-semibold mb-4">{message}</p>
        )}

        <div className="grid grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow text-center">
              <Image src={item.image} alt={item.name} width={200} height={200} className="mx-auto" />
              <h4 className="mt-4 font-semibold">{item.name}</h4>
              <p className="text-orange-500 font-bold">₱{item.price}</p>
              <button
                onClick={() => addToCart(item.id)}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-900 text-white mt-10">
        <div className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-3 text-orange-400">ELYAN Chicken Hub</h4>
            <p className="text-gray-300">Serving crispy and delicious fried chicken, wings, and combo meals. Made fresh and perfect for everyone.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <p className="text-gray-300">📍 Philippines</p>
            <p className="text-gray-300">📞 0912-345-6789</p>
            <p className="text-gray-300">✉️ elyanchickenhub@gmail.com</p>
          </div>
        </div>
        <div className="text-center border-t border-gray-700 py-4 text-gray-400">
          © 2026 ELYAN Chicken Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
