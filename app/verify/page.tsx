"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidOTPFormat } from "@/lib/otp";
import { validateEmailSecurity, sanitizeEmailInput } from "@/lib/emailSecurity";

function VerifyOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const nextParam = searchParams.get("next") || "/menu";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email = useMemo(() => sanitizeEmailInput(emailParam), [emailParam]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors.join(". "));
      return;
    }

    if (!isValidOTPFormat(otp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(payload?.error || "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Email verified. Redirecting...");
      setTimeout(() => router.push(nextParam), 700);
    } catch {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");

    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors.join(". "));
      return;
    }

    setResending(true);
    try {
      const resp = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(payload?.error || "Failed to resend OTP.");
        return;
      }
      setSuccess("OTP resent. Please check your email.");
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[420px]">
        <div className="text-center mb-6">
          <Image
            src="/chickens.png"
            alt="ELYAN Chicken Hub"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-orange-500">Verify Email</h1>
          <p className="text-gray-500 text-sm">
            Enter the 6-digit code sent to <span className="font-medium">{email || "your email"}</span>
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="text-sm font-medium text-gray-600">6-digit OTP</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500 tracking-[0.3em] text-center text-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-orange-500 font-semibold disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
          <Link href="/login" className="text-gray-500 hover:text-orange-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}
