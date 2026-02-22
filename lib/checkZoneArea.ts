
import Farm from "../models/Farm";
import Zone from "../models/Zone";

export async function checkZoneArea(farmId: string, newZoneArea: number) {
  // Récupérer la ferme
  const farm = await Farm.findById(farmId);
  if (!farm) throw new Error("Farm not found");
  const farmArea = farm.longueur * farm.largeur;
  // Récupérer toutes les zones existantes
  const zones = await Zone.find({ farm_id: farmId });
  const usedArea = zones.reduce((sum, z) => sum + (z.width * z.length), 0);
  if (usedArea + newZoneArea > farmArea) {
    return false;
  }
  return true;
}
