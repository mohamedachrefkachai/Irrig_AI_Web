"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

type ReportData = {
  period: string;
  waterUsage: number;
  energyUsage: number;
  tasksCompleted: number;
  alerts: number;
  yield: number;
};

const demoReports: Record<ReportPeriod, ReportData[]> = {
  daily: [
    { period: "March 3", waterUsage: 1200, energyUsage: 45, tasksCompleted: 5, alerts: 2, yield: 0 },
    { period: "March 2", waterUsage: 1150, energyUsage: 42, tasksCompleted: 6, alerts: 1, yield: 0 },
    { period: "March 1", waterUsage: 1300, energyUsage: 48, tasksCompleted: 4, alerts: 3, yield: 0 },
  ],
  weekly: [
    { period: "Week 9", waterUsage: 8400, energyUsage: 315, tasksCompleted: 35, alerts: 8, yield: 520 },
    { period: "Week 8", waterUsage: 7800, energyUsage: 290, tasksCompleted: 32, alerts: 5, yield: 480 },
  ],
  monthly: [
    { period: "February 2026", waterUsage: 34500, energyUsage: 1280, tasksCompleted: 140, alerts: 22, yield: 2100 },
    { period: "January 2026", waterUsage: 32800, energyUsage: 1220, tasksCompleted: 135, alerts: 18, yield: 1950 },
  ],
  yearly: [
    { period: "2026", waterUsage: 67300, energyUsage: 2500, tasksCompleted: 275, alerts: 40, yield: 4050 },
    { period: "2025", waterUsage: 380000, energyUsage: 14200, tasksCompleted: 1680, alerts: 245, yield: 24500 },
  ],
};

export default function Reports() {
  const params = useParams();
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [selectedReport, setSelectedReport] = useState(0);

  const currentData = demoReports[period];
  const current = currentData[selectedReport];
  const previous = currentData[selectedReport + 1];

  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    previousValue 
  }: { 
    title: string; 
    value: number; 
    unit: string; 
    icon: string;
    previousValue?: number;
  }) => {
    const change = calculateChange(value, previousValue);
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-600">{title}</div>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-3xl font-extrabold text-gray-900">
          {value.toLocaleString()}
          <span className="text-lg text-gray-500 ml-1">{unit}</span>
        </div>
        {previousValue !== undefined && (
          <div className={`text-sm font-semibold mt-2 ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change.isPositive ? '↗' : '↘'} {change.value.toFixed(1)}% vs previous
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-sm font-extrabold text-green-700">ANALYTICS & REPORTS</div>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Farm Performance Reports</h1>
        <p className="mt-2 text-gray-600 font-semibold">
          Track your farm's performance metrics and analytics
        </p>
      </div>

      {/* Period Selector */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setSelectedReport(0);
              }}
              className={`px-6 py-3 rounded-xl font-extrabold transition ${
                period === p
                  ? 'bg-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {currentData.length > 1 && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Period
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
            >
              {currentData.map((data, idx) => (
                <option key={idx} value={idx}>
                  {data.period}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Currently Viewing */}
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
        <div className="text-sm font-semibold text-blue-900">
          📊 Currently viewing: <span className="font-extrabold">{current.period}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Water Usage"
          value={current.waterUsage}
          unit="L"
          icon="💧"
          previousValue={previous?.waterUsage}
        />
        <MetricCard
          title="Energy Consumption"
          value={current.energyUsage}
          unit="kWh"
          icon="⚡"
          previousValue={previous?.energyUsage}
        />
        <MetricCard
          title="Tasks Completed"
          value={current.tasksCompleted}
          unit="tasks"
          icon="✅"
          previousValue={previous?.tasksCompleted}
        />
        <MetricCard
          title="Active Alerts"
          value={current.alerts}
          unit="alerts"
          icon="🔔"
          previousValue={previous?.alerts}
        />
        <MetricCard
          title="Estimated Yield"
          value={current.yield}
          unit="kg"
          icon="🌾"
          previousValue={previous?.yield}
        />
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow p-6">
          <div className="text-sm font-semibold text-green-900 mb-3">Efficiency Score</div>
          <div className="text-4xl font-extrabold text-green-700">
            {Math.min(Math.round((current.tasksCompleted / (current.alerts + 1)) * 10), 100)}
            <span className="text-lg text-green-600 ml-1">%</span>
          </div>
          <div className="text-sm font-semibold text-green-700 mt-2">
            Based on tasks vs alerts ratio
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">📈 Key Insights</h2>
        <div className="space-y-3">
          {previous && (
            <>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="font-semibold text-blue-900">
                  💧 Water usage {calculateChange(current.waterUsage, previous.waterUsage).isPositive ? 'increased' : 'decreased'} by{' '}
                  {calculateChange(current.waterUsage, previous.waterUsage).value.toFixed(1)}% compared to previous period
                </div>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="font-semibold text-green-900">
                  ✅ Task completion rate is{' '}
                  {calculateChange(current.tasksCompleted, previous.tasksCompleted).isPositive ? 'improving' : 'declining'}
                </div>
              </div>
              {current.alerts < previous.alerts && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="font-semibold text-green-900">
                    🎉 Great news! Alerts decreased by {calculateChange(current.alerts, previous.alerts).value.toFixed(0)}%
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">📥 Export Reports</h2>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-green-700 text-white font-extrabold hover:bg-green-800 transition shadow">
            Export as PDF
          </button>
          <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition shadow">
            Export as CSV
          </button>
          <button className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-extrabold hover:bg-gray-300 transition">
            Send via Email
          </button>
        </div>
      </div>
    </div>
  );
}
