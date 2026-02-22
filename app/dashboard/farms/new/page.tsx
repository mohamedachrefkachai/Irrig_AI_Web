"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewFarmPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [longueur, setLongueur] = useState("");
  const [largeur, setLargeur] = useState("");
  const [drawing, setDrawing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Simple 2D drawing: rectangle preview
  function handleDraw() {
    const width = Number(longueur) || 100;
    const height = Number(largeur) || 60;
    setDrawing(`
      <svg width="300" height="180" style="background:#F7F8F4;border-radius:16px;border:2px solid #ccc">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="280" height="160" fill="url(#grid)" rx="16" />
        <rect x="50" y="40" width="${width}" height="${height}" fill="#A7F3D0" stroke="#059669" stroke-width="4" rx="12" />
        <text x="${50 + width / 2}" y="${40 + height / 2}" text-anchor="middle" font-size="18" fill="#059669" font-weight="bold">${name || "Farm"}</text>
        <text x="${50 + width / 2}" y="${40 + height + 30}" text-anchor="middle" font-size="14" fill="#059669">${width}m x ${height}m</text>
      </svg>
    `);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // Récupérer owner_id depuis le cookie session
    let owner_id = null;
    try {
      const match = document.cookie.match(/session=([^;]+)/);
      if (match) {
        const session = JSON.parse(decodeURIComponent(match[1]));
        owner_id = session.userId;
      }
    } catch {}
    const res = await fetch("/api/dashboard/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, longueur: Number(longueur), largeur: Number(largeur), owner_id })
    });
    if (!res.ok) {
      setError("Error creating farm.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    // Redirect to owner farm list after creation
    setTimeout(() => {
      window.location.href = "/owner/farms";
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Add New Farm</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm text-gray-600">Farm Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm text-gray-600">Length (m)</label>
              <input type="number" value={longueur} onChange={e => setLongueur(e.target.value)} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring" />
            </div>
            <div className="w-1/2">
              <label className="text-sm text-gray-600">Width (m)</label>
              <input type="number" value={largeur} onChange={e => setLargeur(e.target.value)} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring" />
            </div>
          </div>
          <div>
            <button type="button" className="bg-emerald-100 text-green-700 px-4 py-2 rounded-xl font-bold mb-2" onClick={handleDraw}>Preview 2D Drawing</button>
            {drawing && <div dangerouslySetInnerHTML={{ __html: drawing }} className="mt-2" />}
          </div>
          {error && <div className="text-red-600 font-bold mt-2">{error}</div>}
          {success && <div className="text-green-700 font-bold mt-2">Farm created successfully!</div>}
          <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-extrabold shadow w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Farm"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/dashboard/farms" className="text-green-700 hover:underline font-bold">Back to Farms</Link>
        </div>
      </div>
    </main>
  );
}
