"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFarmRuntime, MissionAction } from "../_context/FarmRuntimeContext";

/* ---------- Types ---------- */
type ZoneMode = "Auto" | "Manual";
type ZoneStatus = "Irrigating" | "Off" | "Alert";

type Zone = {
  _id: string;
  name: string;
  crop_type?: string;
  mode: string;
  width: number;
  length: number;
  moisture_threshold?: number;
  created_at?: string;
};

/* ---------- Demo data ---------- */
const demoZonesByFarm: Record<string, Zone[]> = {
  "olive-tunis": [
    {
      id: "zone-a",
      name: "Zone A — Oliviers Est",
      crop: "Olive",
      mode: "Auto",
      status: "Off",
      moistureAvg: 26,
      threshold: 30,
      lastIrrigation: "Yesterday 18:20",
      nextSchedule: "Today 17:00",
      valve: "OK",
    },
    {
      id: "zone-b",
      name: "Zone B — Oliviers Ouest",
      crop: "Olive",
      mode: "Manual",
      status: "Alert",
      moistureAvg: 19,
      threshold: 28,
      lastIrrigation: "Today 09:10",
      nextSchedule: "—",
      valve: "OK",
    },
  ],
};

const zoneTemplates = [
  { key: "quick", label: "💧 Quick irrigation (10 min)", action: "IRRIGATE" as MissionAction, durationMin: 10, notes: "Standard cycle for the whole zone." },
  { key: "deep", label: "💧 Deep irrigation (20 min)", action: "IRRIGATE" as MissionAction, durationMin: 20, notes: "Recommended when moisture is low." },
  { key: "spray", label: "🧴 Spray zone (5 min)", action: "SPRAY" as MissionAction, durationMin: 5, notes: "Row-by-row spraying sequence." },
  { key: "inspect", label: "📷 Inspect zone", action: "INSPECT" as MissionAction, notes: "Robot巡回: capture photos & anomalies." },
];

export default function ZonesPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const { addMission, missions } = useFarmRuntime();

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchZones() {
      setLoading(true);
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones`);
      const data = await res.json();
      setZones(data);
      setLoading(false);
    }
    fetchZones();
  }, [farmId]);

  // modal state
  const [open, setOpen] = useState(false);
  const [targetZone, setTargetZone] = useState<Zone | null>(null);

  const [templateKey, setTemplateKey] = useState(zoneTemplates[0].key);
  const [action, setAction] = useState<MissionAction>("IRRIGATE");
  const [duration, setDuration] = useState<number>(10);
  const [notes, setNotes] = useState("");

  const kpi = useMemo(() => {
    const total = zones.length;
    const alerts = zones.filter((z) => z.status === "Alert").length;
    const irrigating = zones.filter((z) => z.status === "Irrigating").length;
    const ok = total - alerts;
    return { total, ok, alerts, irrigating };
  }, [zones]);

  const pendingZoneMissions = useMemo(() => {
    return missions.filter((m) => m.type === "ZONE" && (m.status === "PENDING" || m.status === "RUNNING")).length;
  }, [missions]);

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const tpl = zoneTemplates.find((t) => t.key === key) ?? zoneTemplates[0];
    setAction(tpl.action);
    setDuration(tpl.durationMin ?? 10);
    setNotes(tpl.notes ?? "");
  }

  function openMissionModal(z: Zone) {
    setTargetZone(z);
    setOpen(true);

    // smart template
    const smart = z.moistureAvg < z.threshold ? "deep" : "quick";
    applyTemplate(z.status === "Alert" ? "inspect" : smart);
  }

  function createZoneMission() {
    if (!targetZone) return;

    const tpl = zoneTemplates.find((t) => t.key === templateKey);

    addMission({
      type: "ZONE",
      action,
      targetId: targetZone.id,
      targetLabel: targetZone.name,
      durationMin: action === "INSPECT" ? undefined : Math.max(1, duration || 1),
      template: tpl?.label,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    setOpen(false);
  }

  return (
    <div className="grid gap-6">
      {/* HEADER */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-green-700">ZONES</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              Irrigation Zones Overview
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Monitor each zone, and create missions (IRRIGATE / SPRAY / INSPECT) directly into the Robot queue.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/owner/farms/${farmId}`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              Back to Farm
            </Link>
            <Link
              href={`/owner/farms/${farmId}/robot`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              🤖 Robot
            </Link>
            <Link
              href={`/owner/farms/${farmId}/trees`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              🌳 Trees
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          <Kpi title="Total zones" value={String(kpi.total)} icon="📍" />
          <Kpi title="Irrigating" value={String(kpi.irrigating)} icon="💧" />
          <Kpi title="Alerts" value={String(kpi.alerts)} icon="⚠️" />
          <Kpi title="Active missions" value={String(pendingZoneMissions)} icon="🕒" />
        </div>
      </div>

      {/* ZONE CARDS */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-extrabold text-gray-900">Zones</h2>
          <div className="text-sm text-gray-600 font-semibold">
            Click a zone to create a mission
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-gray-500">Loading zones...</div>
          ) : zones.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
              No zones found.
            </div>
          ) : (
            zones.map((z) => (
              <div key={z._id} className="rounded-3xl border border-green-200 bg-white p-6 shadow hover:shadow-lg transition-all duration-200">
                <div className="font-extrabold text-lg text-green-900 mb-2">{z.name}</div>
                <div className="text-gray-700 mb-1">Crop Type: {z.crop_type || "-"}</div>
                <div className="text-gray-700 mb-1">Mode: {z.mode}</div>
                <div className="text-gray-700 mb-1">Moisture Threshold: {z.moisture_threshold ?? "-"}</div>
                <div className="text-gray-700 mb-1">Width: {z.width} m</div>
                <div className="text-gray-700 mb-1">Length: {z.length} m</div>
                <div className="text-gray-500 text-xs mt-2">Created: {z.created_at ? new Date(z.created_at).toLocaleString() : "-"}</div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/owner/farms/${farmId}/zones/${z._id}/trees`}
                    className="flex-1 text-center bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    🌳 Trees
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {open && targetZone && (
        <Modal
          title={`Create mission for ${targetZone.name}`}
          subtitle={`Mode: ${targetZone.mode} • Moisture: ${targetZone.moistureAvg}% (threshold ${targetZone.threshold}%)`}
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4">
            <Field label="Template (recommended)">
              <select
                value={templateKey}
                onChange={(e) => applyTemplate(e.target.value)}
                className={inputClass}
              >
                {zoneTemplates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Action">
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as MissionAction)}
                  className={inputClass}
                >
                  <option value="IRRIGATE">IRRIGATE</option>
                  <option value="SPRAY">SPRAY</option>
                  <option value="INSPECT">INSPECT</option>
                </select>
              </Field>

              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min={1}
                  value={action === "INSPECT" ? 1 : duration}
                  disabled={action === "INSPECT"}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} min-h-[110px]`}
                placeholder="Example: Irrigate only in the morning…"
              />
            </Field>

            <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
              <div className="font-extrabold text-gray-900">What will happen (demo)</div>
              <p className="mt-2 text-sm text-gray-700 font-semibold">
                This mission will be added to the Robot queue. The robot executes row-by-row and reports status (pending/running/done).
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={createZoneMission} className={primaryBtn}>
                Add to Robot queue
              </button>
              <button onClick={() => setOpen(false)} className={secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI ---------- */

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60";

const primaryBtn =
  "bg-green-700 hover:bg-green-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60";

const secondaryBtn =
  "border border-gray-200 hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold";

function statusClass(s: ZoneStatus) {
  if (s === "Alert") return "bg-red-100 text-red-800";
  if (s === "Irrigating") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

function Chip({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{children}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-extrabold text-green-700">ZONE MISSION</div>
            <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600 font-semibold">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-gray-200 hover:bg-gray-50 transition font-extrabold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Kpi({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-[#F7F8F4] border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-extrabold text-gray-500 uppercase">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{value}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-white border border-gray-200 grid place-items-center text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8F4] border border-gray-200 p-4">
      <div className="text-[11px] font-extrabold text-gray-500 uppercase">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-gray-900 truncate">{value}</div>
    </div>
  );
}
