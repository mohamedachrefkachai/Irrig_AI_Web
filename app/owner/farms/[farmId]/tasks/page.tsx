"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
};

type Worker = {
  id: string;
  name: string;
  photo: string;
  tasks: Task[];
};

const demoWorkers: Record<string, Worker[]> = {
  "olive-tunis": [
    {
      id: "w1",
      name: "Ahmed Ben Ali",
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
          title: "Report anomalies",
          priority: "Low",
          status: "Done",
          dueDate: "2026-02-19",
          zone: "Zone A",
          createdAt: "2026-02-18",
        },
      ],
    },
    {
      id: "w2",
      name: "Sami K.",
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
  ],
};

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

export default function FarmTasksPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const workers = demoWorkers[farmId] ?? [];

  const allTasks = useMemo(() => {
    return workers.flatMap((w) =>
      w.tasks.map((t) => ({
        ...t,
        workerId: w.id,
        workerName: w.name,
        workerPhoto: w.photo,
      }))
    );
  }, [workers]);

  const [tab, setTab] = useState<"NOT_DONE" | "DONE">("NOT_DONE");

  const notDone = allTasks.filter((t) => t.status !== "Done");
  const done = allTasks.filter((t) => t.status === "Done");
  const list = tab === "DONE" ? done : notDone;

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm font-extrabold text-green-700">FARM TASKS</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              Global Task Tracking
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Track tasks across all workers. Click a worker to open their profile.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTab("NOT_DONE")}
              className={`px-5 py-2.5 rounded-xl font-extrabold transition ${
                tab === "NOT_DONE"
                  ? "bg-gray-900 text-white shadow"
                  : "border border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              Not done ({notDone.length})
            </button>
            <button
              onClick={() => setTab("DONE")}
              className={`px-5 py-2.5 rounded-xl font-extrabold transition ${
                tab === "DONE"
                  ? "bg-green-700 text-white shadow"
                  : "border border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              Done ({done.length})
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
        <div className="grid gap-4">
          {list.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 flex items-start justify-between gap-4 flex-wrap"
            >
              <div>
                <div className="font-extrabold text-gray-900 text-lg">{t.title}</div>
                <div className="mt-1 text-sm text-gray-600 font-semibold">
                  Due: {t.dueDate} • {t.zone} • Priority: {t.priority} • Status: {t.status}
                </div>
                <div className="mt-2">
                  <RiskChip dueDate={t.dueDate} />
                </div>
              </div>

              <Link href={`/owner/farms/${farmId}/workers/${t.workerId}`} className="flex items-center gap-3">
                <img
                  src={t.workerPhoto}
                  className="h-10 w-10 rounded-2xl border border-gray-200 object-cover"
                  alt="worker"
                />
                <div className="text-sm font-extrabold text-green-800 hover:text-green-900">
                  {t.workerName} →
                </div>
              </Link>
            </div>
          ))}

          {list.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
              No tasks in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
