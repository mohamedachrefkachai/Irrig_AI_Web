"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";

type TaskPriority = "Low" | "Medium" | "High";
type TaskStatus = "Pending" | "In progress" | "Done";
type Zone = "Zone A" | "Zone B" | "—";

type Task = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  zone: Zone;
  createdAt: string;
  notes?: string;
};

type Worker = {
  id: string;
  name: string;
  role: string;
  status: string;
  zone: Zone;
  inviteCode?: string;
  lastSeen: string;
  photo: string;
  tasks: Task[];
};

const demoProfiles: Record<string, Worker> = {
  w1: {
    id: "w1",
    name: "Ahmed Ben Ali",
    role: "Field Operator",
    status: "On field",
    zone: "Zone A",
    lastSeen: "5 min ago",
    photo: "/worker-default.jpg",
    tasks: [
      {
        id: "t1",
        title: "Check soil moisture sensors",
        priority: "High",
        status: "In progress",
        dueDate: "2026-02-20",
        zone: "Zone A",
        createdAt: "2026-02-19",
      },
      {
        id: "t2",
        title: "Inspect drip lines",
        priority: "Medium",
        status: "Pending",
        dueDate: "2026-02-21",
        zone: "Zone A",
        createdAt: "2026-02-19",
      },
      {
        id: "t3",
        title: "Report anomalies (camera)",
        priority: "Low",
        status: "Done",
        dueDate: "2026-02-19",
        zone: "Zone A",
        createdAt: "2026-02-18",
      },
    ],
  },
  w2: {
    id: "w2",
    name: "Sami K.",
    role: "Maintenance",
    status: "Active",
    zone: "Zone B",
    lastSeen: "20 min ago",
    photo: "/worker-default.jpg",
    tasks: [
      {
        id: "t4",
        title: "Inspect valve wiring",
        priority: "Medium",
        status: "Pending",
        dueDate: "2026-02-21",
        zone: "Zone B",
        createdAt: "2026-02-19",
      },
    ],
  },
  w3: {
    id: "w3",
    name: "Invited Worker",
    role: "Supervisor",
    status: "Invited",
    zone: "—",
    inviteCode: "IRG-9Q2K7",
    lastSeen: "Invitation sent",
    photo: "/worker-default.jpg",
    tasks: [],
  },
};

export default function WorkerProfilePage() {
  const params = useParams<{ farmId: string; workerId: string }>();
  const { farmId, workerId } = params;

  const worker: Worker =
    demoProfiles[workerId] ??
    ({
      id: workerId,
      name: "Worker",
      role: "—",
      status: "Invited",
      zone: "—",
      inviteCode: "IRG-XXXXX",
      lastSeen: "—",
      photo: "/worker-default.jpg",
      tasks: [],
    } as Worker);

  const grouped = useMemo(() => {
    const pending = worker.tasks.filter((t) => t.status === "Pending");
    const inprogress = worker.tasks.filter((t) => t.status === "In progress");
    const done = worker.tasks.filter((t) => t.status === "Done");
    return { pending, inprogress, done };
  }, [worker.tasks]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href={`/owner/farms/${farmId}/workers`}
          className="font-extrabold text-green-800 hover:text-green-900"
        >
          ← Back to Workers
        </Link>

        <div className="flex gap-3 flex-wrap">
          {worker.status === "Invited" ? (
            <button className="bg-purple-700 hover:bg-purple-800 transition text-white px-5 py-2.5 rounded-xl font-extrabold shadow">
              Resend Invite
            </button>
          ) : (
            <button className="bg-gray-900 hover:bg-black transition text-white px-5 py-2.5 rounded-xl font-extrabold shadow">
              Disable Access
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8 grid md:grid-cols-[180px_1fr] gap-8">
        <div className="flex flex-col items-center">
          <img
            src={worker.photo}
            alt="Worker"
            className="h-40 w-40 rounded-3xl object-cover border border-gray-200"
          />
          <div className="mt-4">
            <StatusChip status={worker.status} />
          </div>

          {worker.status === "Invited" && worker.inviteCode && (
            <div className="mt-4 rounded-2xl bg-purple-50 border border-purple-200 px-4 py-3 text-center w-full">
              <div className="text-xs font-extrabold text-purple-700 uppercase">Invite Code</div>
              <div className="mt-1 text-lg font-extrabold text-purple-900">{worker.inviteCode}</div>
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-extrabold text-green-700">WORKER PROFILE</div>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{worker.name}</h1>
          <p className="mt-1 text-gray-600 font-semibold">
            {worker.role} • {worker.zone} • Last seen: {worker.lastSeen}
          </p>

          <div className="mt-7 grid sm:grid-cols-3 gap-4">
            <Kpi title="Pending" value={String(grouped.pending.length)} />
            <Kpi title="In progress" value={String(grouped.inprogress.length)} />
            <Kpi title="Done" value={String(grouped.done.length)} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <TaskColumn
          title="Pending"
          hint="Waiting to start"
          tasks={grouped.pending}
        />
        <TaskColumn
          title="In progress"
          hint="Currently being executed"
          tasks={grouped.inprogress}
        />
        <TaskColumn title="Done" hint="Completed" tasks={grouped.done} />
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
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

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#F7F8F4] border border-gray-200 p-6">
      <div className="text-xs font-extrabold text-gray-500 uppercase">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function PriorityChip({ p }: { p: TaskPriority }) {
  const cls =
    p === "High"
      ? "bg-red-100 text-red-800"
      : p === "Medium"
        ? "bg-orange-100 text-orange-800"
        : "bg-gray-100 text-gray-800";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${cls}`}>{p}</span>;
}

function TaskColumn({
  title,
  hint,
  tasks,
}: {
  title: string;
  hint: string;
  tasks: Task[];
}) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-extrabold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 font-semibold">{hint}</div>
        </div>
        <div className="text-sm font-extrabold text-gray-500">{tasks.length}</div>
      </div>

      <div className="mt-5 grid gap-4">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="font-extrabold text-gray-900">{t.title}</div>
              <PriorityChip p={t.priority} />
            </div>
            <div className="mt-2 text-sm text-gray-600 font-semibold">
              Due: {t.dueDate} • {t.zone}
            </div>
            {t.notes && <div className="mt-2 text-sm text-gray-700 font-semibold">{t.notes}</div>}

            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm font-extrabold text-gray-700">
                Status: <span className="text-gray-900">{t.status}</span>
              </div>
              <div className="text-xs text-gray-500 font-semibold">
                (Updated by worker in mobile app)
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-5 text-gray-600 font-semibold">
            No tasks here.
          </div>
        )}
      </div>
    </div>
  );
}
