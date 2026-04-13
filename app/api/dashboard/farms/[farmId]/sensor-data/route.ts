/**
 * GET /api/dashboard/farms/[farmId]/sensor-data
 * Récupère les dernières données de capteurs pour une farm
 * - Soil Moisture: moyenne des derniers relevés de capteurs des arbres
 * - Temperature/Humidity: dernière lecture station ou WeatherRecord
 * - Rainfall: depuis FarmStationReading ou WeatherRecord
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Farm from "@/models/Farm";
import Tree from "@/models/Tree";
import SensorData from "@/models/SensorData";
import FarmStationReading from "@/models/FarmStationReading";
import WeatherRecord from "@/models/WeatherRecord";

export async function GET(req: NextRequest, { params }: any) {
  try {
    await connectDB();
    const { farmId } = params;

    if (!farmId) {
      return NextResponse.json({ error: "Farm ID required" }, { status: 400 });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // 1. SOIL MOISTURE: Moyenne des capteurs des arbres de la farm
    // (Si pas de capteurs, garder la valeur manuelle de l'utilisateur)
    let soilMoisture = null;
    try {
      const trees = await Tree.find({ farm_id: farmId }).select("_id");
      if (trees.length > 0) {
        const treeIds = trees.map((t: any) => t._id);
        const sensorReadings = await SensorData.find({
          tree_id: { $in: treeIds },
        })
          .sort({ recorded_at: -1 })
          .limit(10); // Derniers 10 relevés

        if (sensorReadings.length > 0) {
          const avg = sensorReadings.reduce((sum: number, s: any) => sum + (s.soil_moisture || 0), 0) / sensorReadings.length;
          soilMoisture = Math.round(avg * 100) / 100; // Deux décimales
        }
      }
    } catch (err: any) {
      console.log("Soil moisture not available:", err.message);
    }

    // 2. TEMPERATURE, HUMIDITY, RAINFALL: depuis FarmStationReading (priorité) ou WeatherRecord
    let station = null;
    let weatherData = null;

    try {
      // Chercher la dernière station reading
      station = await FarmStationReading.findOne({ farm_id: farmId })
        .sort({ recorded_at: -1 })
        .limit(1);

      if (!station) {
        // Fallback: WeatherRecord
        weatherData = await WeatherRecord.findOne({ farm_id: farmId })
          .sort({ recorded_at: -1 })
          .limit(1);
      }
    } catch (err: any) {
      console.log("Station/Weather data fetch error:", err.message);
    }

    // 3. Construire la réponse
    const result = {
      farmId,
      soilMoisture, // null si pas de capteur dispo
      temperature: station?.temperature ?? weatherData?.temperature ?? null,
      humidity: station?.humidity ?? weatherData?.humidity ?? null,
      rainfallMm: station?.rain ?? weatherData?.rain_mm ?? null,
      stationLastReadAt: station?.recorded_at ?? weatherData?.recorded_at ?? null,
      source: {
        soil: soilMoisture !== null ? "SensorData (trees)" : "manual_input_required",
        weather: station ? "FarmStationReading" : weatherData ? "WeatherRecord" : "manual_input_required",
      },
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Sensor data API error:", err);
    return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 });
  }
}
