"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("all");

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="px-24 pt-28 pb-10">
        <h2 className="text-4xl font-extrabold mb-2 text-center text-gray-800">Our Menu</h2>
        <p className="text-center text-gray-500 mb-8">Choose from our freshly prepared meals</p>

        {/* Category Icons */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { value: "all", label: "All", icon: "🍽️" },
            { value: "meals", label: "Meals", icon: "🍗" },
            { value: "wings", label: "Wings", icon: "🔥" },
            { value: "drinks", label: "Drinks", icon: "🥤" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl font-semibold transition ${
                category === cat.value
                  ? "bg-orange-500 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-orange-100"
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>

        {message && (
          <div className="fixed top-24 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            🛒 {message}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {menuItems.filter(item => category === "all" || item.category === category).map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-md text-center hover:shadow-lg transition">
              <Image src={item.image} alt={item.name} width={180} height={180} className="mx-auto rounded-xl object-cover w-[180px] h-[180px]" />
              <h4 className="mt-4 font-semibold text-gray-800">{item.name}</h4>
              <p className="text-orange-500 font-bold mt-1">₱{item.price}</p>
              <button
                onClick={() => addToCart(item.id)}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 w-full font-semibold shadow-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-10 py-3 grid grid-cols-3 gap-8">
          <div>
            <h4 className="text-base font-bold mb-1 text-orange-400">ELYAN Chicken Hub</h4>
            <p className="text-gray-300 text-xs">Serving crispy and delicious fried chicken, wings, and combo meals. Made fresh and perfect for everyone.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Contact</h4>
            <p className="text-gray-300 text-xs">📍 Philippines</p>
            <p className="text-gray-300 text-xs">📞 0912-345-6789</p>
            <p className="text-gray-300 text-xs">✉️ elyanchickenhub@gmail.com</p>
          </div>
        </div>
        <div className="text-center border-t border-gray-700 py-2 text-gray-400 text-xs">
          © 2026 ELYAN Chicken Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
