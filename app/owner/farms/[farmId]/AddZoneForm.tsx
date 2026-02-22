"use client";
import { useState } from "react";

export default function AddZoneForm({ farmId, onZoneAdded }: { farmId: string, onZoneAdded?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    crop_type: "",
    width: "",
    length: "",
    mode: "AUTO",
    moisture_threshold: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/dashboard/farms/${farmId}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          crop_type: form.crop_type,
          width: Number(form.width),
          length: Number(form.length),
          mode: form.mode,
          moisture_threshold: form.moisture_threshold ? Number(form.moisture_threshold) : undefined
        })
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout de la zone");
      setSuccess("Zone ajoutée avec succès !");
      setForm({ name: "", crop_type: "", width: "", length: "", mode: "AUTO", moisture_threshold: "" });
      if (onZoneAdded) onZoneAdded();
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-green-200 rounded-2xl p-6 shadow mb-8 max-w-xl mx-auto">
      <h2 className="text-xl font-extrabold text-green-700 mb-4">Ajouter une zone</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-700 mb-2">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Nom de la zone" className="border rounded-xl px-4 py-2" />
        <input name="crop_type" value={form.crop_type} onChange={handleChange} placeholder="Type de culture" className="border rounded-xl px-4 py-2" />
        <input name="width" value={form.width} onChange={handleChange} required type="number" min="1" placeholder="Largeur (m)" className="border rounded-xl px-4 py-2" />
        <input name="length" value={form.length} onChange={handleChange} required type="number" min="1" placeholder="Longueur (m)" className="border rounded-xl px-4 py-2" />
        <select name="mode" value={form.mode} onChange={handleChange} className="border rounded-xl px-4 py-2">
          <option value="AUTO">Automatique</option>
          <option value="MANUAL">Manuel</option>
        </select>
        <input name="moisture_threshold" value={form.moisture_threshold} onChange={handleChange} type="number" min="0" max="100" placeholder="Seuil d'humidité (%)" className="border rounded-xl px-4 py-2" />
      </div>
      <button type="submit" disabled={loading} className="mt-6 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-2 rounded-xl shadow">
        {loading ? "Ajout..." : "Ajouter la zone"}
      </button>
    </form>
  );
}
