import { NextResponse } from "next/server";

type DailyForecastItem = {
  date: string;
  dayName: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
};

const WEATHER_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0: { condition: "Clear", icon: "https://cdn.weatherapi.com/weather/64x64/day/113.png" },
  1: { condition: "Mainly clear", icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png" },
  2: { condition: "Partly cloudy", icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png" },
  3: { condition: "Overcast", icon: "https://cdn.weatherapi.com/weather/64x64/day/122.png" },
  45: { condition: "Fog", icon: "https://cdn.weatherapi.com/weather/64x64/day/143.png" },
  48: { condition: "Fog", icon: "https://cdn.weatherapi.com/weather/64x64/day/143.png" },
  51: { condition: "Drizzle", icon: "https://cdn.weatherapi.com/weather/64x64/day/266.png" },
  53: { condition: "Drizzle", icon: "https://cdn.weatherapi.com/weather/64x64/day/266.png" },
  55: { condition: "Drizzle", icon: "https://cdn.weatherapi.com/weather/64x64/day/266.png" },
  56: { condition: "Freezing drizzle", icon: "https://cdn.weatherapi.com/weather/64x64/day/281.png" },
  57: { condition: "Freezing drizzle", icon: "https://cdn.weatherapi.com/weather/64x64/day/281.png" },
  61: { condition: "Rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/296.png" },
  63: { condition: "Rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/302.png" },
  65: { condition: "Heavy rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/308.png" },
  66: { condition: "Freezing rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/311.png" },
  67: { condition: "Freezing rain", icon: "https://cdn.weatherapi.com/weather/64x64/day/314.png" },
  71: { condition: "Snow", icon: "https://cdn.weatherapi.com/weather/64x64/day/338.png" },
  73: { condition: "Snow", icon: "https://cdn.weatherapi.com/weather/64x64/day/338.png" },
  75: { condition: "Heavy snow", icon: "https://cdn.weatherapi.com/weather/64x64/day/338.png" },
  77: { condition: "Snow grains", icon: "https://cdn.weatherapi.com/weather/64x64/day/338.png" },
  80: { condition: "Rain showers", icon: "https://cdn.weatherapi.com/weather/64x64/day/353.png" },
  81: { condition: "Rain showers", icon: "https://cdn.weatherapi.com/weather/64x64/day/356.png" },
  82: { condition: "Heavy showers", icon: "https://cdn.weatherapi.com/weather/64x64/day/359.png" },
  85: { condition: "Snow showers", icon: "https://cdn.weatherapi.com/weather/64x64/day/368.png" },
  86: { condition: "Snow showers", icon: "https://cdn.weatherapi.com/weather/64x64/day/371.png" },
  95: { condition: "Thunderstorm", icon: "https://cdn.weatherapi.com/weather/64x64/day/386.png" },
  96: { condition: "Thunderstorm", icon: "https://cdn.weatherapi.com/weather/64x64/day/389.png" },
  99: { condition: "Thunderstorm", icon: "https://cdn.weatherapi.com/weather/64x64/day/389.png" },
};

function fallbackForCode(code: number) {
  return WEATHER_CODE_MAP[code] || {
    condition: "Unknown",
    icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
  };
}

async function fetchOpenMeteoDaily(city: string, days: number): Promise<DailyForecastItem[]> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl, { cache: "no-store" });
  if (!geoRes.ok) return [];

  const geoData = await geoRes.json();
  const first = geoData?.results?.[0];
  if (!first?.latitude || !first?.longitude) return [];

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${days}`;
  const forecastRes = await fetch(forecastUrl, { cache: "no-store" });
  if (!forecastRes.ok) return [];

  const data = await forecastRes.json();
  const daily = data?.daily;
  if (!daily?.time?.length) return [];

  return daily.time.map((date: string, idx: number) => {
    const maxTemp = Number(daily.temperature_2m_max?.[idx] ?? 0);
    const minTemp = Number(daily.temperature_2m_min?.[idx] ?? 0);
    const weatherCode = Number(daily.weather_code?.[idx] ?? -1);
    const chanceOfRain = Number(daily.precipitation_probability_max?.[idx] ?? 0);
    const mapped = fallbackForCode(weatherCode);

    return {
      date,
      dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${date}T12:00:00`)),
      avgTemp: Math.round(((maxTemp + minTemp) / 2) * 10) / 10,
      maxTemp,
      minTemp,
      chanceOfRain,
      condition: mapped.condition,
      icon: mapped.icon,
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Tunis";
  const requestedDays = Number.parseInt(searchParams.get("days") || "7", 10);
  const forecastDays = Number.isFinite(requestedDays)
    ? Math.min(Math.max(requestedDays, 1), 7)
    : 7;

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

    let dailyForecast: DailyForecastItem[] = (forecastData?.forecast?.forecastday || []).map((day: any) => ({
      date: day.date,
      dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${day.date}T12:00:00`)),
      avgTemp: day.day.avgtemp_c,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      chanceOfRain: day.day.daily_chance_of_rain,
      condition: day.day.condition.text,
      icon: normalizeIcon(day.day.condition.icon),
    }));

    // WeatherAPI free plans may return only 3 days. Use Open-Meteo fallback to reach requested range.
    if (dailyForecast.length < forecastDays) {
      try {
        const fallbackDaily = await fetchOpenMeteoDaily(city, forecastDays);
        if (fallbackDaily.length > dailyForecast.length) {
          dailyForecast = fallbackDaily;
        }
      } catch {
        // Keep WeatherAPI dailyForecast as-is on fallback failure.
      }
    }

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
