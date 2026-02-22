
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FarmsPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarms() {
      const res = await fetch("/api/dashboard/farms", {
        method: "GET"
      });
      if (!res.ok) {
        setFarms([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFarms(data);
      setLoading(false);
    }
    fetchFarms();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Your Farms</h1>
        <div className="grid gap-6">
          {loading && <div className="text-gray-500">Loading...</div>}
          {!loading && farms.length === 0 && <div className="text-gray-500">No farms found.</div>}
          {farms.map((farm: any) => (
            <div key={farm._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
              <div className="font-extrabold text-lg text-gray-900">{farm.name}</div>
              <div className="text-gray-700">Location: {farm.location}</div>
              <div className="text-gray-700">Length: {farm.longueur} m</div>
              <div className="text-gray-700">Width: {farm.largeur} m</div>
              <div className="mt-4 flex gap-3">
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-bold">Edit</button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/dashboard/farms/new">
            <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-extrabold shadow">
              Add New Farm
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
