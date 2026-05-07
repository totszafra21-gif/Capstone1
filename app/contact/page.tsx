"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { validateEmailSecurity, sanitizeEmailInput } from "@/lib/emailSecurity";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    async function fetchUserDetails() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.full_name || "");
        setEmail(profile.email || user.email || "");
      } else {
        setEmail(user.email || "");
      }
    }

    void fetchUserDetails();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setFieldError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setFieldError("Please fill in your name, email, and message.");
      setLoading(false);
      return;
    }

    if (trimmedMessage.length < 10) {
      setFieldError("Please enter a more complete message.");
      setLoading(false);
      return;
    }

    // Validate email security
    const emailValidation = validateEmailSecurity(trimmedEmail);
    if (!emailValidation.isValid) {
      setStatus(emailValidation.errors.join(". "));
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeEmailInput(trimmedName).replace(/[<>]/g, "");
    const sanitizedEmail = sanitizeEmailInput(trimmedEmail);
    const sanitizedMessage = sanitizeEmailInput(trimmedMessage).replace(/[<>]/g, "");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("contacts").insert({
      user_id: user?.id,
      name: sanitizedName,
      email: sanitizedEmail,
      message: sanitizedMessage,
    });

    if (error) {
      setStatus("Failed to send message. Please try again.");
    } else {
      setStatus("Message sent successfully! You can view admin replies in Messages.");
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
      <div className="flex items-center justify-center px-4 pt-28 pb-10">
        <div className="w-full max-w-[500px] rounded-2xl bg-white p-10 shadow-lg">
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
                minLength={2}
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
                minLength={10}
              />
            </div>

            {fieldError && (
              <p className="text-center text-sm text-red-500">{fieldError}</p>
            )}

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
        </div>      </div>      <SiteFooter />
    </div>
  );
}



