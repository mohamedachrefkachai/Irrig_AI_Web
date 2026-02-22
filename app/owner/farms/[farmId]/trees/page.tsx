"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

type TreeStatus = "OK" | "Needs irrigation" | "Anomaly";
type Zone = "Zone A" | "Zone B";

type Tree = {
  id: string;
  zone: Zone;
  row: number;
  index: number;
  lastSeen: string;
  status: TreeStatus;
  moisture?: number;
};

type MissionType = "TREE";
type MissionAction = "IRRIGATE" | "SPRAY" | "INSPECT";
type MissionStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

type Mission = {
  id: string;
  type: MissionType;
  action: MissionAction;
  targetTreeId: string;
  durationMin?: number;
  createdAt: string;
  status: MissionStatus;
  template?: string;
  notes?: string;
};

type Template = {
  key: string;
  label: string;
  action: MissionAction;
  durationMin?: number;
  notes?: string;
};

const demoTreesByFarm: Record<string, Tree[]> = {
  "olive-tunis": [
    { id: "R1-T1", zone: "Zone A", row: 1, index: 1, lastSeen: "Today 10:12", status: "OK", moisture: 34 },
    {
      id: "R1-T2",
      zone: "Zone A",
      row: 1,
      index: 2,
      lastSeen: "Today 10:14",
      status: "Needs irrigation",
      moisture: 22,
    },
    {
      id: "R1-T3",
      zone: "Zone A",
      row: 1,
      index: 3,
      lastSeen: "Yesterday 17:40",
      status: "OK",
      moisture: 31,
    },
    {
      id: "R2-T1",
      zone: "Zone B",
      row: 2,
      index: 1,
      lastSeen: "Today 09:50",
      status: "Anomaly",
      moisture: 18,
    },
    {
      id: "R2-T2",
      zone: "Zone B",
      row: 2,
      index: 2,
      lastSeen: "Today 09:52",
      status: "Needs irrigation",
      moisture: 20,
    },
    { id: "R2-T3", zone: "Zone B", row: 2, index: 3, lastSeen: "—", status: "OK", moisture: 35 },
  ],
};

const templates: Template[] = [
  {
    key: "quick-irrigation",
    label: "💧 Quick irrigation (5 min)",
    action: "IRRIGATE",
    durationMin: 5,
    notes: "Default irrigation cycle.",
  },
  {
    key: "deep-irrigation",
    label: "💧 Deep irrigation (10 min)",
    action: "IRRIGATE",
    durationMin: 10,
    notes: "For low moisture trees.",
  },
  {
    key: "anti-pest",
    label: "🧴 Anti-pest spray (1 min)",
    action: "SPRAY",
    durationMin: 1,
    notes: "Spray at safe distance.",
  },
  {
    key: "inspection",
    label: "📷 Inspection photo",
    action: "INSPECT",
    notes: "Capture and upload a photo.",
  },
];

function nowLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Today ${hh}:${mm}`;
}

function missionId() {
  return `m_${Math.random().toString(16).slice(2)}`;
}

export default function TreesPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const [trees, setTrees] = useState<Tree[]>(demoTreesByFarm[farmId] ?? []);
  const [missions, setMissions] = useState<Mission[]>([]);

  const [q, setQ] = useState("");
  const [zoneFilter, setZoneFilter] = useState<Zone | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TreeStatus | "All">("All");

  const [open, setOpen] = useState(false);
  const [targetTree, setTargetTree] = useState<Tree | null>(null);

  const [templateKey, setTemplateKey] = useState<string>(templates[0].key);
  const [action, setAction] = useState<MissionAction>("IRRIGATE");
  const [duration, setDuration] = useState<number>(5);
  const [notes, setNotes] = useState("");

  const kpi = useMemo(() => {
    const total = trees.length;
    const need = trees.filter((t) => t.status === "Needs irrigation").length;
    const anomaly = trees.filter((t) => t.status === "Anomaly").length;
    const ok = total - need - anomaly;
    return { total, ok, need, anomaly };
  }, [trees]);

  const filtered = useMemo(() => {
    return trees.filter((t) => {
      const matchesQ =
        t.id.toLowerCase().includes(q.toLowerCase()) ||
        `${t.row}`.includes(q) ||
        `${t.index}`.includes(q);
      const matchesZone = zoneFilter === "All" ? true : t.zone === zoneFilter;
      const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;
      return matchesQ && matchesZone && matchesStatus;
    });
  }, [trees, q, zoneFilter, statusFilter]);

  function openMissionModal(tree: Tree) {
    setTargetTree(tree);
    setOpen(true);

    const smart =
      tree.status === "Needs irrigation"
        ? "deep-irrigation"
        : tree.status === "Anomaly"
          ? "inspection"
          : "quick-irrigation";

    applyTemplate(smart);
  }

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const t = templates.find((x) => x.key === key) ?? templates[0];
    setAction(t.action);
    setDuration(t.durationMin ?? 0);
    setNotes(t.notes ?? "");
  }

  function createMission() {
    if (!targetTree) return;

    const tpl = templates.find((x) => x.key === templateKey);

    const m: Mission = {
      id: missionId(),
      type: "TREE",
      action,
      targetTreeId: targetTree.id,
      durationMin: action === "INSPECT" ? undefined : Math.max(1, duration || 1),
      createdAt: nowLabel(),
      status: "PENDING",
      template: tpl?.label,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setMissions((prev) => [m, ...prev]);
    setOpen(false);

    setTrees((prev) =>
      prev.map((t) => (t.id === targetTree.id ? { ...t, lastSeen: "Mission scheduled" } : t))
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-green-700">TREES</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              Tree Tracking & Robot Missions
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Each tree has a marker (ArUco/QR). Send missions per tree: irrigate, spray, inspect.
            </p>
          </div>

          <Link
            href={`/owner/farms/${farmId}`}
            className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
          >
            Back to Farm
          </Link>
        </div>

        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          <Kpi title="Total trees" value={String(kpi.total)} icon="🌳" />
          <Kpi title="OK" value={String(kpi.ok)} icon="✅" />
          <Kpi title="Need irrigation" value={String(kpi.need)} icon="💧" />
          <Kpi title="Anomalies" value={String(kpi.anomaly)} icon="⚠️" />
        </div>

        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <Field label="Search (TreeID, row, index)">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Example: R2-T7"
              className={inputClass}
            />
          </Field>

          <Field label="Zone">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as Zone | "All")}
              className={inputClass}
            >
              <option value="All">All</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
            </select>
          </Field>

          <Field label="Status">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TreeStatus | "All")}
              className={inputClass}
            >
              <option value="All">All</option>
              <option value="OK">OK</option>
              <option value="Needs irrigation">Needs irrigation</option>
              <option value="Anomaly">Anomaly</option>
            </select>
          </Field>

          <div className="flex items-end">
            <button
              onClick={() => {
                setQ("");
                setZoneFilter("All");
                setStatusFilter("All");
              }}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-3 rounded-2xl font-extrabold"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-extrabold text-gray-900">Trees</h2>
            <div className="text-sm text-gray-600 font-semibold">
              Showing {filtered.length} / {trees.length}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            {filtered.map((t) => (
              <TreeCard key={t.id} t={t} onMission={() => openMissionModal(t)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
              No trees found.
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900">Mission Queue</h2>
            <span className="text-sm font-extrabold text-gray-500">{missions.length}</span>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
            <div className="font-extrabold text-gray-900">How it works (demo)</div>
            <p className="mt-2 text-sm text-gray-700 font-semibold">
              Owner sends mission → robot executes physically using ArUco/QR markers → robot
              reports status.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {missions.map((m) => (
              <div key={m.id} className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-gray-900">
                      {m.action} • <span className="text-green-800">{m.targetTreeId}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 font-semibold">
                      {m.template ?? "Custom"} • Created: {m.createdAt}
                    </div>
                  </div>
                  <MissionChip status={m.status} />
                </div>

                {(m.durationMin || m.notes) && (
                  <div className="mt-3 text-sm text-gray-700 font-semibold">
                    {m.durationMin ? <>Duration: {m.durationMin} min</> : null}
                    {m.durationMin && m.notes ? " • " : null}
                    {m.notes ? <>Notes: {m.notes}</> : null}
                  </div>
                )}
              </div>
            ))}

            {missions.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
                No missions yet. Click “Send mission” on a tree.
              </div>
            )}
          </div>
        </div>
      </div>

      {open && targetTree && (
        <Modal
          title={`Send mission to ${targetTree.id}`}
          subtitle={`Zone: ${targetTree.zone} • Row ${targetTree.row} • Tree ${targetTree.index}`}
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4">
            <Field label="Template (recommended)">
              <select
                value={templateKey}
                onChange={(e) => applyTemplate(e.target.value)}
                className={inputClass}
              >
                {templates.map((t) => (
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
                placeholder="Example: Spray only 30 seconds near leaves..."
                className={`${inputClass} min-h-[110px]`}
              />
            </Field>

            <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
              <div className="font-extrabold text-gray-900">Tree info (demo)</div>
              <div className="mt-2 text-sm text-gray-700 font-semibold">
                Status: <b>{targetTree.status}</b>
                {typeof targetTree.moisture === "number" ? (
                  <>
                    {" "}
                    • Moisture: <b>{targetTree.moisture}%</b>
                  </>
                ) : null}
                <br />
                The robot will stop when it detects marker <b>{targetTree.id}</b>.
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={createMission} className={primaryBtn}>
                Send mission
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

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60";

const primaryBtn =
  "bg-green-700 hover:bg-green-800 transition text-white px-6 py-3 rounded-2xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60";

const secondaryBtn =
  "border border-gray-200 hover:bg-gray-50 transition px-6 py-3 rounded-2xl font-extrabold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">{label}</label>
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
            <div className="text-sm font-extrabold text-green-700">MISSION</div>
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

function StatusChip({ status }: { status: TreeStatus }) {
  const cls =
    status === "Anomaly"
      ? "bg-red-100 text-red-800"
      : status === "Needs irrigation"
        ? "bg-orange-100 text-orange-800"
        : "bg-green-100 text-green-800";
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{status}</span>;
}

function MissionChip({ status }: { status: MissionStatus }) {
  const cls =
    status === "FAILED"
      ? "bg-red-100 text-red-800"
      : status === "DONE"
        ? "bg-green-100 text-green-800"
        : status === "RUNNING"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800";
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{status}</span>;
}

function TreeCard({ t, onMission }: { t: Tree; onMission: () => void }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">{t.id}</div>
          <div className="mt-1 text-sm text-gray-600 font-semibold">
            {t.zone} • Row {t.row} • Tree {t.index}
          </div>
        </div>
        <StatusChip status={t.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Mini label="Last seen" value={t.lastSeen} />
        <Mini label="Moisture" value={typeof t.moisture === "number" ? `${t.moisture}%` : "—"} />
        <Mini label="Marker" value={t.id} />
      </div>

      <div className="mt-5 flex gap-3 flex-wrap">
        <button
          onClick={onMission}
          className="bg-green-700 hover:bg-green-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow"
        >
          Send mission
        </button>
        <button className="border border-gray-200 hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold">
          View history
        </button>
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
