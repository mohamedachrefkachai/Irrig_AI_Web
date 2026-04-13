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
  const [realWeather, setRealWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [soilMoistureInput, setSoilMoistureInput] = useState<number | null>(null);
  const [rainfallMmInput, setRainfallMmInput] = useState<number | null>(null);
  const [sensorDataLoaded, setSensorDataLoaded] = useState<any>({
    soilMoisture: null,
    rainfallMm: null,
    temperature: null,
    humidity: null,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any>(null);
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

  useEffect(() => {
    if (!farm?.location) return;

    async function fetchRealWeather() {
      setWeatherLoading(true);
      try {
        const city = farm.location.split(",")[0]?.trim() || "Tunis";
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&days=7`);
        if (res.ok) {
          setRealWeather(await res.json());
        } else {
          setRealWeather(null);
        }
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchRealWeather();
  }, [farm?.location]);

  // Load sensor data for AI prediction
  useEffect(() => {
    async function fetchSensorData() {
      try {
        const res = await fetch(`/api/dashboard/farms/${farmId}/sensor-data`);
        if (res.ok) {
          const data = await res.json();
          setSensorDataLoaded(data);
          
          // Auto-populate soil moisture if available
          if (data.soilMoisture !== null && data.soilMoisture !== undefined) {
            setSoilMoistureInput(Number(data.soilMoisture));
          }
          
          // Auto-populate rainfall if available
          if (data.rainfallMm !== null && data.rainfallMm !== undefined) {
            setRainfallMmInput(Number(data.rainfallMm));
          }
        }
      } catch (err) {
        console.log("Could not fetch sensor data:", err);
      }
    }

    if (farmId) {
      fetchSensorData();
    }
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

  const runAiPrediction = async () => {
    // Use sensor data if loaded, otherwise use manual inputs + station/weather
    const temperatureC = Number(sensorDataLoaded?.temperature ?? station?.temperature ?? realWeather?.temperature ?? 0);
    const humidity = Number(sensorDataLoaded?.humidity ?? station?.humidity ?? realWeather?.humidity ?? 0);
    
    // For soil moisture and rainfall: use sensor if available, else use manual input (or 0 as fallback)
    const soilMoisture = sensorDataLoaded?.soilMoisture ?? soilMoistureInput ?? 50;
    const rainfallMm = sensorDataLoaded?.rainfallMm ?? rainfallMmInput ?? 0;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/irrigation/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId, // Pass farmId to use real sensor data
          soilMoisture,
          temperatureC,
          humidity,
          rainfallMm,
        }),
      });

      if (res.ok) {
        setAiPrediction(await res.json());
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500 p-8">Loading...</div>;
  if (!farm) return <div className="text-red-600 p-8">Farm not found.</div>;

  const stationLastUpdateMs = station?.recorded_at ? new Date(station.recorded_at).getTime() : null;
  const actuatorLastUpdateMs = actuator?.updated_at ? new Date(actuator.updated_at).getTime() : null;
  const nowMs = Date.now();
  const stationConnected = !!stationLastUpdateMs && nowMs - stationLastUpdateMs <= 5 * 60 * 1000;
  const actuatorConnected = !!actuatorLastUpdateMs && nowMs - actuatorLastUpdateMs <= 30 * 60 * 1000;

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

            {!stationConnected && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                Sensors are not connected. Please check the weather station power, Wi-Fi, and MQTT connection.
              </div>
            )}

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

            {!actuatorConnected && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                Actuator is not connected. Please verify the ESP32 actuator node and relay wiring.
              </div>
            )}

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
                disabled={actuatorLoading || !actuatorConnected}
                onClick={() => setValveState("ON")}
                className="rounded-xl bg-green-600 px-5 py-3 font-extrabold text-white hover:bg-green-700 disabled:opacity-60 transition"
              >
                Open Valve
              </button>
              <button
                disabled={actuatorLoading || !actuatorConnected}
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

        <div className="rounded-3xl bg-white border border-gray-200 shadow p-8 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-indigo-700 uppercase">Real Weather Data</div>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">Current + Daily Forecast</h2>
            </div>
            <button
              onClick={async () => {
                if (!farm?.location) return;
                setWeatherLoading(true);
                try {
                  const city = farm.location.split(",")[0]?.trim() || "Tunis";
                  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&days=7`);
                  if (res.ok) {
                    setRealWeather(await res.json());
                  }
                } finally {
                  setWeatherLoading(false);
                }
              }}
              className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              {weatherLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Time/Day</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Condition</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Temp</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Humidity</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Wind</th>
                  <th className="px-4 py-3 text-left font-extrabold text-gray-700">Rain Chance</th>
                </tr>
              </thead>
              <tbody>
                {realWeather ? (
                  <>
                    <tr className="border-t border-gray-200 bg-indigo-50/40">
                      <td className="px-4 py-3 font-bold text-indigo-700">Current</td>
                      <td className="px-4 py-3 text-gray-700">{realWeather.localTime || "--"}</td>
                      <td className="px-4 py-3 text-gray-700">{realWeather.condition || "--"}</td>
                      <td className="px-4 py-3 text-gray-700">{realWeather.temperature ?? "--"} °C</td>
                      <td className="px-4 py-3 text-gray-700">{realWeather.humidity ?? "--"} %</td>
                      <td className="px-4 py-3 text-gray-700">{realWeather.windSpeed ?? "--"} km/h</td>
                      <td className="px-4 py-3 text-gray-700">--</td>
                    </tr>

                    {(realWeather.dailyForecast || []).map((day: any) => (
                      <tr key={day.date} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-bold text-gray-800">Forecast</td>
                        <td className="px-4 py-3 text-gray-700">{day.dayName} ({day.date})</td>
                        <td className="px-4 py-3 text-gray-700">{day.condition}</td>
                        <td className="px-4 py-3 text-gray-700">{day.minTemp} / {day.maxTemp} °C</td>
                        <td className="px-4 py-3 text-gray-700">--</td>
                        <td className="px-4 py-3 text-gray-700">--</td>
                        <td className="px-4 py-3 text-gray-700">{day.chanceOfRain ?? "--"} %</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      {weatherLoading ? "Loading real weather data..." : "No real weather data available yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow p-8 mb-6">
          <div className="text-sm font-extrabold text-emerald-700 uppercase">AI DSO1</div>
          <h2 className="mt-1 text-xl font-extrabold text-gray-900">Irrigation Need Prediction</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-gray-500 flex items-center gap-1">
                Soil Moisture (%)
                {sensorDataLoaded?.soilMoisture !== null && <span className="text-green-600">📡</span>}
              </label>
              <input
                type="number"
                value={soilMoistureInput ?? ""}
                onChange={(e) => setSoilMoistureInput(e.target.value ? Number(e.target.value) : null)}
                disabled={sensorDataLoaded?.soilMoisture !== null}
                placeholder={sensorDataLoaded?.soilMoisture !== null ? "Sensor data" : "Enter value"}
                className={`mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-bold text-gray-800 ${
                  sensorDataLoaded?.soilMoisture !== null ? "bg-green-50" : ""
                }`}
              />
              {sensorDataLoaded?.soilMoisture !== null ? (
                <div className="text-xs text-green-600 mt-1 font-bold">✓ Auto-filled from soil sensors</div>
              ) : (
                <div className="text-xs text-amber-600 mt-1 font-bold">⚠️ Soil sensors not available - enter manually</div>
              )}
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase text-gray-500">Temperature (°C)</label>
              <input
                type="number"
                value={Number(sensorDataLoaded?.temperature ?? station?.temperature ?? realWeather?.temperature ?? 0)}
                readOnly
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase text-gray-500">Humidity (%)</label>
              <input
                type="number"
                value={Number(sensorDataLoaded?.humidity ?? station?.humidity ?? realWeather?.humidity ?? 0)}
                readOnly
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase text-gray-500 flex items-center gap-1">
                Rainfall (mm)
                {sensorDataLoaded?.rainfallMm !== null && <span className="text-green-600">📡</span>}
              </label>
              <input
                type="number"
                value={rainfallMmInput ?? ""}
                onChange={(e) => setRainfallMmInput(e.target.value ? Number(e.target.value) : null)}
                disabled={sensorDataLoaded?.rainfallMm !== null}
                placeholder={sensorDataLoaded?.rainfallMm !== null ? "Sensor data" : "Enter value"}
                className={`mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-bold text-gray-800 ${
                  sensorDataLoaded?.rainfallMm !== null ? "bg-green-50" : ""
                }`}
              />
              {sensorDataLoaded?.rainfallMm !== null ? (
                <div className="text-xs text-green-600 mt-1 font-bold">✓ Auto-filled from weather station</div>
              ) : (
                <div className="text-xs text-amber-600 mt-1 font-bold">⚠️ Default value (0mm) - edit if needed</div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={runAiPrediction}
              disabled={aiLoading || (soilMoistureInput === null && sensorDataLoaded?.soilMoisture === null)}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {aiLoading ? "Predicting..." : "Predict Irrigation Need"}
            </button>
            <div className="text-sm text-gray-500">
              {sensorDataLoaded?.soilMoisture !== null 
                ? "✓ Using real soil sensor data" 
                : soilMoistureInput !== null
                  ? "Using manual soil input"
                  : "⚠️ Soil data required"}
            </div>
          </div>

          {aiPrediction && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-extrabold uppercase text-emerald-700">Prediction Result</div>
                <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">
                  {aiPrediction.source}
                </div>
              </div>
              
              <div className="grid gap-3">
                <div>
                  <div className="text-sm text-gray-600">Irrigation Need</div>
                  <div className="text-2xl font-extrabold text-gray-900">{aiPrediction.irrigationNeed}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-bold">Confidence Score</div>
                    <div className="text-lg font-extrabold text-gray-800">{aiPrediction.score}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-bold">Recommendation</div>
                    <div className="text-sm font-bold text-gray-800">{aiPrediction.recommendation}</div>
                  </div>
                </div>

                {aiPrediction.dataSource && (
                  <div className="text-xs text-gray-600 border-t border-emerald-200 pt-2 mt-2">
                    <div className="font-bold mb-1">Data sources:</div>
                    <div>• Soil: {aiPrediction.dataSource.soil}</div>
                    <div>• Weather: {aiPrediction.dataSource.weather}</div>
                  </div>
                )}
              </div>
            </div>
          )}
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
