"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";

const slides = [
  { title: "🍗 1 PC Chicken with Rice", image: "/pc1.png", description: "Crispy fried chicken with steamed rice", bg: "from-orange-100 to-orange-200" },
  { title: "🍗🍗 2 PC Chicken with Rice", image: "/2pc.png", description: "Double chicken, double satisfaction", bg: "from-yellow-100 to-yellow-200" },
  { title: "🌯 Lumpia with Rice", image: "/Lumpia.png", description: "Crispy Filipino spring rolls with rice", bg: "from-green-100 to-green-200" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex items-center justify-between px-24 py-16 bg-white shadow-sm mt-20 gap-10">

        {/* LEFT - WELCOME TEXT */}
        <div className="max-w-lg text-center flex-1">
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

        {/* RIGHT - CAROUSEL */}
        <div className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${slides[current].bg} rounded-2xl p-8 w-[420px] min-h-[320px] shadow-lg transition-all duration-500`}>
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">{slides[current].title}</h3>
          <Image src={slides[current].image} alt={slides[current].title} width={200} height={200} className="rounded-xl object-cover w-[200px] h-[200px] shadow-md" />
          <p className="mt-3 text-gray-600 text-sm text-center">{slides[current].description}</p>
          <div className="flex gap-2 mt-4">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === current ? "bg-orange-500" : "bg-gray-300"}`} />
            ))}
          </div>
          <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow px-2 py-1 rounded-full text-orange-500 hover:bg-orange-50">‹</button>
          <button onClick={() => setCurrent((current + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow px-2 py-1 rounded-full text-orange-500 hover:bg-orange-50">›</button>
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
