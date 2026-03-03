"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  farm_id: string;
  worker: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  due_date: string | null;
  created_at: string;
};

type Farm = {
  _id: string;
  name: string;
  location: string;
};

type Worker = {
  id: string;
  full_name: string;
  email: string;
  farm_id: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Filter states
  const [filterFarm, setFilterFarm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ownerId = localStorage.getItem("owner_id");

      // Load farms
      const farmsRes = await fetch("/api/dashboard/farms", {
        credentials: "include",
      });
      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        if (Array.isArray(farmsData)) {
          setFarms(farmsData);
        } else {
          setFarms(farmsData.farms || []);
        }
      }

      // Load workers
      const workersUrl = ownerId
        ? `/api/owner/workers/list?owner_id=${ownerId}`
        : "/api/owner/workers/list";

      const workersRes = await fetch(workersUrl, {
        credentials: "include",
      });
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setWorkers(workersData.workers || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const loadTasksForFarm = async (farmId: string) => {
    if (!farmId) {
      setTasks([]);
      return;
    }

    try {
      const res = await fetch(`/api/owner/tasks/list?farm_id=${farmId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  useEffect(() => {
    if (filterFarm) {
      loadTasksForFarm(filterFarm);
    } else {
      setTasks([]);
    }
  }, [filterFarm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFarm || !selectedWorker || !taskTitle) {
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
          farm_id: selectedFarm,
          worker_id: selectedWorker,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          due_date: taskDueDate || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Task assigned successfully!" });
        
        // Reset form
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("MEDIUM");
        setTaskDueDate("");
        setSelectedWorker("");
        
        // Reload tasks if viewing the same farm
        if (filterFarm === selectedFarm) {
          loadTasksForFarm(selectedFarm);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create task" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const getWorkersForSelectedFarm = () => {
    if (!selectedFarm) return [];
    return workers.filter((w) => String(w.farm_id) === String(selectedFarm));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false;
    return true;
  });

  const priorityColors = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };

  const statusColors = {
    TODO: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    DONE: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-600 mt-2">
          Assign tasks to workers and track their progress
        </p>
      </div>

      {/* Create Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Assign New Task</h2>
        
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Farm <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFarm}
                onChange={(e) => {
                  setSelectedFarm(e.target.value);
                  setSelectedWorker("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choose Farm --</option>
                {farms.map((farm) => (
                  <option key={farm._id} value={farm._id}>
                    {farm.name} ({farm.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Worker Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Worker <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedFarm}
              >
                <option value="">-- Choose Worker --</option>
                {getWorkersForSelectedFarm().map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name} ({worker.email})
                  </option>
                ))}
              </select>
              {selectedFarm && getWorkersForSelectedFarm().length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No workers available for this farm
                </p>
              )}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Check irrigation system in Zone A"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional: Add more details about the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "Assigning Task..." : "Assign Task to Worker"}
          </button>
        </form>
      </div>

      {/* View Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">All Tasks</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Farm
            </label>
            <select
              value={filterFarm}
              onChange={(e) => setFilterFarm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select farm to view tasks --</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {!filterFarm ? (
          <div className="text-center py-12 text-gray-500">
            Select a farm to view its tasks
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tasks found for this farm
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>
                        👤 <strong>{task.worker.name}</strong>
                      </span>
                      <span>📧 {task.worker.email}</span>
                      {task.due_date && (
                        <span>
                          📅 Due:{" "}
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[task.status]
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
