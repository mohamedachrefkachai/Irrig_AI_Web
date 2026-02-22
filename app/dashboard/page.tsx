import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Farm Owner Dashboard</h1>
        <Link href="/dashboard/farms">
          <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-extrabold shadow">
            Manage Farms
          </button>
        </Link>
      </div>
    </main>
  );
}
