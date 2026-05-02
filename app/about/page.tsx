"use client";

import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="px-24 pt-28 pb-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-10 shadow-lg">
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-orange-500">
            About Us
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-gray-900">
            Welcome to ELYAN Chicken Hub
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
            ELYAN Chicken Hub serves crispy fried chicken, flavorful wings, and satisfying meals
            made fresh for students, families, and anyone craving comfort food.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
              <h2 className="text-lg font-bold text-gray-900">Our Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                To serve delicious, affordable meals that bring people together and keep them coming
                back for more.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">What We Serve</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                From classic chicken meals to wings, we focus on fresh flavor,
                generous portions, and quick service.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
              <h2 className="text-lg font-bold text-gray-900">Why Customers Choose Us</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Customers count on us for crispy texture, friendly service, and meals that feel
                both comforting and satisfying.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
