"use client";

export default function AlertsPage() {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
      <div className="text-sm font-extrabold text-green-700">ALERTS</div>
      <h1 className="mt-2 text-2xl font-extrabold text-gray-900">All Alerts</h1>
      <p className="mt-2 text-gray-600 font-semibold">
        Static demo: filters + status will become dynamic with DB.
      </p>
    </div>
  );
}
