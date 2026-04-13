# 📊 Comment fonctionnent les données de capteurs pour DSO1

## 🎯 Vue d'ensemble

Le système DSO1 (classification irrigation) utilise **4 variables** pour prédire le besoin d'irrigation :

| Variable | Source des données | État |
|----------|-------------------|------|
| **Soil_Moisture** | Capteurs de sol (SensorData) | ⚠️ En attente d'installation |
| **Temperature_C** | Station météo ou API météo | ✅ Disponible |
| **Humidity** | Station météo ou API météo | ✅ Disponible |
| **Rainfall_mm** | Station météo (FarmStationReading) | ✅ Disponible |

---

## 🔄 Flux de données

### A) Chargement automatique des capteurs

Quand tu vas sur une page de farm, le système:

1. **Appelle** `/api/dashboard/farms/[farmId]/sensor-data`
2. **Récupère** les dernières valeurs:
   - Soil Moisture: Moyenne des derniers capteurs de tous les arbres de la farm
   - Temperature & Humidity: Dernière station météo enregistrée
   - Rainfall: Dernière pluie enregistrée
3. **Auto-remplit** les champs si les données existent

### B) Hiérarchie des données (Fallback)

Si une donnée n'existe pas, le système utilise un fallback:

```
Soil Moisture:
  ├─ Capteurs des arbres (SensorData) → moyenne des 10 derniers relevés
  └─ Manuel (tu rentre la valeur)

Temperature/Humidity:
  ├─ FarmStationReading (capteur local) → dernière lecture
  ├─ WeatherRecord (base de données) → dernière lecture
  └─ API météo externe → données temps réel

Rainfall:
  ├─ FarmStationReading.rain → dernière station météo
  ├─ WeatherRecord.rain_mm → base de données
  └─ Manuel (tu rentre la valeur)
```

---

## 💾 Où sont stockées les données

### MongoDB Collections

**SensorData** (Capteurs électroniques des arbres)
```javascript
{
  tree_id: ObjectId,      // Arbre moniteur
  soil_moisture: 35.2,    // % d'humidité du sol
  soil_ph: 6.8,
  temperature: 22.5,
  recorded_at: Date       // Timestamp
}
```

**FarmStationReading** (Station météo locale / MQTT)
```javascript
{
  farm_id: ObjectId,
  zone_id: ObjectId,      // Zone optionnelle
  temperature: 25.3,      // °C
  humidity: 65.2,         // %
  rain: 2.5,              // mm depuis dernière lecture
  luminosity: 800,        // lux
  recorded_at: Date
}
```

**WeatherRecord** (Historique météo)
```javascript
{
  farm_id: ObjectId,
  temperature: 23.0,
  humidity: 60.5,
  wind_speed: 5.2,
  rain_mm: 3.0,           // Cumul pluie
  recorded_at: Date
}
```

---

## 🔌 Comment intégrer les capteurs

### Scénario 1: Soil Moisture (pas encore installé)

Tu dois insérer des données `SensorData` depuis des capteurs IoT:

```javascript
// Exemple: Un capteur envoie les données
POST /api/sensor-data
{
  tree_id: "...",
  soil_moisture: 42.5,
  soil_ph: 6.8,
  temperature: 22
}
```

### Scénario 2: Station météo existante

Les données viennent de `FarmStationReading` (lecture MQTT ou manuelle):

```javascript
// Station publie via MQTT:
farm/{farmId}/station
{
  "temperature": 24,
  "humidity": 65,
  "rain": 1.5,
  "luminosity": 800
}
```

Le script MQTT bridge (`scripts/mqtt-bridge.js`) **écoute** et sauvegarde dans la DB.

### Scénario 3: Données externes

`WeatherRecord` peut être peuplée par:
- API météo (OpenWeatherMap, etc.)
- Services tiers
- Autres sources

---

## 🟢 Structure actuelle (Interface UI)

Sur la page de farm, la section **"AI DSO1 - Irrigation Need Prediction"** montre:

```
┌─────────────────────────────────────────┐
│ 📡 SOIL MOISTURE                   [%]  │ ← Auto-filled ou manuel?
│    Si vert = données capteurs           │
│                                         │
│ 🌡️  TEMPERATURE [°C]                   │ ← Read-only (capteurs + météo)
│ 💧 HUMIDITY [%]                         │ ← Read-only
│ 🌧️  RAINFALL [mm]                      │ ← Auto-filled ou manuel
│                                         │
│ [Predict Irrigation Need]               │
│ ✓ Using real sensor data                │
└─────────────────────────────────────────┘
```

---

## 📡 API Endpoint: Récupérer les capteurs

**GET** `/api/dashboard/farms/[farmId]/sensor-data`

**Response:**
```json
{
  "farmId": "...",
  "soilMoisture": 35.2,           // null si aucun capteur
  "temperature": 24.5,            // Depuis station ou météo
  "humidity": 62.3,
  "rainfallMm": 2.1,
  "stationLastReadAt": "2026-04-14T10:30:00Z",
  "source": {
    "soil": "SensorData (trees)",
    "weather": "FarmStationReading"
  }
}
```

---

## 🤖 API Endpoint: Prédiction DSO1

**POST** `/api/ai/irrigation/predict`

**Payload:**
```json
{
  "farmId": "farm-123",           // Optionnel: auto-fetch sensor data
  "soilMoisture": 35,             // Fallback si pas de capteur
  "temperatureC": 24.5,
  "humidity": 62.3,
  "rainfallMm": 2.1
}
```

**Response:**
```json
{
  "irrigationNeed": "Medium",     // Low | Medium | High
  "score": 58.32,                 // % (0-100)
  "recommendation": "Irrigate moderately.",
  "source": "web-fallback",       // Ou "python-service" si actif
  "dataSource": {
    "soil": "SensorData (trees)",
    "weather": "FarmStationReading"
  },
  "sensorDataFetched": true
}
```

---

## ⚡ Exemple d'utilisation

### Cas 1: Tout automatique (données réelles dispo)

```
1. Page charge → appelle GET /sensor-data
2. BD retourne: soilMoisture=42, temp=24, humidity=60, rain=1
3. Champs s'auto-remplissent (vert = données réelles)
4. User clique "Predict"
5. API retourne: "High" (score 72%)
```

### Cas 2: Données partielles (soil manquant)

```
1. Page charge → appelle GET /sensor-data
2. BD retourne: soilMoisture=null, temp=24, humidity=60, rain=1
3. Champs s'auto-remplissent (sauf soil)
4. User rentre soil=35 manuellement
5. API retourne: "Medium" (score 58%)
```

### Cas 3: Avec service Python (DSO1_SERVICE_URL configuré)

```
1. User clique "Predict"
2. Web API reçoit les données
3. Fetch vers http://127.0.0.1:8001/predict/irrigation-need
4. Retour du modèle ML entraîné (Arbre de Décision)
5. UI affiche: source = "python-service"
```

---

## 🔚 Prochaines étapes

### Pour soil_moisture:
- [ ] Installer capteurs capacitifs sur arbres
- [ ] Configurer MQTT publisher vers `/farm/{farmId}/sensor/{treeId}/soil`
- [ ] Vérifier données dans SensorData collection

### Pour rainfall:
- [ ] Confirmer si on utilise `FarmStationReading.rain` (préféré) ou `WeatherRecord.rain_mm`
- [ ] Tester la station météo locale pour la pluviométrie

### Pour déployer le service Python:
```bash
# 1. Créer Python FastAPI wrapper
# 2. Charger artifacts: artifacts_dso1/dso1_model.joblib
# 3. Lancer: python app.py
# 4. Définir .env.local: DSO1_SERVICE_URL=http://127.0.0.1:8001
```

---

## 📚 Résumé formule de calcul (Fallback)

Si le service Python n'est pas disponible:

```
score = 100 * (
  0.55 * dryness          +    // Manque d'humidité du sol
  0.25 * heat             +    // Chaleur (température - 20)
  0.20 * airDryness       -    // Sécheresse de l'air (100 - humidity)
  0.35 * rainReduction         // Réduction par pluie
)

Si score >= 67   → "High"
Si score 34-67   → "Medium"
Si score < 34    → "Low"
```

Exemple: soil=35%, temp=28°C, humidity=50%, rain=0mm
→ score = 72% → **"High"** (irrigate!)
