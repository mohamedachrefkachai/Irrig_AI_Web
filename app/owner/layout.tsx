"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [farms, setFarms] = useState<any[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Récupérer le nom de l'utilisateur depuis le cookie de session (statique pour la démo)
  const [userName, setUserName] = useState<string>("");
  
  useEffect(() => {
    // Fetch user name
    try {
      const match = document.cookie.match(/session=([^;]+)/);
      if (match) {
        const session = JSON.parse(decodeURIComponent(match[1]));
        if (session.fullName && session.fullName.trim() !== "") setUserName(session.fullName);
        else setUserName("");
      }
    } catch {}

    // Fetch user farms
    async function fetchFarms() {
      try {
        const res = await fetch("/api/dashboard/farms");
        const data = await res.json();
        setFarms(data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setLoadingFarms(false);
      }
    }
    fetchFarms();
  }, []);

  const farmIdFromUrl = useMemo(() => {
    const match = pathname.match(/\/owner\/farms\/([^/]+)/);
    return match?.[1] ?? (farms.length > 0 ? farms[0]._id : null);
  }, [pathname, farms]);

  const [currentFarmId, setCurrentFarmId] = useState<string | null>(farmIdFromUrl);

  useEffect(() => {
    if (farmIdFromUrl && currentFarmId !== farmIdFromUrl) {
      setCurrentFarmId(farmIdFromUrl);
    }
  }, [currentFarmId, farmIdFromUrl]);

  const currentFarm = farms.find((f) => f._id === currentFarmId) ?? farms[0];

  const nav = currentFarmId ? [
    { href: `/owner/farms/${currentFarmId}`, label: "Overview", icon: "📌" },
    { href: `/owner/farms/${currentFarmId}/zones`, label: "Zones", icon: "📍" },
    { href: `/owner/farms/${currentFarmId}/trees`, label: "Trees", icon: "🌳" },
    { href: `/owner/farms/${currentFarmId}/workers`, label: "Workers", icon: "👷" },
    { href: `/owner/farms/${currentFarmId}/tasks`, label: "Tasks", icon: "📋" },
    { href: `/owner/farms/${currentFarmId}/alerts`, label: "Alerts", icon: "🔔" },
    { href: `/owner/farms/${currentFarmId}/robot`, label: "Robot", icon: "🤖" },
    { href: `/owner/farms/${currentFarmId}/reports`, label: "Reports", icon: "📈" },
    { href: `/owner/farms/${currentFarmId}/settings`, label: "Settings", icon: "⚙️" },
  ] : [];

  function onFarmChange(id: string) {
    setCurrentFarmId(id);
    router.push(`/owner/farms/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4]">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="rounded-3xl bg-white border border-gray-200 shadow p-6 sticky top-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-green-700 text-white grid place-items-center font-extrabold">
                  🌿
                </div>
                <div className="leading-tight">
                  <div className="font-extrabold text-lg text-gray-900">Irrig&apos;Ai</div>
                  <div className="text-xs text-gray-500 font-semibold">Owner Console</div>
                </div>
              </Link>
              <div className="mt-6 mb-2">
                <div className="text-xs text-gray-500 font-semibold">Bienvenue</div>
                <div className="font-extrabold text-green-700 text-lg">{userName}</div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Current Farm
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-3">
                  {loadingFarms ? (
                    <div className="text-sm text-gray-500 py-2">Loading farms...</div>
                  ) : farms.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">No farms found</div>
                  ) : (
                    <>
                      <select
                        value={currentFarmId || ""}
                        onChange={(e) => onFarmChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-extrabold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name} - {f.location}
                          </option>
                        ))}
                      </select>

                      {currentFarm && (
                        <>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm font-extrabold text-gray-900">{currentFarm.name}</div>
                            <Link
                              href="/owner/farms"
                              className="text-xs font-extrabold text-green-800 hover:text-green-900"
                            >
                              Manage -&gt;
                            </Link>
                          </div>

                          <div className="mt-1 text-xs text-gray-600 font-semibold">
                            Location: {currentFarm.location}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-2">
                {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-extrabold transition ${
                        active
                          ? "bg-green-700 text-white shadow"
                          : "bg-[#F7F8F4] text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-[#F7F8F4] p-4">
                <div className="text-sm font-extrabold text-gray-900">Demo Mode</div>
                <p className="mt-1 text-xs text-gray-600 font-semibold">
                  Static UI for PI. Next: DB + auth + real farm data per owner.
                </p>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <div className="rounded-3xl bg-white border border-gray-200 shadow px-6 py-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold text-green-700">DASHBOARD</div>
                <div className="text-xl md:text-2xl font-extrabold text-gray-900">
                  {currentFarm ? `${currentFarm.name} - ${currentFarm.location}` : "Select a farm"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/pricing" className="hidden sm:block">
                  <button className="border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold">
                    Offers
                  </button>
                </Link>
                <button className="bg-green-700 hover:bg-green-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow">
                  + New Alert
                </button>
              </div>
            </div>

            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
