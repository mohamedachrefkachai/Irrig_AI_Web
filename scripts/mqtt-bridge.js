const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex < 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const brokerUrl = process.env.MQTT_URL || "mqtts://917ecd3295af470c8a235551a93a2ffa.s1.eu.hivemq.cloud:8883";
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
const topicPattern = process.env.MQTT_STATION_TOPIC || "farm/+/station";
const mqttUsername = process.env.MQTT_USERNAME || "";
const mqttPassword = process.env.MQTT_PASSWORD || "";

const mqttOptions = {
  username: mqttUsername || undefined,
  password: mqttPassword || undefined,
};

function extractFarmId(topic) {
  const parts = topic.split("/");
  if (parts.length < 3) {
    return null;
  }

  if (parts[0] !== "farm" || parts[2] !== "station") {
    return null;
  }

  return parts[1];
}

const client = mqtt.connect(brokerUrl, mqttOptions);

function normalizeRecordedAt(data) {
  if (data.recorded_at) {
    return data.recorded_at;
  }

  if (data.timestamp == null) {
    return new Date().toISOString();
  }

  // Support UNIX seconds and milliseconds.
  const ts = Number(data.timestamp);
  if (Number.isNaN(ts)) {
    return new Date().toISOString();
  }

  const secondsLooksLikeEpoch = ts >= 1600000000;
  const millisecondsLooksLikeEpoch = ts >= 1600000000000;

  if (secondsLooksLikeEpoch) {
    return new Date(ts * 1000).toISOString();
  }

  if (millisecondsLooksLikeEpoch) {
    return new Date(ts).toISOString();
  }

  // ESP32 sketch currently sends uptime seconds; use receipt time instead.
  return new Date().toISOString();
}

client.on("connect", () => {
  client.subscribe(topicPattern, (error) => {
    if (error) {
      console.error("MQTT subscribe failed:", error.message);
      return;
    }

    console.log(`MQTT bridge connected to ${brokerUrl}`);
    console.log(`Subscribed to ${topicPattern}`);
  });
});

client.on("message", async (topic, payload) => {
  const farmId = extractFarmId(topic);
  if (!farmId) {
    return;
  }

  try {
    const data = JSON.parse(payload.toString());

    const response = await fetch(`${apiBaseUrl}/api/dashboard/farms/${farmId}/station`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: data.temperature,
        humidity: data.humidity,
        rain: data.rain,
        luminosity: data.luminosity,
        zone_id: data.zone_id,
        recorded_at: normalizeRecordedAt(data),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API error for farm ${farmId}:`, response.status, errorBody);
      return;
    }

    console.log(`Station reading saved for farm ${farmId}`);
  } catch (error) {
    console.error(`Failed to handle MQTT message for farm ${farmId}:`, error.message);
  }
});

client.on("error", (error) => {
  console.error("MQTT bridge error:", error.message);
});