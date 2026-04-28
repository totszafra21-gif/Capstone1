"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import { validateEmailSecurity, sanitizeEmailInput } from "@/lib/emailSecurity";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    // Validate email security
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      setStatus(emailValidation.errors.join(". "));
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeEmailInput(name).replace(/[<>]/g, "");
    const sanitizedEmail = sanitizeEmailInput(email);
    const sanitizedMessage = sanitizeEmailInput(message).replace(/[<>]/g, "");

    const { error } = await supabase.from("contacts").insert({ name: sanitizedName, email: sanitizedEmail, message: sanitizedMessage });

    if (error) {
      setStatus("Failed to send message. Please try again.");
    } else {
      setStatus("Message sent successfully! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setEmailFocused(false);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center pt-28 pb-10">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[500px]">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Contact Us</h1>
          <p className="text-center text-gray-500 text-sm mb-6">Have a question or concern? Send us a message!</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                placeholder="Enter your email"
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
              {emailFocused && email && (
                <div className="mt-1 text-xs">
                  {(() => {
                    const validation = validateEmailSecurity(email);
                    return validation.isValid ? (
                      <span className="text-green-600">✓ Valid email format</span>
                    ) : (
                      <span className="text-red-500">{validation.errors[0]}</span>
                    );
                  })()}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={5}
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {status && (
              <p className={`text-sm text-center ${status.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
                {status}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-full font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500 space-y-1">
            <p>📍 Philippines</p>
            <p>📞 0912-345-6789</p>
            <p>✉️ elyanchickenhub@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
