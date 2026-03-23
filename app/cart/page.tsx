import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-8 text-orange-500">
        Your Cart 🛒
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">

        {/* Cart Item */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">

          <div className="flex items-center gap-4">
            <Image
              src="/classic.png"
              alt="Classic Fried Chicken"
              width={80}
              height={80}
              className="rounded"
            />

            <div>
              <h3 className="font-semibold">Classic Fried Chicken</h3>
              <p className="text-gray-500">₱120</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <button className="bg-gray-200 px-3 py-1 rounded">-</button>
            <span>1</span>
            <button className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>

          {/* Price */}
          <p className="font-semibold">₱120</p>

        </div>

        {/* Second Item Example */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">

          <div className="flex items-center gap-4">
            <Image
              src="/spicy.jpg"
              alt="Spicy Wings"
              width={80}
              height={80}
              className="rounded"
            />

            <div>
              <h3 className="font-semibold">Spicy Chicken Wings</h3>
              <p className="text-gray-500">₱150</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gray-200 px-3 py-1 rounded">-</button>
            <span>1</span>
            <button className="bg-gray-200 px-3 py-1 rounded">+</button>
          </div>

          <p className="font-semibold">₱150</p>

        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-6">

          <h2 className="text-xl font-bold">
            Total: ₱270
          </h2>

          <Link
            href="/checkout"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Checkout
          </Link>

        </div>

      </div>

    </div>
  );
}