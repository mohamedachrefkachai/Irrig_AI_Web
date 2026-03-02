"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type WorkerStatus = "Active" | "Offline" | "On field" | "Invited";
type WorkerRole = "Field Operator" | "Maintenance" | "Supervisor";
type Zone = string;

type TaskPriority = "Low" | "Medium" | "High";
type TaskStatus = "Pending" | "In progress" | "Done";

type Task = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  zone: Zone;
  notes?: string;
  createdAt: string;
};

type Worker = {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  zone: Zone;
  inviteCode?: string;
  inviteQrUrl?: string;
  tasks: Task[];
  lastSeen: string;
  photo: string;
};

const demoWorkersByFarm: Record<string, Worker[]> = {
  "olive-tunis": [
    {
      id: "w1",
      name: "Ahmed Ben Ali",
      role: "Field Operator",
      status: "On field",
      zone: "Zone A",
      inviteCode: undefined,
      tasks: [
        {
          id: "t1",
          title: "Check soil moisture sensors",
          priority: "High",
          status: "In progress",
          dueDate: "2026-02-20",
          zone: "Zone A",
          notes: "Focus on row 3 (olive trees).",
          createdAt: "2026-02-19",
        },
      ],
      lastSeen: "5 min ago",
      photo: "/worker-default.jpg",
    },
    {
      id: "w2",
      name: "Sami K.",
      role: "Maintenance",
      status: "Active",
      zone: "Zone B",
      tasks: [
        {
          id: "t2",
          title: "Inspect valve wiring",
          priority: "Medium",
          status: "Pending",
          dueDate: "2026-02-21",
          zone: "Zone B",
          createdAt: "2026-02-19",
        },
      ],
      lastSeen: "20 min ago",
      photo: "/worker-default.jpg",
    },
    {
      id: "w3",
      name: "Invited Worker",
      role: "Supervisor",
      status: "Invited",
      zone: "—",
      inviteCode: "IRG-9Q2K7",
      inviteQrUrl:
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=IRG-9Q2K7",
      tasks: [],
      lastSeen: "Invitation sent",
      photo: "/worker-default.jpg",
    },
  ],
  "citrus-nabeul": [
    {
      id: "w4",
      name: "Youssef B.",
      role: "Field Operator",
      status: "Active",
      zone: "Zone A",
      tasks: [],
      lastSeen: "10 min ago",
      photo: "/worker-default.jpg",
    },
    {
      id: "w5",
      name: "Houssem R.",
      role: "Maintenance",
      status: "On field",
      zone: "Zone B",
      tasks: [],
      lastSeen: "2 min ago",
      photo: "/worker-default.jpg",
    },
  ],
  "palm-tozeur": [
    {
      id: "w6",
      name: "Salma T.",
      role: "Supervisor",
      status: "Active",
      zone: "Zone A",
      tasks: [],
      lastSeen: "Now",
      photo: "/worker-default.jpg",
    },
  ],
};

function makeInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `IRG-${s}`;
}

function makeInvitePayload(farmId: string, code: string, role: WorkerRole, zone: Zone) {
  return JSON.stringify({ farmId, code, role, zone, type: "worker-invite" });
}

function makeInviteQrUrl(payload: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysDiff(fromISO: string, toISO: string) {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function taskRisk(dueDateISO: string) {
  const today = todayISO();
  const d = daysDiff(today, dueDateISO);
  if (d < 0) return "OVERDUE";
  if (d <= 1) return "DUE_SOON";
  return "ON_TIME";
}

export default function WorkersPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const initial = useMemo(() => demoWorkersByFarm[farmId] ?? [], [farmId]);
  const [workers, setWorkers] = useState<Worker[]>(initial);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "All">("All");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [role, setRole] = useState<WorkerRole>("Field Operator");
  const [zone, setZone] = useState<Zone>("—");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string | null>(null);
  const [zoneOptions, setZoneOptions] = useState<Zone[]>(["—"]);

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskWorkerId, setTaskWorkerId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Medium");
  const [taskDueDate, setTaskDueDate] = useState(todayISO());
  const [taskZone, setTaskZone] = useState<Zone>("—");
  const [taskNotes, setTaskNotes] = useState("");

  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch(`/api/dashboard/farms/${farmId}/zones`);
        if (!res.ok) {
          setZoneOptions(["—"]);
          return;
        }
        const zones = await res.json();
        const names = zones.map((z: any) => z.name).filter((name: string) => !!name?.trim());
        const uniqueNames = Array.from(new Set(names));
        setZoneOptions(uniqueNames.length > 0 ? uniqueNames : ["—"]);
      } catch {
        setZoneOptions(["—"]);
      }
    }
    fetchZones();
  }, [farmId]);

  useEffect(() => {
    const firstZone = zoneOptions[0] ?? "—";
    setZone(firstZone);
    setTaskZone(firstZone);
  }, [zoneOptions]);

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      const matchesQuery =
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.role.toLowerCase().includes(query.toLowerCase()) ||
        (w.inviteCode ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : w.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [workers, query, statusFilter]);

  const kpi = useMemo(() => {
    const total = workers.length;
    const active = workers.filter((w) => w.status === "Active" || w.status === "On field").length;
    const invited = workers.filter((w) => w.status === "Invited").length;
    const tasks = workers.reduce((sum, w) => sum + w.tasks.length, 0);
    return { total, active, invited, tasks };
  }, [workers]);

  function openInvite() {
    setInviteOpen(true);
    setGeneratedCode(null);
    setGeneratedQrUrl(null);
    setRole("Field Operator");
    setZone(zoneOptions[0] ?? "—");
  }

  function createInvite() {
    const code = makeInviteCode();
    const payload = makeInvitePayload(farmId, code, role, zone);
    const qrUrl = makeInviteQrUrl(payload);
    setGeneratedCode(code);
    setGeneratedQrUrl(qrUrl);

    const newWorker: Worker = {
      id: `w${Math.random().toString(16).slice(2)}`,
      name: "Invited Worker",
      role,
      status: "Invited",
      zone,
      inviteCode: code,
      inviteQrUrl: qrUrl,
      tasks: [],
      lastSeen: "Invitation sent",
      photo: "/worker-default.jpg",
    };

    setWorkers((prev) => [newWorker, ...prev]);
  }

  function resendInvite(id: string) {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id && w.status === "Invited" ? { ...w, lastSeen: "Invite re-sent (demo)" } : w
      )
    );
  }

  function toggleStatus(id: string) {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.status === "Invited") return w;
        const next: WorkerStatus = w.status === "Offline" ? "Active" : "Offline";
        return { ...w, status: next, lastSeen: "Now" };
      })
    );
  }

  function openTaskModal(workerId: string) {
    setTaskWorkerId(workerId);
    setTaskTitle("");
    setTaskPriority("Medium");
    setTaskDueDate(todayISO());
    setTaskZone(zoneOptions[0] ?? "—");
    setTaskNotes("");
    setTaskOpen(true);
  }

  function createTask() {
    if (!taskWorkerId) return;
    const title = taskTitle.trim();
    if (!title) return;

    const newTask: Task = {
      id: `t${Math.random().toString(16).slice(2)}`,
      title,
      priority: taskPriority,
      status: "Pending",
      dueDate: taskDueDate,
      zone: taskZone,
      notes: taskNotes.trim() ? taskNotes.trim() : undefined,
      createdAt: todayISO(),
    };

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== taskWorkerId) return w;
        return { ...w, tasks: [newTask, ...w.tasks] };
      })
    );

    setTaskOpen(false);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-green-700">WORKERS</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              Team Management
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Invite workers using a code/QR. Assign tasks from the owner dashboard.
            </p>
          </div>

          <button onClick={openInvite} className={primaryBtn}>
            + Invite Worker
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          <Kpi title="Total Workers" value={String(kpi.total)} icon="👷" />
          <Kpi title="Active Today" value={String(kpi.active)} icon="✅" />
          <Kpi title="Invited" value={String(kpi.invited)} icon="🟣" />
          <Kpi title="Tasks" value={String(kpi.tasks)} icon="📋" />
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, role, invite code..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkerStatus | "All")}
              className={inputClass}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="On field">On field</option>
              <option value="Offline">Offline</option>
              <option value="Invited">Invited</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 transition px-4 py-3 rounded-2xl font-extrabold"
              onClick={() => {
                setQuery("");
                setStatusFilter("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-extrabold text-gray-900">Workers List</h2>
          <div className="text-sm text-gray-600 font-semibold">
            Showing {filtered.length} / {workers.length}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {filtered.map((w) => (
            <WorkerCard
              key={w.id}
              farmId={farmId}
              w={w}
              onToggle={() => toggleStatus(w.id)}
              onResend={() => resendInvite(w.id)}
              onAssign={() => openTaskModal(w.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
            No workers found for this filter.
          </div>
        )}
      </div>

      {inviteOpen && (
        <Modal
          title="Invite a Worker"
          subtitle="Generate invite code (and QR). Worker completes profile in mobile app."
          onClose={() => setInviteOpen(false)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Role">
              <select value={role} onChange={(e) => setRole(e.target.value as WorkerRole)} className={inputClass}>
                <option value="Field Operator">Field Operator</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </Field>

            <Field label="Assigned Zone">
              <select value={zone} onChange={(e) => setZone(e.target.value as Zone)} className={inputClass}>
                {zoneOptions.map((zoneName) => (
                  <option key={zoneName} value={zoneName}>{zoneName}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button onClick={createInvite} className={primaryBtn}>
              Generate Invite Code
            </button>
            <button onClick={() => setInviteOpen(false)} className={secondaryBtn}>
              Close
            </button>
          </div>

          {generatedCode && (
            <div className="mt-6 rounded-3xl border border-gray-200 bg-[#F7F8F4] p-6">
              <div className="text-sm font-extrabold text-gray-500 uppercase">Invite Code</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">{generatedCode}</div>

              <div className="mt-5 grid md:grid-cols-[1fr_160px] gap-4 items-center">
                <div className="text-gray-700 font-semibold">
                  <div className="font-extrabold text-gray-900">How to use</div>
                  <ol className="mt-2 grid gap-1 list-decimal list-inside">
                    <li>Open mobile app</li>
                    <li>Tap "Join Farm / Enter Code"</li>
                    <li>Enter this code to activate access</li>
                  </ol>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 p-4 grid place-items-center">
                  <div className="text-xs font-extrabold text-gray-500 uppercase">QR</div>
                  {generatedQrUrl ? (
                    <img src={generatedQrUrl} alt="Invite QR" className="mt-2 h-24 w-24 rounded-xl border border-gray-200" />
                  ) : (
                    <div className="mt-2 h-24 w-24 rounded-xl border border-dashed border-gray-300 grid place-items-center text-xs font-extrabold text-gray-500">
                      QR
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-gray-500 font-semibold text-center">
                    Scan in Android app
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {taskOpen && (
        <Modal
          title="Assign Task"
          subtitle="Create a task for the selected worker."
          onClose={() => setTaskOpen(false)}
        >
          <div className="grid gap-4">
            <Field label="Task Title">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Example: Check Zone A moisture sensors"
                className={inputClass}
              />
            </Field>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Priority">
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className={inputClass}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </Field>

              <Field label="Due date">
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Zone">
                <select value={taskZone} onChange={(e) => setTaskZone(e.target.value as Zone)} className={inputClass}>
                  {zoneOptions.map((zoneName) => (
                    <option key={zoneName} value={zoneName}>{zoneName}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Extra details for the worker..."
                className={`${inputClass} min-h-[110px]`}
              />
            </Field>

            <div className="flex gap-3 flex-wrap">
              <button onClick={createTask} className={primaryBtn} disabled={!taskTitle.trim()}>
                Create Task
              </button>
              <button onClick={() => setTaskOpen(false)} className={secondaryBtn}>
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
            <div className="text-sm font-extrabold text-green-700">MODAL</div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">{label}</label>
      {children}
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

function StatusChip({ status }: { status: WorkerStatus }) {
  const cls =
    status === "Invited"
      ? "bg-purple-100 text-purple-800"
      : status === "Offline"
        ? "bg-gray-100 text-gray-800"
        : status === "On field"
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800";
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{status}</span>;
}

function RiskChip({ dueDate }: { dueDate: string }) {
  const r = taskRisk(dueDate);
  const cls =
    r === "OVERDUE"
      ? "bg-red-100 text-red-800 border-red-200"
      : r === "DUE_SOON"
        ? "bg-orange-100 text-orange-800 border-orange-200"
        : "bg-green-100 text-green-800 border-green-200";

  const label = r === "OVERDUE" ? "Overdue" : r === "DUE_SOON" ? "Due soon" : "On time";

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${cls}`}>
      {label}
    </span>
  );
}

function WorkerCard({
  farmId,
  w,
  onToggle,
  onResend,
  onAssign,
}: {
  farmId: string;
  w: Worker;
  onToggle: () => void;
  onResend: () => void;
  onAssign: () => void;
}) {
  const notDone = w.tasks.filter((t) => t.status !== "Done");
  const pendingCount = notDone.length;
  const lastTasks = w.tasks.slice(0, 3);
  const urgent = [...notDone].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 2);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img
            src={w.photo}
            alt="Worker"
            className="h-12 w-12 rounded-2xl object-cover border border-gray-200"
          />
          <div>
            <div className="text-lg font-extrabold text-gray-900">{w.name}</div>
            <div className="mt-1 text-sm text-gray-600 font-semibold">
              {w.role} • {w.zone}
            </div>

            {w.status === "Invited" && w.inviteCode && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-3 py-1">
                <span className="text-xs font-extrabold text-purple-800">Invite:</span>
                <span className="text-xs font-extrabold text-purple-900">{w.inviteCode}</span>
              </div>
            )}
            {w.status === "Invited" && w.inviteQrUrl && (
              <div className="mt-2">
                <img src={w.inviteQrUrl} alt="Worker invite QR" className="h-16 w-16 rounded-xl border border-purple-200" />
              </div>
            )}
          </div>
        </div>

        <StatusChip status={w.status} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Mini label="Tasks" value={`${pendingCount}`} />
        <Mini label="Last seen" value={w.lastSeen} />
        <Mini label="Access" value={w.status === "Invited" ? "Pending" : "Enabled"} />
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-extrabold text-gray-900">Task Preview</div>
          <div className="text-xs font-extrabold text-gray-500">{notDone.length} not done</div>
        </div>

        {urgent.length > 0 ? (
          <div className="mt-3 flex gap-2 flex-wrap">
            {urgent.map((t) => (
              <div
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1"
              >
                <RiskChip dueDate={t.dueDate} />
                <div className="text-xs font-extrabold text-gray-900">
                  {t.title.length > 22 ? `${t.title.slice(0, 22)}…` : t.title}
                </div>
                <div className="text-[11px] font-extrabold text-gray-500">{t.dueDate}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-600 font-semibold">No active tasks.</div>
        )}

        <div className="mt-4 grid gap-2">
          {lastTasks.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-white border border-gray-200 px-4 py-3 flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-sm font-extrabold text-gray-900">{t.title}</div>
                <div className="mt-1 text-xs text-gray-600 font-semibold">
                  {t.zone} • Due {t.dueDate} • {t.priority} • {t.status}
                </div>
              </div>
              <RiskChip dueDate={t.dueDate} />
            </div>
          ))}

          {lastTasks.length === 0 && (
            <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-600 font-semibold">
              No tasks yet. Assign the first task.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-3 flex-wrap">
        {w.status !== "Invited" ? (
          <button
            onClick={onToggle}
            className="bg-gray-900 hover:bg-black transition text-white px-4 py-2 rounded-xl font-extrabold shadow"
          >
            Toggle Status
          </button>
        ) : (
          <button
            onClick={onResend}
            className="bg-purple-700 hover:bg-purple-800 transition text-white px-4 py-2 rounded-xl font-extrabold shadow"
          >
            Resend Invite
          </button>
        )}

        <button
          onClick={onAssign}
          className="border border-gray-200 hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold"
        >
          Assign Task
        </button>

        <Link href={`/owner/farms/${farmId}/workers/${w.id}`}>
          <button className="border border-gray-200 hover:bg-gray-50 transition px-4 py-2 rounded-xl font-extrabold">
            Profile
          </button>
        </Link>
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
