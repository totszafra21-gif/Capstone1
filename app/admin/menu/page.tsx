"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type MenuItem = { id: string; name: string; price: number; image: string; category: string };

export default function AdminMenu() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({ name: "", price: "", image: "", category: "meals" });
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) { router.push("/"); return; }
      fetchItems();
    }
    checkAdminAndFetch();
  }, []);

  async function fetchItems() {
    const { data } = await supabase.from("menu_items").select("*").order("name");
    if (data) setItems(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await supabase.from("menu_items").update({ ...form, price: Number(form.price) }).eq("id", editing);
      setMessage("Item updated!");
      setEditing(null);
    } else {
      await supabase.from("menu_items").insert({ ...form, price: Number(form.price) });
      setMessage("Item added!");
    }
    setForm({ name: "", price: "", image: "", category: "meals" });
    fetchItems();
    setTimeout(() => setMessage(""), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    fetchItems();
  }

  function handleEdit(item: MenuItem) {
    setEditing(item.id);
    setForm({ name: item.name, price: String(item.price), image: item.image, category: item.category });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold text-orange-400 mb-8">ELYAN Admin</h1>
        <nav className="flex flex-col gap-3 flex-1">
          <Link href="/admin" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Dashboard</Link>
          <Link href="/admin/orders" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Orders</Link>
          <Link href="/admin/menu" className="bg-orange-500 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Users</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Menu Items</h2>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="font-semibold mb-4">{editing ? "Edit Item" : "Add New Item"}</h3>
          {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded-lg focus:outline-none focus:border-orange-500" required />
            <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 rounded-lg focus:outline-none focus:border-orange-500" required />
            <input placeholder="Image path (e.g. /classic.png)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="border p-2 rounded-lg focus:outline-none focus:border-orange-500" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-2 rounded-lg focus:outline-none focus:border-orange-500">
              <option value="meals">Meals</option>
              <option value="wings">Wings</option>
              <option value="drinks">Drinks</option>
            </select>
            <button type="submit" className="col-span-4 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
              {editing ? "Update Item" : "Add Item"}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", price: "", image: "", category: "meals" }); }} className="col-span-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>}
          </form>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4"><Image src={item.image} alt={item.name} width={50} height={50} className="rounded" /></td>
                  <td className="p-4 font-semibold">{item.name}</td>
                  <td className="p-4">₱{item.price}</td>
                  <td className="p-4 capitalize">{item.category}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
