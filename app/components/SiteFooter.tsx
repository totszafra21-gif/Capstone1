export default function SiteFooter() {
  return (
    <footer className="mt-10 bg-[#0b1730] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-10 py-4 md:grid-cols-3">
        <div>
          <h4 className="mb-1 text-3xl font-bold text-orange-400">ELYAN Chicken Hub</h4>
          <p className="text-sm text-gray-200">
            Serving crispy and delicious fried chicken, wings, and combo meals.
          </p>
          <p className="text-sm text-gray-200">Made fresh and perfect for everyone.</p>
        </div>

        <div>
          <h4 className="mb-1 text-2xl font-semibold">Reach Us</h4>
          <p className="text-sm text-gray-100">📍 Philippines</p>
          <p className="text-sm text-gray-100">📞 0912-345-6789</p>
          <p className="text-sm text-gray-100">✉ elyanchickenhub@gmail.com</p>
        </div>

        <div>
          <h4 className="mb-1 text-2xl font-semibold">Store Info</h4>
          <p className="text-sm text-gray-100"><span className="font-semibold text-white">Store Hours:</span> 9:00 AM - 9:00 PM</p>
          <p className="mt-2 text-sm text-gray-100"><span className="font-semibold text-white">Delivery Areas:</span> Talamban, Banilad, Lahug</p>
        </div>
      </div>

      <div className="border-t border-[#223252] py-2 text-center text-sm text-gray-300">
        © 2026 ELYAN Chicken Hub. All rights reserved.
      </div>
    </footer>
  );
}
