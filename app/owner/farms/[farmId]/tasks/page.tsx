"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type TaskItem = {
  id: string;
  farm_id: string;
  worker: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  due_date?: string;
  created_at: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function StatusChip({ status }: { status: TaskItem["status"] }) {
  const cls =
    status === "DONE"
      ? "bg-green-100 text-green-800"
      : status === "IN_PROGRESS"
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-800";

  const label =
    status === "IN_PROGRESS" ? "In progress" : status === "DONE" ? "Done" : "Pending";

  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{label}</span>;
}

function PriorityChip({ priority }: { priority: TaskItem["priority"] }) {
  const cls =
    priority === "HIGH"
      ? "bg-red-100 text-red-800"
      : priority === "MEDIUM"
        ? "bg-orange-100 text-orange-800"
        : "bg-green-100 text-green-800";

  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{priority}</span>;
}

export default function FarmTasksPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"NOT_DONE" | "DONE">("NOT_DONE");

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch(`/api/owner/tasks/list?farm_id=${farmId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setTasks([]);
          return;
        }

        const data = await res.json();
        setTasks(data.tasks || []);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [farmId]);

  const notDone = useMemo(
    () => tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS"),
    [tasks]
  );
  const done = useMemo(() => tasks.filter((t) => t.status === "DONE"), [tasks]);
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
              Follow all tasks of this farm and assign new tasks quickly from Workers.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/owner/farms/${farmId}/workers`}
              className="px-5 py-2.5 rounded-xl font-extrabold border border-blue-200 bg-blue-100 text-blue-900 hover:bg-blue-200 transition"
            >
              👷 Go to Workers (Assign)
            </Link>
            <Link
              href="/owner/tasks"
              className="px-5 py-2.5 rounded-xl font-extrabold border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              📋 Global Tasks
            </Link>
          </div>
        </div>

        <div className="mt-5 flex gap-2 flex-wrap">
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

      <div className="rounded-3xl bg-white border border-gray-200 shadow p-7">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading tasks...</div>
        ) : (
          <div className="grid gap-4">
            {list.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="space-y-2">
                  <div className="font-extrabold text-gray-900 text-lg">{t.title}</div>
                  <div className="text-sm text-gray-600 font-semibold">
                    Due: {formatDate(t.due_date)}
                    {t.description ? ` • ${t.description}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityChip priority={t.priority} />
                    <StatusChip status={t.status} />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/owner/farms/${farmId}/workers`}
                    className="text-sm font-extrabold text-blue-800 hover:text-blue-900"
                  >
                    Assign to another worker →
                  </Link>
                  <div className="text-sm text-gray-700 font-semibold">
                    {t.worker.name} ({t.worker.email})
                  </div>
                </div>
              </div>
            ))}

            {list.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold">
                No tasks in this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
