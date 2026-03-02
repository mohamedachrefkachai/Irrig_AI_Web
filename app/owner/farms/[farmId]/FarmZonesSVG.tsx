"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FarmZonesSVG() {
  const { farmId } = useParams();
  const [farm, setFarm] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [zonesTrees, setZonesTrees] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const farmRes = await fetch(`/api/dashboard/farms/${farmId}`);
      const farmData = await farmRes.json();
      const zonesRes = await fetch(`/api/dashboard/farms/${farmId}/zones`);
      const zonesData = await zonesRes.json();
      setFarm(farmData);
      setZones(zonesData);

      // Fetch trees for each zone
      const treesMap: Record<string, any[]> = {};
      for (const zone of zonesData) {
        const treesRes = await fetch(`/api/dashboard/farms/${farmId}/zones/${zone._id}/trees`);
        const treesData = await treesRes.json();
        treesMap[zone._id] = treesData;
      }
      setZonesTrees(treesMap);
      setLoading(false);
    }
    fetchData();
  }, [farmId]);

  if (loading) return <div className="text-gray-500 p-8">Loading zones...</div>;
  if (!farm) return <div className="text-red-600 p-8">Farm not found.</div>;

  // SVG frame
  const width = farm.longueur || 100;
  const height = farm.largeur || 60;
  const svgWidth = 600;
  const svgHeight = 360;
  const frameX = 20;
  const frameY = 20;
  const frameW = svgWidth - 2 * frameX;
  const frameH = svgHeight - 2 * frameY;
  const scale = Math.min(frameW / width, frameH / height, 1);
  const farmW = width * scale;
  const farmH = height * scale;
  const farmX = frameX + (frameW - farmW) / 2;
  const farmY = frameY + (frameH - farmH) / 2;

  // Use stored x, y coordinates from database instead of dynamic packing
  const zoneRects = zones.map((zone) => {
    const zX = farmX + (zone.x || 0) * scale; // Convert meters to SVG pixels
    const zY = farmY + (zone.y || 0) * scale;
    const zW = (zone.width || 10) * scale;
    const zH = (zone.length || 10) * scale;
    return {
      ...zone,
      x: zX,
      y: zY,
      w: zW,
      h: zH,
    };
  });

  // Calcul de la surface utilisée et restante
  const totalArea = width * height;
  const usedArea = zones.reduce((sum, z) => sum + (z.width * z.length), 0);
  const remainingArea = totalArea - usedArea;

  // Largeur et longueur restantes maximales (approche simple : on suppose une nouvelle zone qui occupe toute la largeur ou toute la longueur restante)
  // Largeur restante = largeur totale - somme des largeurs sur la dernière ligne
  // Longueur restante = longueur totale - somme des longueurs sur toutes les lignes
  // Ici, on affiche la largeur et longueur max possible pour une nouvelle zone rectangulaire
  let usedWidthMax = 0;
  let usedLengthMax = 0;
  if (zones.length > 0) {
    // Largeur utilisée sur la dernière ligne
    let rowWidth = 0;
    let maxRowHeight = 0;
    let totalHeight = 0;
    for (const zone of zones) {
      if (rowWidth + zone.width > width) {
        totalHeight += maxRowHeight;
        rowWidth = 0;
        maxRowHeight = 0;
      }
      rowWidth += zone.width;
      if (zone.length > maxRowHeight) maxRowHeight = zone.length;
    }
    usedWidthMax = rowWidth;
    usedLengthMax = totalHeight + maxRowHeight;
  }
  const remainingWidthMax = Math.max(width - usedWidthMax, 0);
  const remainingLengthMax = Math.max(height - usedLengthMax, 0);

  return (
    <div className="flex flex-col items-center">
      <svg width={svgWidth} height={svgHeight} style={{ background: "#F7F8F4", borderRadius: 24, border: "3px solid #059669" }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="2" />
          </pattern>
        </defs>
        <rect x={frameX} y={frameY} width={frameW} height={frameH} fill="url(#grid)" rx={24} />
        <rect x={farmX} y={farmY} width={farmW} height={farmH} fill="#A7F3D0" stroke="#059669" strokeWidth={6} rx={18} />
        {zoneRects.map((z, i) => (
          <g key={z._id} onClick={() => setSelectedZone(z)} style={{ cursor: "pointer" }}>
            <rect
              x={z.x + 8}
              y={z.y + 8}
              width={z.w - 16}
              height={z.h - 16}
              fill="#FDE68A"
              stroke="#F59E42"
              strokeWidth={4}
              rx={10}
              opacity={0.95}
              style={{ 
                transition: "all 0.2s ease",
                filter: "drop-shadow(0 0 0 rgba(0,0,0,0))"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.15))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.95";
                e.currentTarget.style.filter = "drop-shadow(0 0 0 rgba(0,0,0,0))";
              }}
            />
            <text
              x={z.x + z.w / 2}
              y={z.y + z.h / 2}
              textAnchor="middle"
              fontSize={18}
              fill="#B45309"
              fontWeight="bold"
              alignmentBaseline="middle"
              style={{ pointerEvents: "none" }}
            >
              {z.name}
            </text>
            {/* Render trees in this zone */}
            {zonesTrees[z._id] && zonesTrees[z._id].map((tree: any, treeIdx: number) => {
              // Calculate tree position based on row_number and index_in_row
              const maxTreesPerRow = Math.max(
                ...((zonesTrees[z._id] || []).map((t: any) => (t.index_in_row || 0) + 1) || [1])
              );
              const maxRows = Math.max(
                ...((zonesTrees[z._id] || []).map((t: any) => (t.row_number || 0) + 1) || [1])
              );

              const zoneInnerW = z.w - 16;
              const zoneInnerH = z.h - 16;
              const treeSize = Math.min(zoneInnerW / (maxTreesPerRow || 1), zoneInnerH / (maxRows || 1), 12);

              const treeX = z.x + 8 + ((tree.index_in_row || 0) + 0.5) * (zoneInnerW / (maxTreesPerRow || 1));
              const treeY = z.y + 8 + ((tree.row_number || 0) + 0.5) * (zoneInnerH / (maxRows || 1));

              // Color based on health status
              const healthColors: Record<string, string> = {
                "OK": "#10b981",
                "STRESS": "#f59e0b",
                "DISEASE": "#ef4444"
              };
              const treeColor = healthColors[tree.health_status] || "#10b981";

              return (
                <g key={tree._id} style={{ pointerEvents: "none" }}>
                  <circle
                    cx={treeX}
                    cy={treeY}
                    r={treeSize / 2}
                    fill={treeColor}
                    stroke="#047857"
                    strokeWidth={1}
                    opacity={0.8}
                  />
                  <text
                    x={treeX}
                    y={treeY}
                    textAnchor="middle"
                    fontSize={Math.max(7, treeSize / 3)}
                    fill="white"
                    fontWeight="bold"
                    alignmentBaseline="middle"
                    pointerEvents="none"
                  >
                    {tree.tree_code ? tree.tree_code.charAt(0) : "T"}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={farmX + farmW / 2} y={farmY + farmH + 40} textAnchor="middle" fontSize={22} fill="#059669">{width}m x {height}m</text>
      </svg>
      <div className="mt-2 text-green-900 text-lg font-bold">
        Superficie restante : {remainingArea > 0 ? remainingArea : 0} m² / {totalArea} m²<br />
        Largeur restante max : {remainingWidthMax} m &nbsp;|&nbsp; Longueur restante max : {remainingLengthMax} m
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {zones.map((z) => (
          <div key={z._id} className="rounded-2xl border border-yellow-300 bg-white p-5 shadow hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedZone(z)}>
            <div className="font-extrabold text-lg text-yellow-900 mb-1">{z.name}</div>
            <div className="text-gray-700">Crop: {z.crop_type || "-"}</div>
            <div className="text-gray-700">Mode: {z.mode}</div>
            <div className="text-gray-700">Moisture Threshold: {z.moisture_threshold ?? "-"}</div>
            <div className="text-gray-700">Width: {z.width} m</div>
            <div className="text-gray-700">Length: {z.length} m</div>
            <div className="text-gray-500 text-xs mt-2">Created: {z.created_at ? new Date(z.created_at).toLocaleString() : "-"}</div>
            <div className="flex gap-2 mt-3">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedZone(z);
                }}
              >👁️ View</button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm("Supprimer cette zone ?")) return;
                  await fetch(`/api/dashboard/farms/${farmId}/zones/${z._id}`, { method: "DELETE" });
                  // Rafraîchir la liste
                  const zonesRes = await fetch(`/api/dashboard/farms/${farmId}/zones`);
                  const zonesData = await zonesRes.json();
                  setZones(zonesData);
                }}
              >Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail zone */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white border border-gray-200 shadow-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-sm font-extrabold text-yellow-700">ZONE MAP</div>
                <h2 className="mt-1 text-3xl font-extrabold text-gray-900">{selectedZone.name}</h2>
                <p className="mt-2 text-gray-600 font-semibold">
                  {selectedZone.width}m × {selectedZone.length}m • {zonesTrees[selectedZone._id]?.length || 0} trees
                </p>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="h-10 w-10 rounded-2xl border border-gray-200 hover:bg-gray-50 transition font-extrabold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Zone Map */}
              <div className="flex flex-col">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Zone Layout</h3>
                <svg
                  width="100%"
                  height="300"
                  viewBox="0 0 400 300"
                  style={{ background: "#F7F8F4", borderRadius: 16, border: "2px solid #FDE68A" }}
                >
                  <defs>
                    <pattern id="grid-detail" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect x="20" y="20" width="360" height="260" fill="url(#grid-detail)" rx="8" />
                  <rect x="20" y="20" width="360" height="260" fill="#A7F3D0" stroke="#059669" strokeWidth="3" rx="8" opacity="0.3" />
                  
                  {/* Trees in detail view */}
                  {zonesTrees[selectedZone._id] && zonesTrees[selectedZone._id].map((tree: any) => {
                    const maxTreesPerRow = Math.max(
                      ...((zonesTrees[selectedZone._id] || []).map((t: any) => (t.index_in_row || 0) + 1) || [1])
                    );
                    const maxRows = Math.max(
                      ...((zonesTrees[selectedZone._id] || []).map((t: any) => (t.row_number || 0) + 1) || [1])
                    );

                    const cellW = 360 / (maxTreesPerRow || 1);
                    const cellH = 260 / (maxRows || 1);
                    const treeX = 20 + ((tree.index_in_row || 0) + 0.5) * cellW;
                    const treeY = 20 + ((tree.row_number || 0) + 0.5) * cellH;

                    const healthColors: Record<string, string> = {
                      "OK": "#10b981",
                      "STRESS": "#f59e0b",
                      "DISEASE": "#ef4444"
                    };

                    return (
                      <g key={tree._id}>
                        <circle cx={treeX} cy={treeY} r="8" fill={healthColors[tree.health_status]} stroke="#047857" strokeWidth="2" />
                        <text x={treeX} y={treeY} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" alignmentBaseline="middle">{tree.tree_code?.charAt(0) || "T"}</text>
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-3 flex gap-2 text-sm">
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full" style={{background: "#10b981"}}></div><span>OK</span></div>
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full" style={{background: "#f59e0b"}}></div><span>STRESS</span></div>
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full" style={{background: "#ef4444"}}></div><span>DISEASE</span></div>
                </div>
              </div>

              {/* Zone Details & Trees List */}
              <div className="flex flex-col">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Details</h3>
                <div className="bg-[#F7F8F4] rounded-2xl p-4 mb-4 border border-gray-200">
                  <div className="grid gap-2 text-sm">
                    <div><span className="font-semibold text-gray-700">Crop:</span> {selectedZone.crop_type || "-"}</div>
                    <div><span className="font-semibold text-gray-700">Mode:</span> {selectedZone.mode}</div>
                    <div><span className="font-semibold text-gray-700">Moisture Threshold:</span> {selectedZone.moisture_threshold ?? "-"}</div>
                    <div><span className="font-semibold text-gray-700">Area:</span> {selectedZone.width * selectedZone.length} m²</div>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 mb-3">Trees ({zonesTrees[selectedZone._id]?.length || 0})</h3>
                <div className="flex-1 overflow-y-auto max-h-48 border border-gray-200 rounded-2xl">
                  {zonesTrees[selectedZone._id] && zonesTrees[selectedZone._id].length > 0 ? (
                    <div className="divide-y">
                      {zonesTrees[selectedZone._id].map((tree: any) => {
                        const healthColors: Record<string, string> = {
                          "OK": "bg-green-100 text-green-800",
                          "STRESS": "bg-yellow-100 text-yellow-800",
                          "DISEASE": "bg-red-100 text-red-800"
                        };
                        return (
                          <div key={tree._id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{tree.tree_code}</div>
                              <div className="text-xs text-gray-600">Row {tree.row_number}, Index {tree.index_in_row}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${healthColors[tree.health_status]}`}>
                              {tree.health_status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-gray-500 text-center">No trees in this zone</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`/owner/farms/${farmId}/zones/${selectedZone._id}/trees`}
                className="flex-1 text-center bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-xl font-bold"
              >
                🌳 Manage Trees
              </a>
              <button
                onClick={() => setSelectedZone(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 transition px-4 py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
