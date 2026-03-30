"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Please check your email to confirm, then login.");
      setTimeout(() => router.push("/login"), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[420px]">
        <div className="text-center mb-6">
          <Image src="/chickens.png" alt="ELYAN Chicken Hub" width={80} height={80} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-orange-500">Create Account</h1>
          <p className="text-gray-500 text-sm">Join ELYAN Chicken Hub</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
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
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
}
