"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type AlertType = "warning" | "error" | "info" | "success";
type AlertStatus = "active" | "resolved" | "dismissed";

type Alert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  zone?: string;
  status: AlertStatus;
  timestamp: string;
  priority: "low" | "medium" | "high";
};

const demoAlerts: Alert[] = [
  {
    id: "1",
    type: "error",
    title: "Low Soil Moisture",
    message: "Zone A moisture level below threshold (15%). Immediate irrigation recommended.",
    zone: "Zone A",
    status: "active",
    timestamp: "2026-03-03T08:30:00",
    priority: "high",
  },
  {
    id: "2",
    type: "warning",
    title: "Sensor Malfunction",
    message: "Temperature sensor in Zone B not responding. Check hardware connection.",
    zone: "Zone B",
    status: "active",
    timestamp: "2026-03-03T07:15:00",
    priority: "medium",
  },
  {
    id: "3",
    type: "info",
    title: "Scheduled Maintenance",
    message: "Robot maintenance scheduled for tomorrow at 10:00 AM.",
    status: "active",
    timestamp: "2026-03-02T16:00:00",
    priority: "low",
  },
  {
    id: "4",
    type: "success",
    title: "Irrigation Complete",
    message: "Automated irrigation cycle completed successfully in all zones.",
    status: "resolved",
    timestamp: "2026-03-02T12:00:00",
    priority: "low",
  },
  {
    id: "5",
    type: "warning",
    title: "High Temperature",
    message: "Zone C temperature exceeded 35°C. Monitor plant stress levels.",
    zone: "Zone C",
    status: "dismissed",
    timestamp: "2026-03-01T14:30:00",
    priority: "medium",
  },
];

export default function Alerts() {
  const params = useParams();
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (filterStatus !== "all" && alert.status !== filterStatus) return false;
    if (filterType !== "all" && alert.type !== filterType) return false;
    return true;
  });

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "resolved" as AlertStatus } : a));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a));
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "error": return "🔴";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      case "success": return "✅";
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case "error": return "bg-red-50 border-red-200";
      case "warning": return "bg-yellow-50 border-yellow-200";
      case "info": return "bg-blue-50 border-blue-200";
      case "success": return "bg-green-50 border-green-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-gray-100 text-gray-700",
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-sm font-extrabold text-green-700">ALERTS & NOTIFICATIONS</div>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Farm Alert Center</h1>
        <p className="mt-2 text-gray-600 font-semibold">
          Monitor and manage all farm alerts and notifications
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-red-200 p-4">
          <div className="text-3xl font-extrabold text-red-600">
            {alerts.filter(a => a.status === "active" && a.type === "error").length}
          </div>
          <div className="text-sm font-semibold text-gray-600 mt-1">Active Errors</div>
        </div>
        <div className="rounded-2xl bg-white border border-yellow-200 p-4">
          <div className="text-3xl font-extrabold text-yellow-600">
            {alerts.filter(a => a.status === "active" && a.type === "warning").length}
          </div>
          <div className="text-sm font-semibold text-gray-600 mt-1">Warnings</div>
        </div>
        <div className="rounded-2xl bg-white border border-green-200 p-4">
          <div className="text-3xl font-extrabold text-green-600">
            {alerts.filter(a => a.status === "resolved").length}
          </div>
          <div className="text-sm font-semibold text-gray-600 mt-1">Resolved</div>
        </div>
        <div className="rounded-2xl bg-white border border-blue-200 p-4">
          <div className="text-3xl font-extrabold text-blue-600">
            {alerts.filter(a => a.status === "active" && a.type === "info").length}
          </div>
          <div className="text-sm font-semibold text-gray-600 mt-1">Info</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
            >
              <option value="all">All Types</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <div className="text-lg font-bold text-gray-900">No alerts found</div>
            <div className="text-gray-600 mt-2">Try adjusting your filters</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border-2 p-6 ${getAlertColor(alert.type)} transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{alert.title}</h3>
                      {alert.zone && (
                        <div className="text-xs font-semibold text-gray-500 mt-1">
                          📍 {alert.zone}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 font-semibold">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                    <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityBadge(alert.priority)}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-700">
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {alert.status === "active" && (
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="px-4 py-2 rounded-xl bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
