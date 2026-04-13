import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Tunis";
  const requestedDays = Number.parseInt(searchParams.get("days") || "3", 10);
  const forecastDays = Number.isFinite(requestedDays)
    ? Math.min(Math.max(requestedDays, 1), 3)
    : 3;

  const key = process.env.WEATHERAPI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing WEATHERAPI_KEY in .env.local" },
      { status: 400 }
    );
  }

  try {
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city)}&aqi=no`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(
      city
    )}&days=${forecastDays}&aqi=no&alerts=no`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl, { cache: "no-store" }),
      fetch(forecastUrl, { cache: "no-store" }),
    ]);

    const currentData = await currentResponse.json();

    if (!currentResponse.ok) {
      return NextResponse.json(
        { error: currentData?.error?.message || "WeatherAPI error" },
        { status: 400 }
      );
    }

    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

    const normalizeIcon = (iconPath: string) => (iconPath.startsWith("//") ? `https:${iconPath}` : iconPath);

    const temp = currentData.current.temp_c;
    const desc = currentData.current.condition.text;
    const icon = normalizeIcon(currentData.current.condition.icon);
    const humidity = currentData.current.humidity;
    const windSpeed = currentData.current.wind_kph;

    const dailyForecast = (forecastData?.forecast?.forecastday || []).map((day: any) => ({
      date: day.date,
      dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${day.date}T12:00:00`)),
      avgTemp: day.day.avgtemp_c,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      chanceOfRain: day.day.daily_chance_of_rain,
      condition: day.day.condition.text,
      icon: normalizeIcon(day.day.condition.icon),
    }));

    const localTime = currentData.location?.localtime
      ? new Date(currentData.location.localtime.replace(" ", "T"))
      : new Date();

    const hourlyForecast = (forecastData?.forecast?.forecastday || [])
      .flatMap((day: any) =>
        (day.hour || []).map((hour: any) => ({
          time: hour.time,
          dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${hour.time.replace(" ", "T")}`)),
          hourLabel: hour.time.split(" ")[1]?.slice(0, 5) || hour.time,
          temp: hour.temp_c,
          chanceOfRain: hour.chance_of_rain,
          condition: hour.condition.text,
          icon: normalizeIcon(hour.condition.icon),
        }))
      )
      .filter((hour: any) => new Date(hour.time.replace(" ", "T")) >= localTime)
      .slice(0, 24);

    return NextResponse.json({ 
      temperature: temp,
      condition: desc,
      icon: icon,
      humidity: humidity,
      windSpeed: windSpeed,
      isDay: currentData.current.is_day === 1,
      city: currentData.location?.name || city,
      localTime: currentData.location?.localtime || null,
      dailyForecast,
      hourlyForecast,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
