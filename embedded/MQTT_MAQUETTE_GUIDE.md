# MQTT Maquette Guide (Station meteo + Electrovanne)

## 1) Architecture minimale

- HiveMQ Cloud: broker MQTT (TLS)
- PC: bridge Node (npm run mqtt:bridge)
- ESP32 station: publie temperature, pluie, luminosite
- ESP32 actionneur: recoit ON/OFF pour l'electrovanne
- App Next.js: affiche mesures et envoie commandes vanne

## 1.1) Pin Mapping

### Weather station ESP32

- `BME280 SDA` -> `GPIO 21`
- `BME280 SCL` -> `GPIO 22`
- `BME280 VCC` -> `3.3V`
- `BME280 GND` -> `GND`
- `Rain sensor OUT` -> `GPIO 14`
- `Rain sensor VCC` 
- `Rain sensor GND` -> `GND`
- `Light sensor OUT / A0` -> `GPIO 34`
- `Light sensor VCC` 
- `Light sensor GND` -> `GND`

### Valve actuator ESP32

- `Relay IN` -> `GPIO 26`
- `Relay VCC` -> `5V` or `3.3V` 
- `Relay GND` -> `GND`


## 2) Topics utilises

- Station vers backend:
  - `farm/<farmId>/station`
- Backend vers actionneur:
  - `farm/<farmId>/actuator/cmd`
- Actionneur vers backend/monitoring:
  - `farm/<farmId>/actuator/state`

Exemple station payload:

```json
{
  "temperature": 27.8,
  "rain": 0,
  "luminosity": 745,
  "timestamp": 1712998000
}
```

Exemple commande vanne payload:

```json
{
  "valve_state": "ON"
}
```



