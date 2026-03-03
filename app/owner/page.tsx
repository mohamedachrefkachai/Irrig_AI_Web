"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalWorkers: 0,
    totalTasks: 0,
    activeAlerts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ownerId = localStorage.getItem("owner_id");
    if (!ownerId) {
      router.push("/login");
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Load farms
      const farmsRes = await fetch("/api/dashboard/farms", { credentials: "include" });
      const farmsData = await farmsRes.json();
      
      // Load workers
      const workersRes = await fetch("/api/owner/workers/list", { credentials: "include" });
      const workersData = await workersRes.json();

      setStats({
        totalFarms: farmsData.farms?.length || 0,
        totalWorkers: workersData.workers?.length || 0,
        totalTasks: 0, // TODO: Add API call
        activeAlerts: 8, // Demo data
      });

      // Demo recent activity
      setRecentActivity([
        { type: "task", text: "New task assigned to Ahmed", time: "5 min ago", icon: "📋" },
        { type: "alert", text: "Low moisture in Zone A", time: "15 min ago", icon: "🔴" },
        { type: "worker", text: "New worker added: Sarah", time: "1 hour ago", icon: "👤" },
        { type: "system", text: "Irrigation completed in Zone B", time: "2 hours ago", icon: "💧" },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-3xl bg-gradient-to-br from-green-600 to-green-800 border border-green-700 shadow-xl p-8 text-white">
        <div className="text-sm font-extrabold opacity-90">WELCOME BACK</div>
        <h1 className="mt-2 text-3xl font-extrabold">Owner Dashboard</h1>
        <p className="mt-2 text-green-100 font-semibold">
          Manage your farms, workers, and tasks from one central location
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/owner/farms">
          <div className="rounded-2xl bg-white border border-gray-200 shadow p-6 hover:border-green-300 transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600">Total Farms</div>
              <span className="text-3xl">🌾</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900">{stats.totalFarms}</div>
            <div className="text-sm text-green-600 font-semibold mt-2">→ View all farms</div>
          </div>
        </Link>

        <Link href="/owner/workers">
          <div className="rounded-2xl bg-white border border-gray-200 shadow p-6 hover:border-blue-300 transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600">Total Workers</div>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900">{stats.totalWorkers}</div>
            <div className="text-sm text-blue-600 font-semibold mt-2">→ Manage workers</div>
          </div>
        </Link>

        <Link href="/owner/tasks">
          <div className="rounded-2xl bg-white border border-gray-200 shadow p-6 hover:border-orange-300 transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-600">Active Tasks</div>
              <span className="text-3xl">📋</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900">{stats.totalTasks}</div>
            <div className="text-sm text-orange-600 font-semibold mt-2">→ Assign tasks</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-red-50 border border-red-200 shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-red-700">Active Alerts</div>
            <span className="text-3xl">🔔</span>
          </div>
          <div className="text-4xl font-extrabold text-red-700">{stats.activeAlerts}</div>
          <div className="text-sm text-red-600 font-semibold mt-2">Requires attention</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/owner/workers">
            <button className="w-full px-6 py-4 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition shadow text-left">
              <div className="text-2xl mb-2">👤</div>
              <div>Add New Worker</div>
              <div className="text-sm opacity-90 mt-1">Expand your team</div>
            </button>
          </Link>

          <Link href="/owner/tasks">
            <button className="w-full px-6 py-4 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition shadow text-left">
              <div className="text-2xl mb-2">📋</div>
              <div>Assign Task</div>
              <div className="text-sm opacity-90 mt-1">Create new task</div>
            </button>
          </Link>

          <Link href="/owner/farms">
            <button className="w-full px-6 py-4 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700 transition shadow text-left">
              <div className="text-2xl mb-2">🌾</div>
              <div>View Farms</div>
              <div className="text-sm opacity-90 mt-1">Manage farms</div>
            </button>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">📊 Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{activity.text}</div>
                    <div className="text-sm text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">🔧 System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
              <div>
                <div className="font-extrabold text-gray-900">Irrigation System</div>
                <div className="text-sm text-gray-600 mt-1">All systems operational</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
              <div>
                <div className="font-extrabold text-gray-900">Sensor Network</div>
                <div className="text-sm text-gray-600 mt-1">15 sensors online</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div>
                <div className="font-extrabold text-gray-900">Robot Status</div>
                <div className="text-sm text-gray-600 mt-1">1 robot charging</div>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div>
                <div className="font-extrabold text-gray-900">Weather Service</div>
                <div className="text-sm text-gray-600 mt-1">Connected, 24°C Clear</div>
              </div>
              <div className="text-2xl">☀️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Overview Cards */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">🌾 Your Farms</h2>
          <Link href="/owner/farms">
            <button className="text-green-700 font-bold hover:underline">View All →</button>
          </Link>
        </div>
        
        {stats.totalFarms === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌱</div>
            <div className="text-lg font-bold text-gray-900">No farms yet</div>
            <div className="text-gray-600 mt-2 mb-4">Start by adding your first farm</div>
            <Link href="/owner/farms">
              <button className="px-6 py-3 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700 transition">
                Add Farm
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-gray-600">
            You have {stats.totalFarms} farm{stats.totalFarms > 1 ? 's' : ''} configured. 
            Click "View All" to manage them.
          </div>
        )}
      </div>
    </div>
  );
}
