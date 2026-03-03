"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Farm {
  id: string;
  name: string;
  location: string;
}

interface Worker {
  id: string;
  user_id: string;
  farm_id: string;
  full_name: string;
  email: string;
  farm_name: string;
  status: string;
  created_at: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [ownerId, setOwnerId] = useState("");

  // Get owner ID from localStorage or cookie on mount
  useEffect(() => {
    const storedOwnerId = localStorage.getItem("owner_id");
    if (storedOwnerId) {
      setOwnerId(storedOwnerId);
    } else {
      // Try to get from cookie if localStorage empty
      try {
        const match = document.cookie.match(/session=([^;]+)/);
        if (match) {
          const session = JSON.parse(decodeURIComponent(match[1]));
          if (session.userId) {
            localStorage.setItem("owner_id", session.userId);
            setOwnerId(session.userId);
          }
        }
      } catch (e) {
        console.error("Error parsing session cookie:", e);
      }
    }
  }, []);

  // Fetch workers and farms
  useEffect(() => {
    if (!ownerId) {
      console.log("No owner ID found, waiting...");
      return;
    }

    const fetchWorkers = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Fetching workers for owner:", ownerId);
        
        const response = await fetch(
          `/api/owner/workers/list?owner_id=${ownerId}`
        );
        
        if (!response.ok) {
          console.error("API response not ok:", response.status);
          throw new Error(`Failed to fetch workers: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Workers fetched:", data);
        
        setWorkers(data.workers || []);
        setFarms(data.farms || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching workers:", err);
        setError(err instanceof Error ? err.message : "Failed to load workers");
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [ownerId]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedFarm || !workerEmail) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/owner/workers/add-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: ownerId,
          farm_id: selectedFarm,
          worker_email: workerEmail,
          worker_name: workerName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add worker");
      }

      const data = await response.json();

      // Add new worker to list
      setWorkers([
        ...workers,
        {
          ...data.worker,
          farm_name:
            farms.find((f) => f.id === selectedFarm)?.name || "Unknown",
        },
      ]);

      // Reset form
      setWorkerEmail("");
      setWorkerName("");
      setSelectedFarm("");
      setShowForm(false);
      setSuccessMessage(
        `Worker added successfully! Default password: azerty`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add worker");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-4">📦 Loading workers...</div>
          <div className="text-white text-sm opacity-75">Please wait while we fetch your workers</div>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </main>
    );
  }

  // If owner ID not found after component mounted
  if (!ownerId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-12 max-w-md text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in as a Farm Owner to manage workers.
          </p>
          <Link href="/login">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">
              Go to Login
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-12">
        {/* Header with Subtitle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">👥 Manage Workers</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Add workers to your farms. Default password: <code className="bg-green-100 px-2 py-1 rounded font-mono">azerty</code>
            </p>
          </div>

          <Link
            href="/owner"
            className="px-5 py-2 rounded-xl border hover:bg-gray-50 transition font-semibold"
          >
            ← Back
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-xl mb-6">
            <span className="font-bold">✅ Success!</span> {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl mb-6">
            <span className="font-bold">❌ Error:</span> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              showForm
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {showForm ? "✕ Cancel" : "+ Add New Worker"}
          </button>
        </div>

        {/* Add Worker Form */}
        {showForm && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Create Worker Account</h2>
            
            <form onSubmit={handleAddWorker} className="space-y-6">
              {/* Select Farm */}
              <div>
                <label className="block text-gray-700 font-bold mb-3 text-lg">
                  🌾 Select Farm <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-lg"
                  required
                >
                  <option value="">-- Choose a farm --</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} {farm.location ? `(${farm.location})` : ""}
                    </option>
                  ))}
                </select>
                {farms.length === 0 && (
                  <p className="text-yellow-700 text-sm mt-2">
                    ⚠️ Create a farm first before adding workers
                  </p>
                )}
              </div>

              {/* Worker Email */}
              <div>
                <label className="block text-gray-700 font-bold mb-3 text-lg">
                  ✉️ Worker Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={workerEmail}
                  onChange={(e) => setWorkerEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-lg"
                  placeholder="worker@example.com"
                  required
                />
                <p className="text-gray-600 text-sm mt-2">
                  💡 Mobile login: Email + password "azerty"
                </p>
              </div>

              {/* Worker Name */}
              <div>
                <label className="block text-gray-700 font-bold mb-3 text-lg">
                  👤 Worker Name (Optional)
                </label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-lg"
                  placeholder="Ahmed Ali"
                />
              </div>

              {/* Default Password Info */}
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <p className="text-blue-800 font-bold text-lg mb-2">🔐 Default Password</p>
                <p className="text-blue-700 text-base">
                  All workers login with: 
                  <code className="bg-blue-100 px-3 py-1 rounded-lg font-mono font-bold ml-2 text-blue-900">azerty</code>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || farms.length === 0}
                className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition text-lg"
              >
                {submitting ? "⏳ Creating..." : "✓ Create Worker"}
              </button>
            </form>
          </div>
        )}

        {/* Workers List */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            👷 Workers ({workers.length})
          </h2>
          <p className="text-gray-600 mb-6">
            All workers from all your farms
          </p>

          {workers.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-3xl border-2 border-gray-200">
              <p className="text-gray-500 text-lg font-semibold">No workers yet</p>
              <p className="text-gray-400 mt-2">Click "+ Add New Worker" to get started</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {worker.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {worker.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        worker.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {worker.status === "ACTIVE" ? "🟢 Active" : "🟡 Invited"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">🌾 Farm:</span> {worker.farm_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">📅 Added:</span>{" "}
                      {new Date(worker.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
