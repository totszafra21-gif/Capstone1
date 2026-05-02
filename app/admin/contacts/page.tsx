"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/authSession";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at?: string;
};

export default function AdminContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      setError("");
      try {
        const user = await getAuthenticatedUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError("Failed to verify admin access. Please try again.");
          return;
        }

        if (!profile?.is_admin) {
          router.push("/");
          return;
        }

        const { data, error: contactsError } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });

        if (contactsError) {
          setError("Failed to load contact messages.");
          return;
        }

        setContacts((data as ContactMessage[]) || []);
      } catch {
        setError("Network error. Please check your connection then refresh.");
      }
    }

    checkAdminAndFetch();
  }, [router]);

  async function handleReply(contact: ContactMessage) {
    const reply = (replyDrafts[contact.id] || "").trim();

    if (!reply) {
      setError("Please write a reply first.");
      return;
    }

    setError("");
    setSuccess("");
    setSendingId(contact.id);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_reply",
          email: contact.email,
          data: {
            name: contact.name,
            reply,
            originalMessage: contact.message,
          },
        }),
      });

      if (!response.ok) {
        setError("Reply email could not be sent.");
        return;
      }

      setSuccess(`Reply sent to ${contact.email}.`);
      setReplyDrafts((current) => ({ ...current, [contact.id]: "" }));
    } finally {
      setSendingId(null);
    }
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
          <Link href="/admin/menu" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Menu Items</Link>
          <Link href="/admin/users" className="hover:bg-gray-700 px-4 py-2 rounded-lg">Users</Link>
          <Link href="/admin/contacts" className="bg-orange-500 px-4 py-2 rounded-lg">Contacts</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left px-4 py-2">Logout</button>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Contact Messages</h2>
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-2xl bg-white p-6 shadow">
              <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
                <p className="text-sm text-gray-400">
                  {contact.created_at ? new Date(contact.created_at).toLocaleString() : ""}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                {contact.message}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-600">Reply</label>
                <textarea
                  value={replyDrafts[contact.id] || ""}
                  onChange={(e) => setReplyDrafts((current) => ({ ...current, [contact.id]: e.target.value }))}
                  rows={4}
                  placeholder="Write your reply here..."
                  className="w-full rounded-xl border border-gray-300 p-3 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleReply(contact)}
                disabled={sendingId === contact.id}
                className="mt-4 rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {sendingId === contact.id ? "Sending..." : "Send Reply"}
              </button>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
              No contact messages yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
