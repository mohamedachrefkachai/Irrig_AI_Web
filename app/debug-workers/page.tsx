"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [ownerIdFromStorage, setOwnerIdFromStorage] = useState("");
  const [ownerIdFromCookie, setOwnerIdFromCookie] = useState("");
  const [allCookies, setAllCookies] = useState("");
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [apiTestError, setApiTestError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get owner ID from localStorage
    const id = localStorage.getItem("owner_id");
    setOwnerIdFromStorage(id || "NOT FOUND");

    // Get owner ID from cookie
    try {
      const match = document.cookie.match(/session=([^;]+)/);
      if (match) {
        const session = JSON.parse(decodeURIComponent(match[1]));
        setOwnerIdFromCookie(session.userId || "NOT FOUND");
      } else {
        setOwnerIdFromCookie("SESSION COOKIE NOT FOUND");
      }
    } catch (e) {
      setOwnerIdFromCookie("ERROR PARSING COOKIE: " + String(e));
    }

    // Show all cookies
    setAllCookies(document.cookie);
  }, []);

  const testApi = async () => {
    setLoading(true);
    setApiTestError("");
    setApiTestResult(null);

    const ownerId = ownerIdFromStorage || ownerIdFromCookie;
    if (!ownerId || ownerId.includes("NOT FOUND")) {
      setApiTestError("Owner ID not found in storage or cookie!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/owner/workers/list?owner_id=${ownerId}`
      );
      const data = await response.json();

      setApiTestResult(data);

      if (!response.ok) {
        setApiTestError(`API Error: ${response.status} - ${data.error}`);
      }
    } catch (err) {
      setApiTestError("Network Error: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🐛 Debug Workers Page</h1>

        <div className="grid gap-6 mb-8">
          {/* Storage Check */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Storage Status</h2>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">LocalStorage: owner_id</p>
                <p className="text-lg font-mono font-bold text-blue-900 break-all">
                  {ownerIdFromStorage}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600">Cookie: session.userId</p>
                <p className="text-lg font-mono font-bold text-purple-900 break-all">
                  {ownerIdFromCookie}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">All Cookies</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {allCookies || "No cookies"}
                </p>
              </div>
            </div>
          </div>

          {/* API Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔌 API Test</h2>

            <button
              onClick={testApi}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "⏳ Testing..." : "✓ Test API"}
            </button>

            {apiTestError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-bold text-red-700">❌ Error:</p>
                <p className="text-red-600 font-mono break-all">{apiTestError}</p>
              </div>
            )}

            {apiTestResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-bold text-green-700">✅ API Response:</p>
                <pre className="text-xs text-green-900 font-mono break-all mt-2 overflow-auto max-h-96">
                  {JSON.stringify(apiTestResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>

            <div className="grid gap-3">
              <a href="/login" className="block">
                <button className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                  🔐 Go to Login
                </button>
              </a>

              <a href="/owner" className="block">
                <button className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                  📊 Go to Dashboard
                </button>
              </a>

              <a href="/owner/workers" className="block">
                <button className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                  👥 Go to Workers
                </button>
              </a>

              <button
                onClick={() => {
                  localStorage.clear();
                  document.cookie = "session=;max-age=0";
                  alert("Storage and cookies cleared!");
                  window.location.reload();
                }}
                className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
              >
                🗑️ Clear All & Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-3">📝 What to Check:</h3>
          <ol className="text-yellow-800 space-y-2 text-sm">
            <li>1. Check if you see an owner_id in Storage Status above</li>
            <li>2. If not, you need to login first via /login</li>
            <li>3. Click "Test API" to verify the API is working</li>
            <li>4. If API returns workers/farms, then /owner/workers should work</li>
            <li>5. Check browser console (F12) for any error messages</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
