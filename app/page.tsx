import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex items-center justify-between px-20 py-6">

        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-3">
            Crispy & Delicious <br />
            Fried Chicken 🍗
          </h2>

          <p className="text-gray-600 mb-4 text-sm">
            Welcome to ELYAN Chicken Hub. Enjoy our freshly cooked
            fried chicken, wings, and combo meals made with love.
          </p>

          <Link
            href="/menu"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Order Now
          </Link>
        </div>

        {/* HERO IMAGE */}
        <Image
          src="/chickens.png"
          alt="Chicken"
          width={400}
          height={400}
          className="rounded-xl"
        />

      </section>

      {/* FEATURED SECTION */}
      <section className="px-20 py-4">

        <h3 className="text-2xl font-bold mb-4 text-center">
          Popular Meals
        </h3>

        <div className="grid grid-cols-3 gap-8">

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <Image
              src="/classic.png"
              alt="Fried Chicken"
              width={120}
              height={120}
              className="mx-auto"
            />
            <h4 className="mt-2 font-semibold text-sm">Classic Fried Chicken</h4>
            <p className="text-orange-500 font-bold text-sm">₱120</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <Image
              src="/spicy.jpg"
              alt="Wings"
              width={120}
              height={120}
              className="mx-auto"
            />
            <h4 className="mt-2 font-semibold text-sm">Spicy Chicken Wings</h4>
            <p className="text-orange-500 font-bold text-sm">₱150</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <Image
              src="/C1.png"
              alt="1pc Chicken with Rice"
              width={120}
              height={120}
              className="mx-auto"
            />
            <h4 className="mt-2 font-semibold text-sm">1pc Chicken with Rice</h4>
            <p className="text-orange-500 font-bold text-sm">₱99</p>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white mt-4">
        <div className="max-w-7xl mx-auto px-10 py-4 grid grid-cols-3 gap-8">

          {/* About */}
          <div>
            <h4 className="text-xl font-bold mb-3 text-orange-400">
              ELYAN Chicken Hub
            </h4>
            <p className="text-gray-300">
              Serving crispy and delicious fried chicken, wings, and combo meals.
              Made fresh and perfect for everyone.
            </p>
          </div>

          {/* Contact */}
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
