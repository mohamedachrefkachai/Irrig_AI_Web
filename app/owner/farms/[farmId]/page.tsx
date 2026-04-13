"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import dynamic from "next/dynamic";
const FarmZonesSVG = dynamic(() => import("./FarmZonesSVG"), { ssr: false });
const AddZoneForm = dynamic(() => import("./AddZoneForm"), { ssr: false });

export default function FarmDetailPage() {
  const { farmId } = useParams();
  const [farm, setFarm] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [station, setStation] = useState<any>(null);
  const [actuator, setActuator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actuatorLoading, setActuatorLoading] = useState(false);

  useEffect(() => {
    async function fetchFarm() {
      try {
        const [farmRes, zonesRes, stationRes, actuatorRes] = await Promise.all([
          fetch(`/api/dashboard/farms/${farmId}`),
          fetch(`/api/dashboard/farms/${farmId}/zones`),
          fetch(`/api/dashboard/farms/${farmId}/station`),
          fetch(`/api/dashboard/farms/${farmId}/actuator`),
        ]);

        if (!farmRes.ok) {
          setFarm(null);
          return;
        }

        setFarm(await farmRes.json());

        if (zonesRes.ok) {
          setZones(await zonesRes.json());
        }

        if (stationRes.ok) {
          setStation(await stationRes.json());
        }

        if (actuatorRes.ok) {
          setActuator(await actuatorRes.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFarm();
  }, [farmId]);

  const refreshDeviceData = async () => {
    const [stationRes, actuatorRes] = await Promise.all([
      fetch(`/api/dashboard/farms/${farmId}/station`),
      fetch(`/api/dashboard/farms/${farmId}/actuator`),
    ]);

    if (stationRes.ok) {
      setStation(await stationRes.json());
    }

    if (actuatorRes.ok) {
      setActuator(await actuatorRes.json());
    }
  };

  const setValveState = async (nextState: "ON" | "OFF") => {
    setActuatorLoading(true);
    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/actuator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valve_state: nextState, mode: actuator?.mode || "MANUAL" }),
      });

      if (res.ok) {
        setActuator(await res.json());
      }
    } finally {
      setActuatorLoading(false);
    }
  };

  const setActuatorMode = async (nextMode: "AUTO" | "MANUAL") => {
    setActuatorLoading(true);
    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/actuator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valve_state: actuator?.valve_state || "OFF",
          mode: nextMode,
        }),
      });

      if (res.ok) {
        setActuator(await res.json());
      }
    } finally {
      setActuatorLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500 p-8">Loading...</div>;
  if (!farm) return <div className="text-red-600 p-8">Farm not found.</div>;

  // 2D Drawing
  const width = farm.longueur || 100;
  const height = farm.largeur || 60;
  // Scale farm rectangle to fit SVG frame
  const svgWidth = 600;
  const svgHeight = 360;
  const frameX = 20;
  const frameY = 20;
  const frameW = svgWidth - 2 * frameX;
  const frameH = svgHeight - 2 * frameY;
  // Calculate max farm size to fit frame
  const maxFarmW = Math.min(width, frameW);
  const maxFarmH = Math.min(height, frameH);
  // Scale farm size proportionally
  const scale = Math.min(frameW / width, frameH / height, 1);
  const farmW = width * scale;
  const farmH = height * scale;
  const farmX = frameX + (frameW - farmW) / 2;
  const farmY = frameY + (frameH - farmH) / 2;
  const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" style="background:#F7F8F4;border-radius:24px;border:3px solid #059669">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="2" />
        </pattern>
      </defs>
      <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" fill="url(#grid)" rx="24" />
      <rect x="${farmX}" y="${farmY}" width="${farmW}" height="${farmH}" fill="#A7F3D0" stroke="#059669" stroke-width="6" rx="18" />
      <text x="${farmX + farmW / 2}" y="${farmY + farmH / 2}" text-anchor="middle" font-size="32" fill="#059669" font-weight="bold">${farm.name}</text>
      <text x="${farmX + farmW / 2}" y="${farmY + farmH + 40}" text-anchor="middle" font-size="22" fill="#059669">${width}m x ${height}m</text>
    </svg>
  `;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">🏡 Farm Details</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-700 mb-2">{farm.name}</div>
              <div className="text-gray-700">📍 Location: {farm.location}</div>
              <div className="text-gray-700">📏 Dimensions: {farm.longueur}m × {farm.largeur}m</div>
              <div className="text-gray-500 text-sm mt-2">Created: {new Date(farm.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/owner/farms" className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold px-6 py-3 rounded-xl transition">
                ← Back to Farms
              </Link>
            </div>
          </div>
        </div>

        {/* Farm Overview with Zones */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">🗺️ Farm Overview</h2>
          <div className="flex justify-center">
            <FarmZonesSVG />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold text-blue-700 uppercase">Weather Station</div>
                <h2 className="mt-1 text-xl font-extrabold text-gray-900">Live Measurements</h2>
              </div>
              <button
                onClick={refreshDeviceData}
                className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <Metric label="Temperature" value={station?.temperature ?? "--"} unit="°C" tone="blue" />
              <Metric label="Humidity" value={station?.humidity ?? "--"} unit="%" tone="cyan" />
              <Metric
                label="Rain"
                value={station?.rain == null ? "--" : station.rain > 0 ? "Detected" : "No rain"}
                unit=""
                tone="amber"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
              <Metric
                label="Light"
                value={
                  station?.luminosity == null
                    ? "--"
                    : station.luminosity < 200
                      ? "Dark"
                      : station.luminosity < 700
                        ? "Moderate"
                        : "Bright"
                }
                unit={station?.luminosity == null ? "" : `${station.luminosity} lx`}
                tone="amber"
              />
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Last update: {station?.recorded_at ? new Date(station.recorded_at).toLocaleString() : "no data"}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
            <div className="text-sm font-extrabold text-green-700 uppercase">Actuator</div>
            <h2 className="mt-1 text-xl font-extrabold text-gray-900">Valve Control</h2>

            <div className="mt-6 flex items-center gap-3">
              <span className={`rounded-full px-4 py-2 font-extrabold ${actuator?.valve_state === "ON" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {actuator?.valve_state || "OFF"}
              </span>
              <span className="rounded-full bg-orange-100 px-4 py-2 font-extrabold text-orange-700">
                Mode {actuator?.mode || "MANUAL"}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-extrabold uppercase text-gray-500 mb-3">Control Mode</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={actuatorLoading}
                  onClick={() => setActuatorMode("AUTO")}
                  className={`rounded-xl px-4 py-3 font-extrabold transition disabled:opacity-60 ${actuator?.mode === "AUTO" ? "bg-green-600 text-white" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"}`}
                >
                  Automatic
                </button>
                <button
                  disabled={actuatorLoading}
                  onClick={() => setActuatorMode("MANUAL")}
                  className={`rounded-xl px-4 py-3 font-extrabold transition disabled:opacity-60 ${actuator?.mode === "MANUAL" ? "bg-green-600 text-white" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"}`}
                >
                  Manual
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                disabled={actuatorLoading}
                onClick={() => setValveState("ON")}
                className="rounded-xl bg-green-600 px-5 py-3 font-extrabold text-white hover:bg-green-700 disabled:opacity-60 transition"
              >
                Open Valve
              </button>
              <button
                disabled={actuatorLoading}
                onClick={() => setValveState("OFF")}
                className="rounded-xl border border-gray-200 px-5 py-3 font-extrabold text-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
              >
                Close Valve
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Last command: {actuator?.updated_at ? new Date(actuator.updated_at).toLocaleString() : "no command"}
            </div>
          </div>
        </div>

        {/* Add Zone Form */}
        <div>
          <AddZoneForm 
            farmId={farm._id} 
            farmWidth={farm.longueur}
            farmLength={farm.largeur}
            existingZones={zones}
            onZoneAdded={() => window.location.reload()} 
          />
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string | number;
  unit: string;
  tone: "blue" | "cyan" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="text-xs font-extrabold uppercase">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-gray-900">
        {value} <span className="text-sm font-bold text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
