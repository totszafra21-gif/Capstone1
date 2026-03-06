import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-orange-500">
          ELYAN Chicken Hub
        </h1>

        <div className="space-x-6">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <Link href="/menu" className="hover:text-orange-500">Menu</Link>
          <Link href="/cart" className="hover:text-orange-500">Cart</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex items-center justify-between px-20 py-16">

        <div className="max-w-lg">
          <h2 className="text-5xl font-bold mb-6">
            Crispy & Delicious <br />
            Fried Chicken 🍗
          </h2>

          <p className="text-gray-600 mb-6">
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
          src="/logo.png"
          alt="Chicken"
          width={400}
          height={400}
          className="rounded-xl"
        />

      </section>

      {/* FEATURED SECTION */}
      <section className="px-20 py-10">

        <h3 className="text-3xl font-bold mb-8 text-center">
          Popular Meals
        </h3>

        <div className="grid grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Image
              src="/logo.png"
              alt="Fried Chicken"
              width={200}
              height={200}
              className="mx-auto"
            />
            <h4 className="mt-4 font-semibold">Classic Fried Chicken</h4>
            <p className="text-orange-500 font-bold">₱120</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Image
              src="/logo.png"
              alt="Wings"
              width={200}
              height={200}
              className="mx-auto"
            />
            <h4 className="mt-4 font-semibold">Spicy Chicken Wings</h4>
            <p className="text-orange-500 font-bold">₱150</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Image
              src="/logo.png"
              alt="Combo"
              width={200}
              height={200}
              className="mx-auto"
            />
            <h4 className="mt-4 font-semibold">Chicken Combo Meal</h4>
            <p className="text-orange-500 font-bold">₱199</p>
          </div>

        </div>

      </section>

    </div>
  );
}