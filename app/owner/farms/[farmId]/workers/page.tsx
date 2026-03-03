"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Worker = {
  id: string;
  full_name: string;
  email: string;
  farm_id: string;
  farm_name?: string;
  status: string;
};

export default function WorkersPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  
  // Task modal states
  const [taskOpen, setTaskOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadWorkers();
  }, [farmId]);

  const loadWorkers = async () => {
    try {
      const ownerId = localStorage.getItem("owner_id");
      if (!ownerId) {
        setWorkers([]);
        return;
      }

      const res = await fetch(
        `/api/owner/workers/list?owner_id=${ownerId}&farm_id=${farmId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        const farmWorkers = data.workers || [];
        setWorkers(farmWorkers);
      }
    } catch (error) {
      console.error("Error loading workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const openTaskModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setTaskDueDate("");
    setMessage(null);
    setTaskOpen(true);
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorker || !taskTitle) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/owner/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          farm_id: farmId,
          worker_id: selectedWorker.id,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          due_date: taskDueDate || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Task assigned successfully!" });
        setTimeout(() => {
          setTaskOpen(false);
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to assign task" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorkers = workers.filter((w) =>
    w.full_name.toLowerCase().includes(query.toLowerCase()) ||
    w.email.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-gray-500">Loading workers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-sm font-extrabold text-green-700">WORKERS</div>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Team Management</h1>
        <p className="mt-2 text-gray-600 font-semibold">
          Manage workers and assign tasks for this farm
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-600">Total Workers</div>
            <span className="text-3xl">👷</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">{workers.length}</div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-600">Active</div>
            <span className="text-3xl">✅</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            {workers.filter(w => w.status === "active").length}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-600">Tasks</div>
            <span className="text-3xl">📋</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">0</div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-600">Invited</div>
            <span className="text-3xl">🟣</span>
          </div>
          <div className="text-4xl font-extrabold text-gray-900">0</div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
        />
      </div>

      {/* Workers List */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Workers List</h2>
          <div className="text-sm text-gray-600 font-semibold">
            Showing {filteredWorkers.length} / {workers.length}
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {workers.length === 0
              ? "No workers in this farm yet. Add workers from the main Workers page."
              : "No workers match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700">
                        {worker.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">
                          {worker.full_name}
                        </h3>
                        <div className="text-sm text-gray-600">{worker.email}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        worker.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {worker.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Farm: {worker.farm_name || "Current Farm"}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openTaskModal(worker)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                      >
                        📋 Assign Task
                      </button>
                      <button className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition font-bold">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Assignment Modal */}
      {taskOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm font-extrabold text-green-700">ASSIGN TASK</div>
                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
                  Assign Task to {selectedWorker.full_name}
                </h3>
                <p className="mt-2 text-gray-600 font-semibold">
                  Create a new task for this worker
                </p>
              </div>
              <button
                onClick={() => setTaskOpen(false)}
                className="h-10 w-10 rounded-2xl border border-gray-200 hover:bg-gray-50 transition font-extrabold"
              >
                ✕
              </button>
            </div>

            {message && (
              <div
                className={`mb-4 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
                  placeholder="e.g., Check irrigation system in Zone A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
                  rows={3}
                  placeholder="Optional: Add more details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-700 text-white py-3 rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
                >
                  {submitting ? "Assigning..." : "Assign Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setTaskOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition font-extrabold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
