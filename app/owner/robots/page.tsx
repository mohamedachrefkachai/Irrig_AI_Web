import Link from "next/link";

const robots = [
  { id: "1", name: "Robot Alpha", status: "Online", battery: 78, location: "Zone 1" },
  { id: "2", name: "Robot Beta", status: "Charging", battery: 32, location: "Station" },
  { id: "3", name: "Robot Gamma", status: "Offline", battery: 0, location: "Unknown" },
];

export default function RobotsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
      
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 Robots
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor and manage all your robots
            </p>
          </div>

          <Link
            href="/owner"
            className="px-5 py-2 rounded-xl border hover:bg-gray-50 transition"
          >
            ← Back
          </Link>
        </div>

        {/* Robots List */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {robots.map((robot) => (
            <div
              key={robot.id}
              className="bg-gray-50 rounded-3xl p-8 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {robot.name}
              </h3>

              <p className="text-gray-600 mt-2">
                Location: {robot.location}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    robot.status === "Online"
                      ? "bg-green-100 text-green-700"
                      : robot.status === "Charging"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {robot.status}
                </span>

                <span className="text-sm text-gray-700 font-medium">
                  🔋 {robot.battery}%
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
                  Send Mission
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
