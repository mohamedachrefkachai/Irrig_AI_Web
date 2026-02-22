"use client";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}> <AdminRequestsContent /> </Suspense>
  );
}


async function getRequests() {
  const res = await fetch("/api/admin/requests", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}


import { useEffect, useState } from "react";

function AdminRequestsContent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequests().then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><span>Chargement...</span></main>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Pending Requests</h1>
        <div className="grid gap-6">
          {requests.length === 0 && <div className="text-gray-500">Aucune demande en attente.</div>}
          {requests.map((req: any) => (
            <div key={req._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
              <div className="font-extrabold text-lg text-gray-900">{req.fullName}</div>
              <div className="text-gray-700">{req.email}</div>
              <div className="mt-2 text-gray-500">Farm: {req.farmName}</div>
              <div className="mt-2 text-gray-500">Message: {req.message}</div>
              <div className="mt-4 flex gap-3">
                <button
                  className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-xl font-bold"
                  onClick={async () => {
                    await fetch("/api/admin/requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ requestId: req._id, action: "approve" })
                    });
                    // Rafraîchir la liste
                    setLoading(true);
                    const data = await getRequests();
                    setRequests(data);
                    setLoading(false);
                  }}
                >Approve</button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold"
                  onClick={async () => {
                    await fetch("/api/admin/requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ requestId: req._id, action: "reject" })
                    });
                    // Rafraîchir la liste
                    setLoading(true);
                    const data = await getRequests();
                    setRequests(data);
                    setLoading(false);
                  }}
                >Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
