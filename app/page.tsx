import Image from "next/image";

export default function Home() {
  const products = [
    {
      id: 1,
      name: "Classic Fried Chicken",
      price: "₱120",
      image: "/chicken1.jpg",
      category: "Fried Chicken",
    },
    {
      id: 2,
      name: "Spicy Wings",
      price: "₱150",
      image: "/wings.jpg",
      category: "Wings",
    },
    {
      id: 3,
      name: "Chicken Combo Meal",
      price: "₱199",
      image: "/combo.jpg",
      category: "Combos",
    },
    {
      id: 4,
      name: "Coke",
      price: "₱40",
      image: "/drink.jpg",
      category: "Drinks",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* LEFT CATEGORY MENU */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-600">
          ELYAN Chicken Hub
        </h1>

        <ul className="space-y-4">
          <li className="cursor-pointer hover:text-orange-500 font-medium">
            Fried Chicken
          </li>
          <li className="cursor-pointer hover:text-orange-500 font-medium">
            Wings
          </li>
          <li className="cursor-pointer hover:text-orange-500 font-medium">
            Combos
          </li>
          <li className="cursor-pointer hover:text-orange-500 font-medium">
            Drinks
          </li>
        </ul>
      </aside>

      {/* PRODUCT GRID */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Menu</h2>

        <div className="grid grid-cols-3 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-orange-600 font-bold">{item.price}</p>

                <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}