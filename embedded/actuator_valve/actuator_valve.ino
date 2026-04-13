#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

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

String cmdTopic = String("farm/") + FARM_ID + "/actuator/cmd";
String stateTopic = String("farm/") + FARM_ID + "/actuator/state";

// ===== Electrovanne via relais =====
#define RELAY_PIN 26
const bool RELAY_ACTIVE_HIGH = true; // false si relais actif LOW

WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

String currentValveState = "OFF";

void applyValveState(const String& state) {
  currentValveState = (state == "ON") ? "ON" : "OFF";

  bool on = (currentValveState == "ON");
  int level;
  if (RELAY_ACTIVE_HIGH) {
    level = on ? HIGH : LOW;
  } else {
    level = on ? LOW : HIGH;
  }

  digitalWrite(RELAY_PIN, level);
}

void publishState() {
  String payload = "{";
  payload += "\"valve_state\":\"" + currentValveState + "\"";
  payload += "}";
  mqttClient.publish(stateTopic.c_str(), payload.c_str(), true);
}

String parseValveState(const String& json) {
  int keyPos = json.indexOf("\"valve_state\"");
  if (keyPos < 0) {
    return "";
  }

  int onPos = json.indexOf("\"ON\"");
  if (onPos >= 0) {
    return "ON";
  }

  int offPos = json.indexOf("\"OFF\"");
  if (offPos >= 0) {
    return "OFF";
  }

  return "";
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  String state = parseValveState(msg);
  if (state.length() == 0) {
    return;
  }

  applyValveState(state);
  publishState();
}

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
    String clientId = "esp32-actuator-" + String((uint32_t)ESP.getEfuseMac(), HEX);

    bool ok;
    if (strlen(MQTT_USER) > 0) {
      ok = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
    } else {
      ok = mqttClient.connect(clientId.c_str());
    }

    if (!ok) {
      delay(1500);
      continue;
    }

    mqttClient.subscribe(cmdTopic.c_str());
    publishState();
  }
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  applyValveState("OFF");

  connectWiFi();
  // For a quick demo. For production, install HiveMQ CA certificate instead.
  espClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
}

void loop() {
  connectWiFi();

  if (!mqttClient.connected()) {
    connectMQTT();
  }

  mqttClient.loop();
}
