import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Tunis";

  const key = process.env.WEATHERAPI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing WEATHERAPI_KEY in .env.local" },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(
      city
    )}&aqi=no`;

    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "WeatherAPI error" },
        { status: 400 }
      );
    }

    const temp = data.current.temp_c;
    const desc = data.current.condition.text;
    const icon = data.current.condition.icon.startsWith("//")
      ? `https:${data.current.condition.icon}`
      : data.current.condition.icon;
    const humidity = data.current.humidity;
    const windSpeed = data.current.wind_kph;

    return NextResponse.json({ 
      temperature: temp,
      condition: desc,
      icon: icon,
      humidity: humidity,
      windSpeed: windSpeed,
      isDay: data.current.is_day === 1
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
