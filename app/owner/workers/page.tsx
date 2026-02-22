import Link from "next/link";

const workers = [
  { id: "1", name: "Ahmed", role: "Technician", status: "Active" },
  { id: "2", name: "Sara", role: "Supervisor", status: "Active" },
  { id: "3", name: "Youssef", role: "Operator", status: "Offline" },
];

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
      
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👷 Workers
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all your farm workers
            </p>
          </div>

          <Link
            href="/owner"
            className="px-5 py-2 rounded-xl border hover:bg-gray-50 transition"
          >
            ← Back
          </Link>
        </div>

        {/* Workers List */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-gray-50 rounded-3xl p-8 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {worker.name}
              </h3>

              <p className="text-gray-600 mt-2">
                Role: {worker.role}
              </p>

              <span
                className={`inline-block mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                  worker.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {worker.status}
              </span>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  Assign Task
                </button>

                <button className="px-4 py-2 border rounded-xl hover:bg-gray-100 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}

        </div>

      </div>
    </main>
  );
}
