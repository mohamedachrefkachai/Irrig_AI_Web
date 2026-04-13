#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

// ===== Wi-Fi =====
const char* WIFI_SSID = "..";
const char* WIFI_PASSWORD = "00001111";

// ===== HiveMQ Cloud =====
const char* MQTT_HOST = "917ecd3295af470c8a235551a93a2ffa.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;
const char* MQTT_USER = "Achrefkachai";
const char* MQTT_PASSWORD = "Achref@2020";

// ===== IDs =====
const char* FARM_ID = "6999cb4a6b6b17e22a5958b1";

// Topic: farm/<farmId>/station
String stationTopic = String("farm/") + FARM_ID + "/station";

// ===== Pins capteurs =====
#define RAIN_PIN 14        // Digital rain sensor: 1=sec, 0=pluie (selon module)
#define LIGHT_PIN 34       // Analog LDR on ESP32 ADC pin

Adafruit_BME280 bme;
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL_MS = 5000;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    String clientId = "esp32-station-" + String((uint32_t)ESP.getEfuseMac(), HEX);

    bool ok;
    if (strlen(MQTT_USER) > 0) {
      ok = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
    } else {
      ok = mqttClient.connect(clientId.c_str());
    }

    if (!ok) {
      delay(1500);
    }
  }
}

void setup() {
  pinMode(RAIN_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  Wire.begin();

  connectWiFi();
  // For a quick demo. For production, install HiveMQ CA certificate instead.
  espClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

  if (!bme.begin(0x76)) {
    Serial.begin(115200);
    Serial.println("BME280 not detected on address 0x76");
  }
}

void loop() {
  connectWiFi();

  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublish < PUBLISH_INTERVAL_MS) {
    return;
  }
  lastPublish = now;

  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  int rainRaw = digitalRead(RAIN_PIN);
  int lightRaw = analogRead(LIGHT_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    return;
  }

  int rain = (rainRaw == LOW) ? 1 : 0; // adapte si ton module est inverse

  String payload = "{";
  payload += "\"temperature\":" + String(temperature, 1) + ",";
  payload += "\"humidity\":" + String(humidity, 1) + ",";
  payload += "\"rain\":" + String(rain) + ",";
  payload += "\"luminosity\":" + String(lightRaw) + ",";
  payload += "\"timestamp\":" + String((unsigned long)(millis() / 1000));
  payload += "}";

  mqttClient.publish(stationTopic.c_str(), payload.c_str(), true);
}
