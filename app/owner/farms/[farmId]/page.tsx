"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import dynamic from "next/dynamic";
const FarmZonesSVG = dynamic(() => import("./FarmZonesSVG"), { ssr: false });
const AddZoneForm = dynamic(() => import("./AddZoneForm"), { ssr: false });

export default function FarmDetailPage() {
  const { farmId } = useParams();
  const [farm, setFarm] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarm() {
      const res = await fetch(`/api/dashboard/farms/${farmId}`);
      if (!res.ok) {
        setFarm(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFarm(data);
      
      // Fetch zones
      const zonesRes = await fetch(`/api/dashboard/farms/${farmId}/zones`);
      const zonesData = await zonesRes.json();
      setZones(zonesData);
      
      setLoading(false);
    }
    fetchFarm();
  }, [farmId]);

  if (loading) return <div className="text-gray-500 p-8">Loading...</div>;
  if (!farm) return <div className="text-red-600 p-8">Farm not found.</div>;

  // 2D Drawing
  const width = farm.longueur || 100;
  const height = farm.largeur || 60;
  // Scale farm rectangle to fit SVG frame
  const svgWidth = 600;
  const svgHeight = 360;
  const frameX = 20;
  const frameY = 20;
  const frameW = svgWidth - 2 * frameX;
  const frameH = svgHeight - 2 * frameY;
  // Calculate max farm size to fit frame
  const maxFarmW = Math.min(width, frameW);
  const maxFarmH = Math.min(height, frameH);
  // Scale farm size proportionally
  const scale = Math.min(frameW / width, frameH / height, 1);
  const farmW = width * scale;
  const farmH = height * scale;
  const farmX = frameX + (frameW - farmW) / 2;
  const farmY = frameY + (frameH - farmH) / 2;
  const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" style="background:#F7F8F4;border-radius:24px;border:3px solid #059669">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="2" />
        </pattern>
      </defs>
      <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" fill="url(#grid)" rx="24" />
      <rect x="${farmX}" y="${farmY}" width="${farmW}" height="${farmH}" fill="#A7F3D0" stroke="#059669" stroke-width="6" rx="18" />
      <text x="${farmX + farmW / 2}" y="${farmY + farmH / 2}" text-anchor="middle" font-size="32" fill="#059669" font-weight="bold">${farm.name}</text>
      <text x="${farmX + farmW / 2}" y="${farmY + farmH + 40}" text-anchor="middle" font-size="22" fill="#059669">${width}m x ${height}m</text>
    </svg>
  `;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">🏡 Farm Details</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-700 mb-2">{farm.name}</div>
              <div className="text-gray-700">📍 Location: {farm.location}</div>
              <div className="text-gray-700">📏 Dimensions: {farm.longueur}m × {farm.largeur}m</div>
              <div className="text-gray-500 text-sm mt-2">Created: {new Date(farm.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/owner/farms" className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold px-6 py-3 rounded-xl transition">
                ← Back to Farms
              </Link>
            </div>
          </div>
        </div>

        {/* Farm Overview with Zones */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">🗺️ Farm Overview</h2>
          <div className="flex justify-center">
            <FarmZonesSVG />
          </div>
        </div>

        {/* Add Zone Form */}
        <div>
          <AddZoneForm 
            farmId={farm._id} 
            farmWidth={farm.longueur}
            farmLength={farm.largeur}
            existingZones={zones}
            onZoneAdded={() => window.location.reload()} 
          />
        </div>
      </div>
    </main>
  );
}
