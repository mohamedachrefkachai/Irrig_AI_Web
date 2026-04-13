import { NextResponse } from "next/server";

type PredictPayload = {
  soilMoisture: number;
  temperatureC: number;
  humidity: number;
  rainfallMm: number;
  farmId?: string; // Optional: Auto-fetch sensor data if provided
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function localFallbackPrediction(input: PredictPayload) {
  // Simple fallback score while waiting for a dedicated Python inference service.
  const dryness = clamp((50 - input.soilMoisture) / 50, 0, 1);
  const heat = clamp((input.temperatureC - 20) / 20, 0, 1);
  const airDryness = clamp((70 - input.humidity) / 70, 0, 1);
  const rainReduction = clamp(input.rainfallMm / 20, 0, 1);

  const score = clamp(100 * (0.55 * dryness + 0.25 * heat + 0.2 * airDryness - 0.35 * rainReduction), 0, 100);

  let irrigationNeed: "Low" | "Medium" | "High" = "Low";
  if (score >= 67) irrigationNeed = "High";
  else if (score >= 34) irrigationNeed = "Medium";

  const recommendation =
    irrigationNeed === "High"
      ? "Open valve now (priority irrigation)."
      : irrigationNeed === "Medium"
        ? "Irrigate moderately."
        : "No irrigation needed now.";

  return {
    irrigationNeed,
    score: Number(score.toFixed(2)),
    recommendation,
    source: "web-fallback",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PredictPayload>;

    // If farmId provided, fetch sensor data automatically
    let sensorData: any = null;
    if (body.farmId) {
      try {
        const sensorRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dashboard/farms/${body.farmId}/sensor-data`, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        if (sensorRes.ok) {
          sensorData = await sensorRes.json();
        }
      } catch (err) {
        console.log("Could not fetch sensor data:", err);
      }
    }

    // Use sensor data first, fallback to provided values
    const input: PredictPayload = {
      soilMoisture: Number(sensorData?.soilMoisture ?? body.soilMoisture ?? 50),
      temperatureC: Number(sensorData?.temperature ?? body.temperatureC ?? 20),
      humidity: Number(sensorData?.humidity ?? body.humidity ?? 60),
      rainfallMm: Number(sensorData?.rainfallMm ?? body.rainfallMm ?? 0),
    };

    const hasInvalid = Object.values(input).some((v) => Number.isNaN(v));
    if (hasInvalid) {
      return NextResponse.json({ error: "Invalid input values." }, { status: 400 });
    }

    const serviceUrl = process.env.DSO1_SERVICE_URL;
    let result: any = null;

    if (serviceUrl) {
      try {
        const upstream = await fetch(`${serviceUrl.replace(/\/$/, "")}/predict/irrigation-need`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          cache: "no-store",
        });

        if (upstream.ok) {
          const data = await upstream.json();
          result = { 
            ...data, 
            source: "python-service",
            dataSource: sensorData?.source || { soil: "manual", weather: "manual" },
            sensorDataFetched: !!sensorData,
          };
          return NextResponse.json(result);
        }
      } catch (err) {
        console.log("Python service error, falling back:", err);
      }
    }

    const prediction = localFallbackPrediction(input);
    return NextResponse.json({
      ...prediction,
      dataSource: sensorData?.source || { soil: "manual", weather: "manual" },
      sensorDataFetched: !!sensorData,
    });
  } catch {
    return NextResponse.json({ error: "Failed to predict irrigation need." }, { status: 500 });
  }
}
