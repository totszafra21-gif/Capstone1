import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden pt-20">
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex items-center justify-between px-24 py-5 bg-white shadow-sm">

        <div className="max-w-lg">
          <p className="text-orange-500 font-semibold text-sm mb-1 uppercase tracking-widest">Welcome to ELYAN Chicken Hub</p>
          <h2 className="text-3xl font-extrabold mb-2 leading-tight">
            Crispy & Delicious <br />
            Fried Chicken 🍗
          </h2>

          <p className="text-gray-500 mb-3 text-sm">
            Enjoy our freshly cooked fried chicken, wings, and combo meals made with love.
          </p>

          <Link
            href="/menu"
            className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 font-semibold shadow-md text-sm"
          >
            Order Now →
          </Link>
        </div>

        {/* HERO IMAGE */}
        <Image
          src="/chickens.png"
          alt="Chicken"
          width={220}
          height={220}
          className="rounded-2xl drop-shadow-xl"
        />

      </section>

      {/* FEATURED SECTION */}
      <section className="px-24 py-5 flex-1">

        <h3 className="text-lg font-bold mb-3 text-center text-gray-800">
          🔥 Popular Meals
        </h3>

        <div className="flex justify-center gap-6">

          <Link href="/menu" className="bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <Image src="/classic.png" alt="Fried Chicken" width={110} height={110} className="mx-auto rounded-xl" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">Classic Fried Chicken</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱120</p>
          </Link>

          <Link href="/menu" className="bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <Image src="/spicy.jpg" alt="Wings" width={110} height={110} className="mx-auto rounded-xl" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">Spicy Chicken Wings</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱150</p>
          </Link>

          <Link href="/menu" className="bg-white p-3 rounded-2xl shadow-md text-center w-52 hover:shadow-lg transition">
            <Image src="/C1.png" alt="1pc Chicken with Rice" width={110} height={110} className="mx-auto rounded-xl" />
            <h4 className="mt-2 font-semibold text-gray-800 text-sm">1pc Chicken with Rice</h4>
            <p className="text-orange-500 font-bold mt-1 text-sm">₱99</p>
          </Link>

        </div>

      </section>

      {/* FOOTER */}
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
