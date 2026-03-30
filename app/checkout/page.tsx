"use client";

import Link from "next/link";

export default function Checkout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6">Thank you for your order. We're preparing your delicious chicken now!</p>
        <Link href="/menu" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
          Order More
        </Link>
      </div>
    </div>
  );
}
