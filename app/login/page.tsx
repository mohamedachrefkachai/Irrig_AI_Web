"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Server error");
        }
        return res.json();
      })
      .then(data => {
        console.log('API login response:', data);
        if (data.error) {
          alert(data.error);
        } else {
          // Set session cookie for middleware (not secure, demo only)
          let role = data?.user?.role;
          let status = data?.user?.status;
          let fullName = data?.user?.fullName;
          let userId = data?.user?._id;
          if (!role) {
            // Try to recover from cookie if backend response is weird
            try {
              const match = document.cookie.match(/session=([^;]+)/);
              if (match) {
                const session = JSON.parse(decodeURIComponent(match[1]));
                role = session.role;
                status = session.status;
                userId = session.userId;
              }
            } catch {}
          }
          document.cookie = `session=${encodeURIComponent(JSON.stringify({ role, status, fullName, email, userId }))}; path=/`;
          // Redirect based on role
          if (role === "superadmin") {
            window.location.href = "/admin/dashboard";
          } else if (role === "OWNER") {
            window.location.href = "/owner";
          } else {
            window.location.href = "/";
          }
        }
      })
      .catch(err => {
        alert("Login failed: " + err.message);
      });
    
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-500 text-sm">
            Sign in to access Irrig&apos;Ai dashboard
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

          <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition">
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-green-700 hover:underline">
            ← Back to Home
          </Link>
            <div className="mt-2">
              <span>Don&apos;t have an account? </span>
              <Link href="/signup" className="text-green-700 hover:underline">
                Sign up
              </Link>
            </div>
        </div>
      </div>
    </main>
  );
}
