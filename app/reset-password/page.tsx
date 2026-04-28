"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { getPasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from "@/lib/emailSecurity";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (strength < 2) {
      setError("Password is too weak. Use at least 8 characters with letters, numbers, and symbols.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(payload?.error || "Failed to reset password.");
      } else {
        setSuccess("Password updated. You can now login.");
        setTimeout(() => router.push("/login"), 1200);
      }
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[420px]">
        <div className="text-center mb-6">
          <Image src="/chickens.png" alt="ELYAN Chicken Hub" width={80} height={80} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-orange-500">Reset Password</h1>
          <p className="text-gray-500 text-sm">Create a new password</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-600">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
            {password && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-6 rounded ${
                        strength >= level
                          ? strength <= 1
                            ? "bg-red-500"
                            : strength === 2
                              ? "bg-yellow-500"
                              : strength === 3
                                ? "bg-blue-500"
                                : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${getPasswordStrengthColor(strength)}`}>{getPasswordStrengthLabel(strength)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
