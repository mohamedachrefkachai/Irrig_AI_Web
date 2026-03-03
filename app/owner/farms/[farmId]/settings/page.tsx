"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function Settings() {
  const params = useParams();
  const [farmName, setFarmName] = useState("Olive Farm");
  const [farmLocation, setFarmLocation] = useState("Tunis, Tunisia");
  const [autoIrrigation, setAutoIrrigation] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [moistureThreshold, setMoistureThreshold] = useState(25);
  const [temperatureThreshold, setTemperatureThreshold] = useState(35);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="text-sm font-extrabold text-green-700">FARM SETTINGS</div>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">Configuration & Preferences</h1>
        <p className="mt-2 text-gray-600 font-semibold">
          Manage your farm settings and automation preferences
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2 text-green-800 font-bold">
            <span>✅</span>
            <span>Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">📝 Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Farm Name
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
              placeholder="Enter farm name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
              placeholder="Enter location"
            />
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">🤖 Automation Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
            <div>
              <div className="font-extrabold text-gray-900">Automatic Irrigation</div>
              <div className="text-sm text-gray-600 mt-1">
                Enable automatic irrigation based on soil moisture sensors
              </div>
            </div>
            <button
              onClick={() => setAutoIrrigation(!autoIrrigation)}
              className={`w-14 h-8 rounded-full transition ${
                autoIrrigation ? 'bg-green-600' : 'bg-gray-300'
              } relative`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  autoIrrigation ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div>
              <div className="font-extrabold text-gray-900">Alert System</div>
              <div className="text-sm text-gray-600 mt-1">
                Receive alerts for critical farm conditions
              </div>
            </div>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`w-14 h-8 rounded-full transition ${
                alertsEnabled ? 'bg-blue-600' : 'bg-gray-300'
              } relative`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  alertsEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div>
              <div className="font-extrabold text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-600 mt-1">
                Get updates and reports via email
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-14 h-8 rounded-full transition ${
                emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
              } relative`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  emailNotifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">⚙️ Threshold Settings</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Soil Moisture Threshold
              </label>
              <span className="text-lg font-extrabold text-green-700">{moistureThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={moistureThreshold}
              onChange={(e) => setMoistureThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 mt-1">
              Trigger irrigation when moisture falls below this level
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Temperature Alert Threshold
              </label>
              <span className="text-lg font-extrabold text-red-700">{temperatureThreshold}°C</span>
            </div>
            <input
              type="range"
              min="25"
              max="45"
              value={temperatureThreshold}
              onChange={(e) => setTemperatureThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 mt-1">
              Send alert when temperature exceeds this value
            </div>
          </div>
        </div>
      </div>

      {/* Irrigation Schedule */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">📅 Irrigation Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              defaultValue="06:00"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              defaultValue="20:00"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Frequency
            </label>
            <select className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-green-300">
              <option>Every 2 hours</option>
              <option>Every 4 hours</option>
              <option>Every 6 hours</option>
              <option>Twice daily</option>
              <option>Once daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-red-50 border-2 border-red-200 shadow p-6">
        <h2 className="text-xl font-extrabold text-red-900 mb-4">⚠️ Danger Zone</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white border border-red-200">
            <div className="font-extrabold text-gray-900">Reset All Sensors</div>
            <div className="text-sm text-gray-600 mt-1 mb-3">
              Clear all sensor data and recalibrate
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">
              Reset Sensors
            </button>
          </div>
          <div className="p-4 rounded-xl bg-white border border-red-200">
            <div className="font-extrabold text-gray-900">Delete Farm</div>
            <div className="text-sm text-gray-600 mt-1 mb-3">
              Permanently delete this farm and all associated data
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition">
              Delete Farm
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-8 py-4 rounded-xl bg-gray-200 text-gray-700 font-extrabold hover:bg-gray-300 transition">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-4 rounded-xl bg-green-700 text-white font-extrabold hover:bg-green-800 transition shadow-lg"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}
