import Link from "next/link";

export default function WorkerDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center p-10">
      
      {/* BIG WHITE CONTAINER */}
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-14">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👷 Worker Interface
            </h1>
            <p className="text-gray-500 mt-1">
              Daily tasks and field operations
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2 rounded-xl border hover:bg-gray-50 transition"
          >
            ← Home
          </Link>
        </div>

        {/* KPI CARDS */}
        <section className="grid gap-8 md:grid-cols-3 mb-14">

          <Kpi title="Tasks Today" value="5" gradient="from-blue-500 to-indigo-600" />
          <Kpi title="Trees to Check" value="12" gradient="from-green-500 to-emerald-600" />
          <Kpi title="Open Tickets" value="2" gradient="from-orange-400 to-yellow-500" />

        </section>

        {/* CONTENT GRID */}
        <section className="grid gap-10 md:grid-cols-2">

          {/* TASK LIST */}
          <div className="bg-gray-50 rounded-3xl p-10 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900">
              Today’s Tasks
            </h2>

            <ul className="mt-8 space-y-4">
              <Task text="Check Zone 1 dripline (Row A)" />
              <Task text="Verify Valve Zone 2 status" />
              <Task text="Refill robot water tank" />
              <Task text="Photo suspicious leaves (Row C)" />
            </ul>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-gray-50 rounded-3xl p-10 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>

            <div className="mt-8 flex flex-col gap-4">

              <button className="rounded-2xl bg-green-600 py-4 text-white font-medium hover:bg-green-700 transition">
                Mark Task Done
              </button>

              <button className="rounded-2xl border py-4 hover:bg-gray-100 transition">
                Report Issue
              </button>

              <button className="rounded-2xl border py-4 hover:bg-gray-100 transition">
                Upload Field Photo
              </button>

            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

function Kpi({
  title,
  value,
  gradient,
}: {
  title: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className={`rounded-3xl p-8 text-white shadow-xl bg-gradient-to-r ${gradient}`}>
      <p className="text-lg opacity-90">{title}</p>
      <p className="text-5xl font-bold mt-4">{value}</p>
    </div>
  );
}

function Task({ text }: { text: string }) {
  return (
    <li className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <span className="text-gray-700">{text}</span>
      <button className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-black transition">
        Done
      </button>
    </li>
  );
}
