"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Tree = {
  _id: string;
  tree_code: string;
  row_number: number;
  index_in_row: number;
  health_status: "OK" | "STRESS" | "DISEASE";
  last_seen_at?: string;
};

type Zone = {
  _id: string;
  name: string;
  width: number;
  length: number;
};

export default function ZoneTreesPage() {
  const { farmId, zoneId } = useParams<{ farmId: string; zoneId: string }>();
  const [zone, setZone] = useState<Zone | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"single" | "bulk">("single");
  
  // Single tree form
  const [treeCode, setTreeCode] = useState("");
  const [rowNumber, setRowNumber] = useState(0);
  const [indexInRow, setIndexInRow] = useState(0);
  const [healthStatus, setHealthStatus] = useState<"OK" | "STRESS" | "DISEASE">("OK");

  // Bulk add form
  const [bulkRowNumber, setBulkRowNumber] = useState(0);
  const [bulkTreeCount, setBulkTreeCount] = useState(10);
  const [bulkCodePrefix, setBulkCodePrefix] = useState("T");
  const [bulkHealthStatus, setBulkHealthStatus] = useState<"OK" | "STRESS" | "DISEASE">("OK");
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch zone details
        const zoneRes = await fetch(`/api/dashboard/farms/${farmId}/zones/${zoneId}`);
        const zoneData = await zoneRes.json();
        setZone(zoneData);

        // Fetch trees
        const treesRes = await fetch(`/api/dashboard/farms/${farmId}/zones/${zoneId}/trees`);
        const treesData = await treesRes.json();
        setTrees(treesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [farmId, zoneId]);

  const handleAddTree = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treeCode.trim()) {
      alert("Please enter a tree code");
      return;
    }

    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones/${zoneId}/trees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tree_code: treeCode,
          row_number: rowNumber,
          index_in_row: indexInRow,
          health_status: healthStatus,
        }),
      });

      if (res.ok) {
        const newTree = await res.json();
        setTrees([...trees, newTree]);
        // Reset form
        setTreeCode("");
        setRowNumber(0);
        setIndexInRow(0);
        setHealthStatus("OK");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding tree:", error);
      alert("Failed to add tree");
    }
  };

  const handleAddTreesBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkTreeCount <= 0) {
      alert("Please enter a valid tree count");
      return;
    }

    if (!zone) {
      alert("Zone data not loaded");
      return;
    }

    setBulkLoading(true);
    try {
      // Calculate spacing: 5m between trees
      const TREE_SPACING = 5; // meters
      const treesPerRow = Math.floor(zone.width / TREE_SPACING);

      if (treesPerRow === 0) {
        alert(`Zone width ${zone.width}m is too small. Minimum 5m needed.`);
        setBulkLoading(false);
        return;
      }

      const treesData = [];
      
      for (let i = 0; i < bulkTreeCount; i++) {
        const rowOffset = Math.floor(i / treesPerRow); // Which row
        const colOffset = i % treesPerRow; // Which column in that row
        const treeNum = String(i + 1).padStart(3, "0");

        treesData.push({
          tree_code: `${bulkCodePrefix}${treeNum}`,
          row_number: bulkRowNumber + rowOffset,
          index_in_row: colOffset,
          health_status: bulkHealthStatus,
        });
      }

      // Send bulk request
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones/${zoneId}/trees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treesData),
      });

      if (res.ok) {
        const newTrees = await res.json();
        setTrees([...trees, ...newTrees]);
        // Reset form
        setBulkRowNumber(0);
        setBulkTreeCount(10);
        setBulkCodePrefix("T");
        setBulkHealthStatus("OK");
        setShowForm(false);
        alert(`✓ Successfully added ${newTrees.length} trees in ${Math.ceil(newTrees.length / treesPerRow)} rows!`);
      } else {
        alert("Failed to add trees");
      }
    } catch (error) {
      console.error("Error adding trees:", error);
      alert("Failed to add trees");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteTree = async (treeId: string) => {
    if (!window.confirm("Delete this tree?")) return;

    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones/${zoneId}/trees`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree_id: treeId }),
      });

      if (res.ok) {
        setTrees(trees.filter((t) => t._id !== treeId));
      }
    } catch (error) {
      console.error("Error deleting tree:", error);
      alert("Failed to delete tree");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  if (!zone) {
    return <div className="p-8 text-red-600">Zone not found</div>;
  }

  const healthColors = {
    "OK": "bg-green-100 text-green-800",
    "STRESS": "bg-yellow-100 text-yellow-800",
    "DISEASE": "bg-red-100 text-red-800",
  };

  return (
    <div className="grid gap-6 p-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-green-700">ZONE TREES</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
              {zone.name}
            </h1>
            <p className="mt-2 text-gray-600 font-semibold">
              Manage trees in this zone: {zone.width}m × {zone.length}m
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs font-bold text-blue-700 uppercase">Trees/Row (5m spacing)</div>
                <div className="text-lg font-extrabold text-blue-900">{Math.floor(zone.width / 5)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs font-bold text-green-700 uppercase">Max Rows</div>
                <div className="text-lg font-extrabold text-green-900">{Math.floor(zone.length / 5)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs font-bold text-purple-700 uppercase">Total Area</div>
                <div className="text-lg font-extrabold text-purple-900">{zone.width * zone.length} m²</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs font-bold text-orange-700 uppercase">Current Trees</div>
                <div className="text-lg font-extrabold text-orange-900">{trees.length}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/owner/farms/${farmId}`}
              className="border border-gray-200 bg-white hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
            >
              Back
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-700 hover:bg-green-800 transition text-white px-5 py-2.5 rounded-xl font-extrabold"
            >
              ➕ Add Trees
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">Add Trees</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setFormMode("single")}
              className={`px-4 py-3 font-bold border-b-2 transition ${
                formMode === "single"
                  ? "border-green-700 text-green-700"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Single Tree
            </button>
            <button
              onClick={() => setFormMode("bulk")}
              className={`px-4 py-3 font-bold border-b-2 transition ${
                formMode === "bulk"
                  ? "border-green-700 text-green-700"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Add (Row)
            </button>
          </div>

          {/* Single Tree Form */}
          {formMode === "single" && (
            <form onSubmit={handleAddTree} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Tree Code
                </label>
                <input
                  type="text"
                  value={treeCode}
                  onChange={(e) => setTreeCode(e.target.value)}
                  placeholder="E.g., T001, OLIVE-A1"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Row Number
                </label>
                <input
                  type="number"
                  value={rowNumber}
                  onChange={(e) => setRowNumber(Number(e.target.value))}
                  min="0"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                />
                <div className="text-xs text-gray-500 mt-1">Each row = 5m vertical spacing</div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Index in Row
                </label>
                <input
                  type="number"
                  value={indexInRow}
                  onChange={(e) => setIndexInRow(Number(e.target.value))}
                  min="0"
                  max={Math.floor((zone?.width || 0) / 5) - 1}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                />
                <div className="text-xs text-gray-500 mt-1">Max: {Math.floor((zone?.width || 0) / 5) - 1} (zone allows {Math.floor((zone?.width || 0) / 5)} trees/row at 5m spacing)</div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Health Status
                </label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value as "OK" | "STRESS" | "DISEASE")}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                >
                  <option value="OK">✓ OK</option>
                  <option value="STRESS">⚠️ STRESS</option>
                  <option value="DISEASE">🔴 DISEASE</option>
                </select>
              </div>

              <div className="md:col-span-2 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-900">
                  📏 Position will be: ({indexInRow * 5}m, {rowNumber * 5}m) on zone grid
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Trees are spaced 5m apart on a grid. Row 0 = 0-5m, Row 1 = 5-10m, etc.
                </p>
              </div>

              <div className="md:col-span-2 flex gap-3 flex-wrap">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 transition text-white px-5 py-2.5 rounded-xl font-extrabold"
                >
                  Add Tree
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-200 hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Bulk Add Form */}
          {formMode === "bulk" && (
            <form onSubmit={handleAddTreesBulk} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Starting Row (0-indexed)
                </label>
                <input
                  type="number"
                  value={bulkRowNumber}
                  onChange={(e) => setBulkRowNumber(Number(e.target.value))}
                  min="0"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                />
                <div className="text-xs text-gray-500 mt-1">Each row spans 5m vertically</div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Number of Trees
                </label>
                <input
                  type="number"
                  value={bulkTreeCount}
                  onChange={(e) => setBulkTreeCount(Number(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Code Prefix
                </label>
                <input
                  type="text"
                  value={bulkCodePrefix}
                  onChange={(e) => setBulkCodePrefix(e.target.value)}
                  placeholder="E.g., T, OLIVE, A"
                  maxLength="5"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">
                  Health Status
                </label>
                <select
                  value={bulkHealthStatus}
                  onChange={(e) => setBulkHealthStatus(e.target.value as "OK" | "STRESS" | "DISEASE")}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                >
                  <option value="OK">✓ OK</option>
                  <option value="STRESS">⚠️ STRESS</option>
                  <option value="DISEASE">🔴 DISEASE</option>
                </select>
              </div>

              <div className="md:col-span-2 bg-green-50 border-2 border-green-300 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  📊 <strong>Tree Spacing Structure (5m apart):</strong>
                </p>
                <p className="text-xs text-green-800">
                  • Trees per row: <span className="font-bold text-green-700">{Math.ceil(zone?.width ? zone.width / 5 : 0)}</span> (zone width {zone?.width}m ÷ 5m)
                </p>
                <p className="text-xs text-green-800 mt-1">
                  • Will create: <span className="font-bold text-green-700">{bulkCodePrefix}001</span> to <span className="font-bold text-green-700">{bulkCodePrefix}{String(bulkTreeCount).padStart(3, "0")}</span>
                </p>
                <p className="text-xs text-green-800 mt-1">
                  • Positions auto-calculated (5m × 5m grid)
                </p>
              </div>

              <div className="md:col-span-2 flex gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={bulkLoading}
                  className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 transition text-white px-5 py-2.5 rounded-xl font-extrabold"
                >
                  {bulkLoading ? "Adding..." : `Add ${bulkTreeCount} Trees`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-200 hover:bg-gray-50 transition px-5 py-2.5 rounded-xl font-extrabold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Trees List */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="text-xl font-extrabold text-gray-900">
            📍 Trees ({trees.length})
          </h2>
          <div className="text-sm font-semibold text-gray-600">
            {trees.length > 0 && `Capacity: ${Math.floor(zone.width / 5)} × ${Math.floor(zone.length / 5)} = ${Math.floor(zone.width / 5) * Math.floor(zone.length / 5)} max trees`}
          </div>
        </div>

        {trees.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-[#F7F8F4] p-6 text-gray-700 font-semibold text-center">
            <p>🌳 No trees in this zone yet.</p>
            <p className="text-sm text-gray-600 mt-2">Use "Add Trees" to populate the zone with a 5m × 5m grid structure.</p>
          </div>
        ) : (
          <>
            {/* Tree Grid Visualization */}
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-300">
              <h3 className="font-bold text-green-900 mb-3">🗺️ Zone Layout (5m × 5m Grid)</h3>
              <svg
                width="100%"
                height="300"
                viewBox={`0 0 ${Math.max(200, zone.width * 2)} ${Math.max(150, zone.length * 2)}`}
                style={{ background: "#f0fdf4", borderRadius: 8 }}
              >
                {/* Grid lines - 5m spacing */}
                {Array.from({ length: Math.floor(zone.width / 5) + 1 }).map((_, i) => (
                  <line key={`vline-${i}`} x1={i * 10} y1="0" x2={i * 10} y2={Math.floor(zone.length / 5) * 10} stroke="#dbeafe" strokeWidth="1" />
                ))}
                {Array.from({ length: Math.floor(zone.length / 5) + 1 }).map((_, i) => (
                  <line key={`hline-${i}`} x1="0" y1={i * 10} x2={Math.floor(zone.width / 5) * 10} y2={i * 10} stroke="#dbeafe" strokeWidth="1" />
                ))}

                {/* Trees */}
                {trees.map((tree) => {
                  const x = (tree.index_in_row + 0.5) * (zone.width / Math.floor(zone.width / 5));
                  const y = (tree.row_number + 0.5) * (zone.length / Math.floor(zone.length / 5));
                  const healthColors: Record<string, string> = {
                    "OK": "#10b981",
                    "STRESS": "#f59e0b",
                    "DISEASE": "#ef4444"
                  };
                  return (
                    <g key={tree._id} title={tree.tree_code}>
                      <circle cx={x * 2} cy={y * 2} r="4" fill={healthColors[tree.health_status]} opacity="0.8" />
                    </g>
                  );
                })}
              </svg>
              <div className="flex gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div>OK</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>STRESS</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div>DISEASE</div>
              </div>
            </div>

            {/* Trees Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-gray-700">Code</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-700">Position</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-700">Coordinates</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-700">Health</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trees.map((tree) => {
                    const healthColors: Record<string, string> = {
                      "OK": "bg-green-100 text-green-800",
                      "STRESS": "bg-yellow-100 text-yellow-800",
                      "DISEASE": "bg-red-100 text-red-800"
                    };
                    return (
                      <tr key={tree._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-bold text-gray-900">{tree.tree_code}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Row {tree.row_number}, Index {tree.index_in_row}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ({tree.index_in_row * 5}m, {tree.row_number * 5}m)
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${healthColors[tree.health_status]}`}>
                            {tree.health_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteTree(tree._id)}
                            className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded-lg font-bold text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
