"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FarmZonesSVG() {
  const { farmId } = useParams();
  const [farm, setFarm] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const farmRes = await fetch(`/api/dashboard/farms/${farmId}`);
      const farmData = await farmRes.json();
      const zonesRes = await fetch(`/api/dashboard/farms/${farmId}/zones`);
      const zonesData = await zonesRes.json();
      setFarm(farmData);
      setZones(zonesData);
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

  // Placement "packing" : toutes les zones sont affichées dans le cadre, même si elles sont grandes
  let zoneRects = [];
  let xOffset = farmX;
  let yOffset = farmY;
  let currentRowHeight = 0;
  let remainingWidth = farmW;
  for (const zone of zones) {
    let zW = (zone.width || 10) * scale;
    let zH = (zone.length || 10) * scale;
    // Si la zone est trop grande pour la ligne, on la réduit pour qu'elle tienne
    if (zW > remainingWidth) {
      if (zW > farmW) zW = farmW;
      xOffset = farmX;
      yOffset += currentRowHeight;
      remainingWidth = farmW;
      currentRowHeight = 0;
    }
    // Si la zone dépasse le cadre verticalement, on la réduit
    if (yOffset + zH > farmY + farmH) {
      zH = Math.max(farmY + farmH - yOffset, 0);
    }
    // Si la zone dépasse le cadre horizontalement, on la réduit
    if (xOffset + zW > farmX + farmW) {
      zW = Math.max(farmX + farmW - xOffset, 0);
    }
    zoneRects.push({
      ...zone,
      x: xOffset,
      y: yOffset,
      w: zW,
      h: zH,
    });
    xOffset += zW;
    remainingWidth -= zW;
    if (zH > currentRowHeight) currentRowHeight = zH;
  }

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
          <g key={z._id}>
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
            />
            <text
              x={z.x + z.w / 2}
              y={z.y + z.h / 2}
              textAnchor="middle"
              fontSize={18}
              fill="#B45309"
              fontWeight="bold"
              alignmentBaseline="middle"
            >
              {z.name}
            </text>
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
          <div key={z._id} className="rounded-2xl border border-yellow-300 bg-white p-5 shadow">
            <div className="font-extrabold text-lg text-yellow-900 mb-1">{z.name}</div>
            <div className="text-gray-700">Crop: {z.crop_type || "-"}</div>
            <div className="text-gray-700">Mode: {z.mode}</div>
            <div className="text-gray-700">Moisture Threshold: {z.moisture_threshold ?? "-"}</div>
            <div className="text-gray-700">Width: {z.width} m</div>
            <div className="text-gray-700">Length: {z.length} m</div>
            <div className="text-gray-500 text-xs mt-2">Created: {z.created_at ? new Date(z.created_at).toLocaleString() : "-"}</div>
            <button
              className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl"
              onClick={async () => {
                if (!window.confirm("Supprimer cette zone ?")) return;
                await fetch(`/api/dashboard/farms/${farmId}/zones/${z._id}`, { method: "DELETE" });
                // Rafraîchir la liste
                const zonesRes = await fetch(`/api/dashboard/farms/${farmId}/zones`);
                const zonesData = await zonesRes.json();
                setZones(zonesData);
              }}
            >Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
