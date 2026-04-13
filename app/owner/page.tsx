"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Weather = {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  localTime: string | null;
  dailyForecast?: DailyForecastItem[];
  hourlyForecast?: HourlyForecastItem[];
};

type DailyForecastItem = {
  date: string;
  dayName: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
};

type HourlyForecastItem = {
  time: string;
  dayName: string;
  hourLabel: string;
  temp: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
};

const TUNISIAN_REGIONS = [
  "Tunis",
  "Ariana",
  "Manouba",
  "Ben Arous",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Gafsa",
  "Tozeur",
  "Kebili",
  "Gabes",
  "Medenine",
  "Tataouine",
];

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
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecastMode, setForecastMode] = useState<"daily" | "hourly">("daily");
  const [selectedRegion, setSelectedRegion] = useState("Tunis");

  useEffect(() => {
    const ownerId = localStorage.getItem("owner_id");
    if (!ownerId) {
      router.push("/login");
      return;
    }

    loadWeather(selectedRegion);
    loadDashboardData();
  }, [router]);

  useEffect(() => {
    loadWeather(selectedRegion);
  }, [selectedRegion]);

  const loadWeather = async (region: string) => {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(region)}&days=3`, { cache: "no-store" });
      const data = await res.json();
      if (data?.error) return;

      setWeather({
        temperature: data.temperature,
        condition: data.condition,
        icon: data.icon,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        city: data.city || region,
        localTime: data.localTime,
        dailyForecast: data.dailyForecast || [],
        hourlyForecast: data.hourlyForecast || [],
      });
    } catch {
      setWeather(null);
    }
  };

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
      {/* Weather First */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-green-800 border border-blue-900 shadow-xl p-8 text-white overflow-hidden">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-extrabold text-green-200 uppercase">Weather First</div>
            <h1 className="mt-2 text-3xl font-extrabold">Weather for {weather?.city || selectedRegion}</h1>
            <p className="mt-2 text-white/80 font-semibold max-w-2xl">
              Daily and hourly weather overview for irrigation planning and future AI decisions.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="text-xs font-extrabold uppercase text-green-200 mb-2">Tunisian Region</div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white px-3 py-2 font-bold text-gray-900 outline-none"
              >
                {TUNISIAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="text-xs font-extrabold uppercase text-green-200 mb-2">View Mode</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForecastMode("daily")}
                  className={`px-4 py-2 rounded-xl font-extrabold transition ${forecastMode === "daily" ? "bg-white text-blue-950" : "text-white hover:bg-white/10"}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setForecastMode("hourly")}
                  className={`px-4 py-2 rounded-xl font-extrabold transition ${forecastMode === "hourly" ? "bg-white text-blue-950" : "text-white hover:bg-white/10"}`}
                >
                  Hourly
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl bg-white/10 border border-white/15 p-6 backdrop-blur">
            <div className="text-sm font-extrabold uppercase text-green-200">Current Weather</div>
            <div className="mt-4 flex items-center gap-4">
              {weather?.icon ? (
                <img src={weather.icon} alt="weather icon" className="h-16 w-16" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-white/20" />
              )}
              <div>
                <div className="text-4xl font-extrabold">{weather?.temperature ?? "--"}°C</div>
                <div className="text-white/80 font-semibold">{weather?.condition ?? "No data"}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <WeatherMetric label="Humidity" value={weather?.humidity ?? "--"} unit="%" />
              <WeatherMetric label="Wind" value={weather?.windSpeed ?? "--"} unit="km/h" />
            </div>

            <div className="mt-4 text-sm text-white/70">
              Last update: {weather?.localTime || "no data"}
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 border border-white/15 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold uppercase text-green-200">
                  {forecastMode === "daily" ? "3-Day Forecast" : "24-Hour Forecast"}
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  {forecastMode === "daily" ? "Daily Weather" : "Hourly Weather"}
                </h2>
              </div>
            </div>

            <div className={forecastMode === "daily" ? "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
              {(forecastMode === "daily" ? weather?.dailyForecast || [] : weather?.hourlyForecast || []).map((item: any) => (
                <div key={item.date || item.time} className="rounded-2xl bg-white text-gray-900 p-4 shadow-sm">
                  <div className="text-sm font-extrabold text-gray-700">
                    {forecastMode === "daily" ? item.dayName : `${item.dayName} ${item.hourLabel}`}
                  </div>
                  <div className="mt-3 flex items-center justify-center">
                    <img src={item.icon} alt={item.condition} className="h-14 w-14" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-lg font-extrabold text-gray-900">
                      {forecastMode === "daily" ? `${item.avgTemp}°C` : `${item.temp}°C`}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">{item.condition}</div>
                    <div className="text-xs text-blue-700 font-bold mt-2">Rain chance: {item.chanceOfRain}%</div>
                    {forecastMode === "daily" && (
                      <div className="text-xs text-gray-500 mt-2">
                        High {item.maxTemp}° / Low {item.minTemp}°
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {((forecastMode === "daily" ? weather?.dailyForecast : weather?.hourlyForecast) || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/25 bg-white/10 px-6 py-10 text-white/80 font-semibold">
                  Weather forecast is not available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

function WeatherMetric({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
      <div className="text-xs font-extrabold uppercase text-white/70">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">
        {value} <span className="text-sm font-bold text-white/70">{unit}</span>
      </div>
    </div>
  );
}
