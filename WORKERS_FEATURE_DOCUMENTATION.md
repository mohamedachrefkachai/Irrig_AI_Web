# Système de Gestion des Workers - Documentation

## Vue d'ensemble
Ce système permet aux propriétaires de fermes (Farm Owners) d'ajouter des travailleurs à leurs fermes via l'interface web. Les travailleurs accèdent ensuite à leurs comptes exclusivement via l'application mobile avec un mot de passe par défaut.

## Flux de Travail

### 1. Owner ajoute un Worker
**Page Web:** `/owner/workers`

**Processus:**
1. Le propriétaire se connecte au tableau de bord web
2. Va à la section "Workers"
3. Clique sur "+ Add Worker"
4. Remplit le formulaire:
   - Sélectionne la ferme
   - Entre l'email du worker
   - Entre le nom du worker (optionnel)
5. Le mot de passe par défaut "azerty" est automatiquement défini

**API utilisée:** `POST /api/owner/workers/add-worker`

### 2. Worker se connecte via App Mobile
**Point d'entrée:** Application mobile

**Processus:**
1. Le worker ouvre l'app mobile
2. Entre ses identifiants:
   - Email: [email fourni par l'owner]
   - Mot de passe: `azerty`
3. Reçoit un token d'authentification
4. Accède à son tableau de bord mobile

**API utilisée:** `POST /api/auth/login`

### 3. Worker voit ses informations et tâches
**API:** `GET /api/worker/info?user_id={userId}`

**Informations retournées:**
- Informations du worker
- Détails de la ferme assignée
- Liste des tâches associées à la ferme

## Structure de la Base de Données

### User (Utilisateur)
```javascript
{
  email: String (unique),
  password_hash: String (bcrypt),
  role: "OWNER" | "WORKER" | "superadmin",
  fullName: String,
  phone: String,
  status: "ACTIVE" | "INVITED" | "DISABLED",
  created_at: Date
}
```

### Worker
```javascript
{
  user_id: ObjectId (ref: User),
  farm_id: ObjectId (ref: Farm),
  full_name: String,
  status: "ACTIVE" | "INVITED",
  created_at: Date
}
```

### Farm
```javascript
{
  owner_id: ObjectId (ref: User),
  name: String,
  location: String,
  longueur: Number,
  largeur: Number,
  created_at: Date
}
```

## Routes API Disponibles

### 1. Ajouter un Worker
**Endpoint:** `POST /api/owner/workers/add-worker`

**Requête:**
```json
{
  "owner_id": "...",
  "farm_id": "...",
  "worker_email": "worker@example.com",
  "worker_name": "John Doe"
}
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "worker": {
    "id": "...",
    "user_id": "...",
    "farm_id": "...",
    "full_name": "John Doe",
    "email": "worker@example.com",
    "status": "ACTIVE",
    "default_password": "azerty"
  }
}
```

### 2. Lister les travailleurs
**Endpoint:** `GET /api/owner/workers/list?owner_id={owner_id}&farm_id={farm_id}`

**Paramètres optionnels:**
- `farm_id`: Filtrer par ferme spécifique

**Réponse (200 OK):**
```json
{
  "success": true,
  "workers": [
    {
      "id": "...",
      "full_name": "John Doe",
      "email": "worker@example.com",
      "farm_name": "Farm A",
      "status": "ACTIVE",
      "created_at": "2025-03-03T..."
    }
  ],
  "farms": [
    {
      "id": "...",
      "name": "Farm A",
      "location": "Tunis"
    }
  ]
}
```

### 3. Login (Mobile)
**Endpoint:** `POST /api/auth/login`

**Requête:**
```json
{
  "email": "worker@example.com",
  "password": "azerty"
}
```

**Réponse (200 OK):**
```json
{
  "token": "mobile_..._...",
  "user": {
    "id": "...",
    "email": "worker@example.com",
    "name": "John Doe",
    "role": "WORKER"
  }
}
```

**Erreur (403) - Si c'est un OWNER:**
```json
{
  "error": "Owners must use web dashboard"
}
```

### 4. Informations du Worker
**Endpoint:** `GET /api/worker/info?user_id={userId}`

**Réponse (200 OK):**
```json
{
  "success": true,
  "worker": {
    "id": "...",
    "user_id": "...",
    "full_name": "John Doe",
    "email": "worker@example.com",
    "status": "ACTIVE"
  },
  "farm": {
    "id": "...",
    "name": "Farm A",
    "location": "Tunis"
  },
  "tasks": [
    {
      "id": "...",
      "title": "Check Zone 1",
      "status": "PENDING",
      "priority": "HIGH",
      "due_date": "2025-03-04T..."
    }
  ]
}
```

## Restrictions de Sécurité

### Par Rôle

**OWNER (Propriétaire):**
- ✓ Peut se connecter via le web uniquement
- ✓ Peut créer des fermes
- ✓ Peut ajouter des workers à ses fermes
- ✗ Ne peut pas se connecter via l'app mobile

**WORKER (Travailleur):**
- ✓ Peut se connecter via l'app mobile uniquement
- ✓ Peut voir les informations de sa ferme
- ✓ Peut voir ses tâches
- ✗ N'a pas accès au tableau de bord web

## Étapes Suivantes Possibles

1. **Fonction de changement de mot de passe:** Permettre aux workers de changer leur mot de passe initial
2. **Gestion des tâches:** Créer et assigner des tâches aux workers
3. **Notifications:** Envoyer des notifications aux workers pour les tâches
4. **Historique d'activité:** Tracker les actions des workers
5. **Attribution de rôles:** Admin pour gérer les propriétaires
6. **Authentification par invitation:** Envoyer des invitations par email aux workers
