"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/authSession";

type ContactReply = {
  id: string;
  user_id?: string;
  sender: "user" | "admin";
  message: string;
  created_at?: string;
};

type ContactMessage = {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  message: string;
  admin_reply?: string;
  replied_at?: string;
  created_at?: string;
  contact_replies?: ContactReply[];
};

function buildThread(contact: ContactMessage) {
  const replies = [...(contact.contact_replies || [])].sort((a, b) =>
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  const items = [
    {
      id: `${contact.id}-initial`,
      sender: "user" as const,
      message: contact.message,
      created_at: contact.created_at,
    },
    ...replies,
  ];

  const hasLegacyReply = contact.admin_reply
    && !replies.some((reply) => reply.sender === "admin" && reply.message === contact.admin_reply);

  if (hasLegacyReply) {
    items.push({
      id: `${contact.id}-legacy-admin-reply`,
      sender: "admin" as const,
      message: contact.admin_reply || "",
      created_at: contact.replied_at,
    });
  }

  return items.sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
}

export default function AdminContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const threadPanelRef = useRef<HTMLDivElement | null>(null);

  const fetchContacts = useCallback(async () => {
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

      const { data, error: contactsError } = await supabase
        .from("contacts")
        .select("id, user_id, name, email, message, admin_reply, replied_at, created_at, contact_replies(id, user_id, sender, message, created_at)")
        .order("created_at", { ascending: false });

      if (contactsError) {
        const shouldFallbackToBaseContacts =
          contactsError.message?.toLowerCase().includes("contact_replies")
          || contactsError.message?.toLowerCase().includes("relationship")
          || contactsError.message?.toLowerCase().includes("schema cache");

        if (!shouldFallbackToBaseContacts) {
          setError("Failed to load contact messages.");
          return;
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from("contacts")
          .select("id, user_id, name, email, message, admin_reply, replied_at, created_at")
          .order("created_at", { ascending: false });

        if (fallbackError) {
          setError("Failed to load contact messages.");
          return;
        }

        setContacts(((fallbackData as ContactMessage[]) || []).map((item) => ({
          ...item,
          contact_replies: [],
        })));
        setLastUpdated(new Date().toLocaleString());
        setError("Loaded messages, but threaded replies are unavailable. Run sql/contact_thread_replies.sql in Supabase to enable them.");
        return;
      }

      setContacts((data as ContactMessage[]) || []);
      setLastUpdated(new Date().toLocaleString());
    } catch {
      setError("Network error. Please check your connection then refresh.");
    }
  }, [router]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (contacts.length === 0) {
      setActiveContactId(null);
      return;
    }

    if (!activeContactId) {
      setActiveContactId(contacts[0].id);
      return;
    }

    const activeExists = contacts.some((item) => item.id === activeContactId);
    if (!activeExists) {
      setActiveContactId(contacts[0].id);
    }
  }, [contacts, activeContactId]);

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
      const adminUser = await getAuthenticatedUser();
      if (!adminUser) {
        router.push("/login");
        return;
      }

      const replyTimestamp = new Date().toISOString();

      const { data: insertedReply, error: insertError } = await supabase
        .from("contact_replies")
        .insert({
          contact_id: contact.id,
          user_id: adminUser.id,
          sender: "admin",
          message: reply,
        })
        .select("id, user_id, sender, message, created_at")
        .single();

      if (insertError) {
        const dbMessage = insertError.message || "";
        if (dbMessage.includes("contact_replies") || dbMessage.includes("schema cache")) {
          setError("Reply could not be saved because the contact_replies table is missing. Run sql/contact_thread_replies.sql in Supabase first.");
        } else {
          setError(`Reply could not be saved: ${dbMessage}`);
        }
        return;
      }

      await supabase
        .from("contacts")
        .update({
          admin_reply: reply,
          replied_at: replyTimestamp,
        })
        .eq("id", contact.id);

      setContacts((current) =>
        current.map((item) =>
          item.id === contact.id
            ? {
                ...item,
                admin_reply: reply,
                replied_at: replyTimestamp,
                contact_replies: [...(item.contact_replies || []), insertedReply as ContactReply],
              }
            : item
        )
      );

      setSuccess(`Reply saved for ${contact.name}.`);
      setReplyDrafts((current) => ({ ...current, [contact.id]: "" }));
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "Reply could not be saved.");
    } finally {
      setSendingId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleViewThread(contactId: string) {
    setActiveContactId(contactId);
    setTimeout(() => {
      threadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const activeContact = contacts.find((contact) => contact.id === activeContactId) || null;

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
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Contact Messages</h2>
            {lastUpdated && (
              <p className="mt-1 text-sm text-gray-500">Last updated: {lastUpdated}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void fetchContacts()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh Messages
          </button>
        </div>

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

        {contacts.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Latest Message</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => {
                    const latestThreadItem = buildThread(contact).slice(-1)[0];
                    return (
                      <tr key={contact.id} className={activeContactId === contact.id ? "bg-orange-50/40" : ""}>
                        <td className="px-4 py-3 font-medium text-gray-800">{contact.name}</td>
                        <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <p className="max-w-[320px] truncate">{latestThreadItem?.message || contact.message}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {contact.created_at ? new Date(contact.created_at).toLocaleString() : ""}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleViewThread(contact.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                              activeContactId === contact.id
                                ? "border border-orange-500 bg-orange-100 text-orange-700"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {activeContactId === contact.id ? "Viewing" : "View Thread"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeContact && (
          <div ref={threadPanelRef} className="mt-6 rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activeContact.name}</h3>
                <p className="text-sm text-gray-500">{activeContact.email}</p>
              </div>
              <p className="text-sm text-gray-400">
                {activeContact.created_at ? new Date(activeContact.created_at).toLocaleString() : ""}
              </p>
            </div>

            <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {buildThread(activeContact).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-4 ${
                    item.sender === "admin"
                      ? "border border-orange-200 bg-orange-50"
                      : "bg-gray-50"
                  }`}
                >
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
                    item.sender === "admin" ? "text-orange-600" : "text-gray-500"
                  }`}>
                    {item.sender === "admin" ? "Admin Reply" : "Customer Message"}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700">{item.message}</p>
                  {item.created_at && (
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">Reply</label>
              <textarea
                value={replyDrafts[activeContact.id] || ""}
                onChange={(e) =>
                  setReplyDrafts((current) => ({
                    ...current,
                    [activeContact.id]: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Write a clear and concise reply..."
                className="w-full rounded-xl border border-gray-300 p-3 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                The reply will appear in the user&apos;s Messages page inside the app.
              </p>
              <button
                onClick={() => void handleReply(activeContact)}
                disabled={sendingId === activeContact.id}
                className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {sendingId === activeContact.id ? "Saving..." : "Save Reply"}
              </button>
            </div>
          </div>
        )}

        {contacts.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
            No contact messages yet.
          </div>
        )}
      </main>
    </div>
  );
}
