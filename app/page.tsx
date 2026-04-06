import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex items-center justify-between px-20 py-4">

        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-2">
            Crispy & Delicious <br />
            Fried Chicken 🍗
          </h2>

          <p className="text-gray-600 mb-3 text-sm">
            Welcome to ELYAN Chicken Hub. Enjoy our freshly cooked
            fried chicken, wings, and combo meals made with love.
          </p>

          <Link
            href="/menu"
            className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 text-sm"
          >
            Order Now
          </Link>
        </div>

        {/* HERO IMAGE */}
        <Image
          src="/chickens.png"
          alt="Chicken"
          width={280}
          height={280}
          className="rounded-xl"
        />

      </section>

      {/* FEATURED SECTION */}
      <section className="px-20 py-2 flex-1">

        <h3 className="text-xl font-bold mb-3 text-center">
          Popular Meals
        </h3>

        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white p-3 rounded-xl shadow text-center">
            <Image src="/classic.png" alt="Fried Chicken" width={100} height={100} className="mx-auto" />
            <h4 className="mt-2 font-semibold text-sm">Classic Fried Chicken</h4>
            <p className="text-orange-500 font-bold text-sm">₱120</p>
          </div>

          <div className="bg-white p-3 rounded-xl shadow text-center">
            <Image src="/spicy.jpg" alt="Wings" width={100} height={100} className="mx-auto" />
            <h4 className="mt-2 font-semibold text-sm">Spicy Chicken Wings</h4>
            <p className="text-orange-500 font-bold text-sm">₱150</p>
          </div>

          <div className="bg-white p-3 rounded-xl shadow text-center">
            <Image src="/C1.png" alt="1pc Chicken with Rice" width={100} height={100} className="mx-auto" />
            <h4 className="mt-2 font-semibold text-sm">1pc Chicken with Rice</h4>
            <p className="text-orange-500 font-bold text-sm">₱99</p>
          </div>

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
