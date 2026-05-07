"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabase } from "@/lib/supabase";

type ContactReply = {
  id: string;
  user_id?: string;
  sender: "user" | "admin";
  message: string;
  created_at?: string;
};

type ContactThread = {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  message: string;
  admin_reply?: string;
  created_at?: string;
  replied_at?: string;
  contact_replies?: ContactReply[];
};

function buildThread(thread: ContactThread) {
  const replies = [...(thread.contact_replies || [])].sort((a, b) =>
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  const items = [
    {
      id: `${thread.id}-initial`,
      sender: "user" as const,
      message: thread.message,
      created_at: thread.created_at,
    },
    ...replies,
  ];

  const hasLegacyReply = thread.admin_reply
    && !replies.some((reply) => reply.sender === "admin" && reply.message === thread.admin_reply);

  if (hasLegacyReply) {
    items.push({
      id: `${thread.id}-legacy-admin-reply`,
      sender: "admin" as const,
      message: thread.admin_reply || "",
      created_at: thread.replied_at,
    });
  }

  return items.sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ContactThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const fetchThreads = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("contacts")
      .select("id, user_id, name, email, message, admin_reply, created_at, replied_at, contact_replies(id, user_id, sender, message, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setThreads((data as ContactThread[]) || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void (async () => {
      await fetchThreads();
    })();
  }, [fetchThreads]);

  async function handleReply(thread: ContactThread) {
    const reply = (replyDrafts[thread.id] || "").trim();

    if (!reply) {
      setStatus("Please write your reply first.");
      return;
    }

    setSendingId(thread.id);
    setStatus("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: insertedReply, error } = await supabase
      .from("contact_replies")
      .insert({
        contact_id: thread.id,
        user_id: user.id,
        sender: "user",
        message: reply,
      })
      .select("id, user_id, sender, message, created_at")
      .single();

    if (error) {
      const dbMessage = error.message || "";
      if (dbMessage.includes("contact_replies") || dbMessage.includes("schema cache")) {
        setStatus("Reply could not be sent because the contact_replies table is missing. Run sql/contact_thread_replies.sql in Supabase first.");
      } else {
        setStatus(`Reply could not be sent: ${dbMessage}`);
      }
      setSendingId(null);
      return;
    }

    setThreads((current) =>
      current.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              contact_replies: [...(item.contact_replies || []), insertedReply as ContactReply],
            }
          : item
      )
    );
    setReplyDrafts((current) => ({ ...current, [thread.id]: "" }));
    setSendingId(null);
    setStatus("Reply sent successfully.");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-6 py-28 md:px-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your messages and continue the conversation here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchThreads()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {status && (
          <div className={`mb-6 rounded-xl p-4 text-sm ${status.toLowerCase().includes("could not") ? "border border-red-100 bg-red-50 text-red-700" : "border border-green-100 bg-green-50 text-green-700"}`}>
            {status}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
            Loading messages...
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
            No messages yet. Use Contact to send a message first.
          </div>
        ) : (
          <div className="space-y-6">
            {threads.map((thread) => (
              <div key={thread.id} className="rounded-2xl bg-white p-6 shadow">
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{thread.name}</h2>
                    <p className="text-sm text-gray-500">{thread.email}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {thread.created_at ? new Date(thread.created_at).toLocaleString() : ""}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {buildThread(thread).map((item) => (
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
                        {item.sender === "admin" ? "Admin Reply" : "Your Message"}
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
                  <label className="mb-2 block text-sm font-medium text-gray-600">
                    Reply to Admin
                  </label>
                  <textarea
                    value={replyDrafts[thread.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((current) => ({
                        ...current,
                        [thread.id]: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Write your reply here..."
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Your reply will appear in the admin contact thread.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleReply(thread)}
                    disabled={sendingId === thread.id}
                    className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {sendingId === thread.id ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
