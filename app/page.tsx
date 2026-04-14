"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex items-center justify-center px-24 py-16 bg-white shadow-sm mt-20">
        <div className="max-w-lg text-center">
          <p className="text-orange-500 font-semibold text-lg mb-3 uppercase tracking-widest">Welcome to ELYAN Chicken Hub</p>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Crispy & Delicious <br />
            Fried Chicken 🍗
          </h2>
          <p className="text-gray-500 mb-8">
            Enjoy our freshly cooked fried chicken, wings, and combo meals made with love.
          </p>
          <Link href="/menu" className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 font-semibold shadow-md">
            Order Now →
          </Link>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="px-24 py-6">
        <h3 className="text-lg font-bold mb-4 text-center text-gray-800">🔥 Popular Meals</h3>
        <div className="flex justify-center gap-6">

          <Link href="/menu" className="relative bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">🔥 Best Seller</span>
            <Image src="/2pc.png" alt="Fried Chicken" width={110} height={110} className="mx-auto rounded-xl object-cover w-[110px] h-[110px]" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">Classic Fried Chicken</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱120</p>
          </Link>

          <Link href="/menu" className="relative bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">🌶️ Spicy</span>
            <Image src="/spicy.jpg" alt="Wings" width={110} height={110} className="mx-auto rounded-xl object-cover w-[110px] h-[110px]" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">Spicy Chicken Wings</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱150</p>
          </Link>

          <Link href="/menu" className="relative bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">✅ Value</span>
            <Image src="/pc1.png" alt="1pc Chicken with Rice" width={110} height={110} className="mx-auto rounded-xl object-cover w-[110px] h-[110px]" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">1pc Chicken with Rice</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱99</p>
          </Link>

          <Link href="/menu" className="relative bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">🔥 Best Seller</span>
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">10% OFF</span>
            <Image src="/Lumpia.png" alt="Lumpia with Chicken" width={110} height={110} className="mx-auto rounded-xl object-cover w-[110px] h-[110px]" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">Lumpia with Chicken</h4>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-gray-400 line-through text-xs">₱50</p>
              <p className="text-orange-500 font-bold text-sm">₱45</p>
            </div>
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-10 py-4 grid grid-cols-3 gap-8">
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
