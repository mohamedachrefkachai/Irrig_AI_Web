"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function FarmsList() {
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
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-sm font-extrabold text-green-700">FARMS</div>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Your Farms</h1>
        <p className="mt-2 text-gray-600 font-semibold">
          Select a farm to open the dashboard.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/farms/new">
            <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-extrabold shadow">
              Add New Farm
            </button>
          </Link>
        </div>
      </div>
      {loading && <div className="text-gray-500">Loading...</div>}
      {!loading && farms.length === 0 && <div className="text-gray-500">No farms found.</div>}
      {!loading && farms.length > 0 && (
        <div className="grid gap-6 mt-6">
          {farms.map((farm: any) => (
            <Link key={farm._id} href={`/owner/farms/${farm._id}`} className="block">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow hover:border-green-700 transition">
                <div className="font-extrabold text-lg text-gray-900">{farm.name}</div>
                <div className="text-gray-700">Location: {farm.location}</div>
                <div className="text-gray-700">Length: {farm.longueur} m</div>
                <div className="text-gray-700">Width: {farm.largeur} m</div>
                <div className="mt-4 text-green-700 font-bold underline">View Details & 2D</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8F4] border border-gray-200 p-4">
      <div className="text-xs font-extrabold text-gray-500 uppercase">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-gray-900">{value}</div>
    </div>
  );
}
