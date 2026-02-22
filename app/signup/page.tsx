"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // demo only
    alert(`Sign up: ${email}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sign Up</h1>
          <p className="text-gray-500 text-sm">
            Create your Irrig&apos;Ai account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring">
              <input
                type={show ? "text" : "password"}
                className="w-full border-0 outline-none px-1 py-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-sm text-gray-600 hover:underline"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type={show ? "text" : "password"}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-green-700 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
