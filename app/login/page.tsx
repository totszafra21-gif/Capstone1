"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { validateEmailSecurity, sanitizeEmailInput } from "@/lib/emailSecurity";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate email format before sending
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors.join(". "));
      setLoading(false);
      return;
    }

    // Sanitize email input
    const sanitizedEmail = sanitizeEmailInput(email);

    const { data, error } = await supabase.auth.signInWithPassword({ email: sanitizedEmail, password });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.session.user.id)
        .single();

      const nextPath = profile?.is_admin ? "/admin" : "/menu";

      try {
        const resp = await fetch("/api/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sanitizedEmail }),
        });

        const payload = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setError(payload?.error || "Failed to send OTP. Please try again.");
          setLoading(false);
          return;
        }

        setSuccess("Verification code sent. Please check your email.");
        router.push(`/verify?email=${encodeURIComponent(sanitizedEmail)}&next=${encodeURIComponent(nextPath)}`);
        return;
      } catch {
        setError("Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px]">
        <div className="text-center mb-6">
          <Image src="/chickens.png" alt="ELYAN Chicken Hub" width={80} height={80} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-orange-500">ELYAN Chicken Hub</h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
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
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3 text-sm">
          <Link href="/forgot-password" className="text-orange-500 font-semibold">
            Forgot password?
          </Link>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-orange-500 font-semibold">Register</Link>
        </div>
      </div>
    </div>
  );
}
