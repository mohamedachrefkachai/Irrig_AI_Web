"use client";
import { useState, useRef, useEffect } from "react";

type DrawingState = {
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  isDrawing: boolean;
};

export default function AddZoneForm({
  farmId,
  farmWidth,
  farmLength,
  existingZones = [],
  onZoneAdded,
}: {
  farmId: string;
  farmWidth: number;
  farmLength: number;
  existingZones?: any[];
  onZoneAdded?: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    crop_type: "",
    width: "",
    length: "",
    x: 0,
    y: 0,
    mode: "AUTO",
    moisture_threshold: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drawing, setDrawing] = useState<DrawingState>({
    startX: null,
    startY: null,
    endX: null,
    endY: null,
    isDrawing: false,
  });
  const [useInteractive, setUseInteractive] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 360;
  const frameX = 20;
  const frameY = 20;
  const frameW = svgWidth - 2 * frameX;
  const frameH = svgHeight - 2 * frameY;
  const scale = Math.min(frameW / farmWidth, frameH / farmLength, 1);
  const farmW = farmWidth * scale;
  const farmH = farmLength * scale;
  const farmX = frameX + (frameW - farmW) / 2;
  const farmY = frameY + (frameH - farmH) / 2;

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= farmX && x <= farmX + farmW && y >= farmY && y <= farmY + farmH) {
      setDrawing({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isDrawing: true,
      });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawing.isDrawing || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing((prev) => ({
      ...prev,
      endX: Math.max(farmX, Math.min(x, farmX + farmW)),
      endY: Math.max(farmY, Math.min(y, farmY + farmH)),
    }));
  };

  const handleSvgMouseUp = () => {
    if (drawing.startX !== null && drawing.endX !== null) {
      const x1 = Math.min(drawing.startX, drawing.endX) - farmX;
      const y1 = Math.min(drawing.startY!, drawing.endY!) - farmY;
      const x2 = Math.max(drawing.startX, drawing.endX) - farmX;
      const y2 = Math.max(drawing.startY!, drawing.endY!) - farmY;

      const zoneWidth = Math.round(((x2 - x1) / farmW) * farmWidth);
      const zoneLength = Math.round(((y2 - y1) / farmH) * farmLength);
      
      // Calculate position in meters (top-left corner of the zone)
      const zoneX = Math.round((x1 / farmW) * farmWidth);
      const zoneY = Math.round((y1 / farmH) * farmLength);

      if (zoneWidth >= 5 && zoneLength >= 5) {
        setForm((prev) => ({
          ...prev,
          width: String(zoneWidth),
          length: String(zoneLength),
          x: zoneX,
          y: zoneY,
        }));
        setShowForm(true);
      }
    }

    setDrawing({
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      isDrawing: false,
    });
  };

  const handleClearDrawing = () => {
    setDrawing({
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      isDrawing: false,
    });
    setForm((prev) => ({ ...prev, width: "", length: "", x: 0, y: 0 }));
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const width = Number(form.width);
    const length = Number(form.length);
    const moisture = form.moisture_threshold ? Number(form.moisture_threshold) : null;

    if (!form.name.trim()) {
      setError("Zone name is required");
      return false;
    }
    if (width <= 0 || width > 10000) {
      setError("Width must be between 1 and 10000 meters");
      return false;
    }
    if (length <= 0 || length > 10000) {
      setError("Length must be between 1 and 10000 meters");
      return false;
    }
    if (moisture !== null && (moisture < 0 || moisture > 100)) {
      setError("Moisture threshold must be between 0 and 100%");
      return false;
    }
    if (width < 5 || length < 5) {
      setError("Zone dimensions must be at least 5m to fit trees (5m spacing)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          crop_type: form.crop_type.trim() || null,
          width: Number(form.width),
          length: Number(form.length),
          x: form.x,
          y: form.y,
          mode: form.mode,
          moisture_threshold: form.moisture_threshold ? Number(form.moisture_threshold) : null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error adding zone");
      }
      setSuccess("✓ Zone added successfully!");
      setForm({ name: "", crop_type: "", width: "", length: "", x: 0, y: 0, mode: "AUTO", moisture_threshold: "" });
      setShowForm(false);
      handleClearDrawing();
      setTimeout(() => {
        if (onZoneAdded) onZoneAdded();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const treesPerRow = Math.floor(Number(form.width) / 5) || 0;
  const totalRows = Math.floor(Number(form.length) / 5) || 0;
  const estimatedTrees = treesPerRow * totalRows;

  // Calculate existing zones positions for display using stored x, y coordinates
  const zoneRects = existingZones.map((zone) => {
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

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-3xl p-8 shadow-lg mb-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold text-green-700 mb-2">➕ Add New Zone</h2>
      <p className="text-gray-600 text-sm mb-6">
        {!showForm ? "Draw a zone on the map by clicking and dragging (minimum 5m × 5m)" : "Fill in the zone details below"}
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map */}
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-900 mb-3">🗺️ Click & Drag to Draw Zone</h3>
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            style={{
              background: "#F7F8F4",
              borderRadius: 16,
              border: "3px solid #059669",
              cursor: drawing.isDrawing ? "crosshair" : "pointer",
            }}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
            <defs>
              <pattern id="grid-form" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x={frameX} y={frameY} width={frameW} height={frameH} fill="url(#grid-form)" rx={24} />
            <rect x={farmX} y={farmY} width={farmW} height={farmH} fill="#A7F3D0" stroke="#059669" strokeWidth={6} rx={18} />
            <text x={farmX + farmW / 2} y={farmY + farmH / 2} textAnchor="middle" fontSize={20} fill="#059669" fontWeight="bold">
              {farmWidth}m × {farmLength}m
            </text>

            {/* Existing zones */}
            {zoneRects.map((z) => (
              <g key={z._id}>
                <rect
                  x={z.x + 4}
                  y={z.y + 4}
                  width={z.w - 8}
                  height={z.h - 8}
                  fill="#FDE68A"
                  stroke="#F59E42"
                  strokeWidth={2}
                  rx={6}
                  opacity={0.6}
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#B45309"
                  fontWeight="bold"
                  alignmentBaseline="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {z.name}
                </text>
              </g>
            ))}

            {/* Preview rectangle */}
            {drawing.startX !== null && drawing.endX !== null && (
              <rect
                x={Math.min(drawing.startX, drawing.endX)}
                y={Math.min(drawing.startY!, drawing.endY!)}
                width={Math.abs(drawing.endX - drawing.startX)}
                height={Math.abs(drawing.endY! - drawing.startY!)}
                fill="#FDE68A"
                stroke="#F59E42"
                strokeWidth={3}
                opacity={0.7}
                rx={8}
              />
            )}
          </svg>
          {showForm && (
            <button
              type="button"
              onClick={handleClearDrawing}
              className="mt-3 w-full border border-gray-300 hover:bg-gray-100 transition px-4 py-2 rounded-xl font-semibold text-gray-700"
            >
              Clear Drawing
            </button>
          )}
        </div>

        {/* Form Fields */}
        {showForm && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Zone Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="E.g., Zone A, Oliviers Est"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Crop Type</label>
            <input
              name="crop_type"
              value={form.crop_type}
              onChange={handleChange}
              placeholder="E.g., Olive, Wheat"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Width (m) *</label>
              <input
                name="width"
                value={form.width}
                onChange={handleChange}
                required
                type="number"
                min="1"
                step="5"
                placeholder="Auto from draw"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
              />
              <div className="text-xs text-gray-500 mt-1">Trees/row: <span className="font-bold text-green-700">{treesPerRow}</span></div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Length (m) *</label>
              <input
                name="length"
                value={form.length}
                onChange={handleChange}
                required
                type="number"
                min="1"
                step="5"
                placeholder="Auto from draw"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
              />
              <div className="text-xs text-gray-500 mt-1">Rows: <span className="font-bold text-green-700">{totalRows}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Mode</label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
              >
                <option value="AUTO">🤖 Auto</option>
                <option value="MANUAL">👤 Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-2">Moisture (%)</label>
              <input
                name="moisture_threshold"
                value={form.moisture_threshold}
                onChange={handleChange}
                type="number"
                min="0"
                max="100"
                placeholder="30-50"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Preview */}
          {(form.width || form.length) && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4">
              <p className="text-sm font-semibold text-blue-900">
                📊 {form.width}m × {form.length}m = {Number(form.width) * Number(form.length)} m²
              </p>
              {estimatedTrees > 0 && (
                <p className="text-sm font-semibold text-blue-900 mt-1">
                  🌳 ~{estimatedTrees} trees ({treesPerRow}×{totalRows})
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95"
          >
            {loading ? "➕ Adding..." : "➕ Add Zone"}
          </button>
        </div>
        )}
      </div>
    </form>
  );
}
