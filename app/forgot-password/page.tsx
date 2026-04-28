"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { validateEmailSecurity } from "@/lib/emailSecurity";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = validateEmailSecurity(email);
    if (!validation.isValid) {
      setError(validation.errors.join(". "));
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validation.sanitized }),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(payload?.error || "Failed to request password reset.");
      } else {
        setSuccess(payload?.message || "If the email exists, we sent a password reset link.");
      }
    } catch {
      setError("Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[420px]">
        <div className="text-center mb-6">
          <Image src="/chickens.png" alt="ELYAN Chicken Hub" width={80} height={80} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-orange-500">Forgot Password</h1>
          <p className="text-gray-500 text-sm">We'll email you a reset link</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-500">
          Back to{" "}
          <Link href="/login" className="text-orange-500 font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

