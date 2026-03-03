# Guide de Test - Système de Gestion des Workers

## 📋 Pré-requis
- Base de données MongoDB connectée et accessible
- Serveur web Next.js en cours d'exécution (port 3000)
- Application mobile Android compilée (ou Android Studio ouvert)

---

## ✅ TEST 1: Owner ajoute un Worker (Web)

### Étape 1: Se connecter en tant que Owner
1. Aller à `http://localhost:3000/login`
2. Se connecter avec un compte OWNER:
   - Email: `owner@example.com` (créer si nécessaire)
   - Mot de passe: `votre_mot_de_passe`
3. ✅ Vérifier: Redirection vers `/owner`

### Étape 2: Accéder à la page Workers
1. Sur le tableau de bord Owner, cliquer sur "Workers" dans le menu
2. Ou aller à `http://localhost:3000/owner/workers`
3. ✅ Vérifier: Affichage de la page avec le bouton "+ Add Worker"

### Étape 3: Ajouter un worker
1. Cliquer sur "+ Add Worker"
2. Remplir le formulaire:
   - **Select Farm:** Sélectionner une ferme existante
   - **Worker Email:** `worker1@example.com`
   - **Worker Name:** `Ahmed Ali`
3. Cliquer "Add Worker"
4. ✅ Vérifier:
   - Message de succès: `"Worker added successfully! Default password: azerty"`
   - Le worker apparaît dans la liste avec:
     - Nom: "Ahmed Ali"
     - Email: "worker1@example.com"
     - Statut: "ACTIVE"
     - Farm: "Nom de la ferme sélectionnée"

### Étape 4: Test de duplication
1. Essayer d'ajouter le même worker (même email)
2. ✅ Vérifier: Message d'erreur `"Email already exists"`

### Étape 5: Ajouter plusieurs workers
1. Ajouter d'autres workers:
   - `worker2@example.com` → "Sara Ben"
   - `worker3@example.com` → "Youssef Kh"
2. ✅ Vérifier: Tous les workers apparaissent dans la liste

---

## 🔐 TEST 2: Validation de Sécurité Web

### Test 2.1: Owner sans authentication ne peut pas accéder
1. Sans être connecté, aller à `http://localhost:3000/owner/workers`
2. ✅ Vérifier: Redirection vers `/login`

### Test 2.2: Vérification que l'API refuse les requêtes non authentifiées
1. Ouvrir **DevTools** (F12)
2. Aller à l'onglet **Network**
3. Essayer d'appeler manuellement:
```javascript
fetch('/api/owner/workers/list', {
  method: 'GET',
  headers: {
    'Authorization': 'invalid_token'
  }
})
```
4. ✅ Vérifier: Erreur 401

---

## 📱 TEST 3: Worker se connecte via App Mobile

### Étape 1: Préparer le mobile
1. Lancer l'application Android (émulateur ou appareil)
2. Aller à l'écran de **Login** (Auth)

### Étape 2: Tenter une connexion avec credentials OWNER
1. Entrer:
   - Email: `owner@example.com`
   - Password: `votre_mot_de_passe`
2. Cliquer "Sign in"
3. ✅ Vérifier: **Message d'erreur: "Owners must use web dashboard"** ❌

### Étape 3: Connexion Worker avec mot de passe par défaut
1. Entrer:
   - Email: `worker1@example.com`
   - Password: `azerty`
2. Cliquer "Sign in"
3. ✅ Vérifier:
   - Connexion réussie: `"Connexion réussie"`
   - Redirection vers **JoinFarmActivity** ou **Worker Dashboard**
   - Token sauvegardé dans SharedPreferences
   - Informations du worker sauvegardées

### Étape 4: Tenter avec mauvais mot de passe
1. Entrer:
   - Email: `worker1@example.com`
   - Password: `wrongpassword`
2. Cliquer "Sign in"
3. ✅ Vérifier: **Message d'erreur: "Invalid password"** ❌

### Étape 5: Tenter avec email inexistant
1. Entrer:
   - Email: `nonexistent@example.com`
   - Password: `azerty`
2. Cliquer "Sign in"
3. ✅ Vérifier: **Message d'erreur: "User not found"** ❌

---

## 📊 TEST 4: Worker accède à ses informations

### Après une connexion réussie:
1. Le worker voit son **Worker Dashboard**
2. ✅ Vérifier les informations affichées:
   - Nom du worker
   - Email
   - Ferme assignée
   - Tâches associées à la ferme
   - Statut de la ferme

### Appel API personnalisé:
```javascript
// Dans la console DevTools de l'app
fetch('/api/worker/info?user_id=WORKER_USER_ID', {
  headers: {
    'Authorization': 'Bearer TOKEN_DU_WORKER'
  }
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 🔗 TEST 5: Vérification des API Routes

### Test 5.1: Ajouter un worker via API
```bash
curl -X POST http://localhost:3000/api/owner/workers/add-worker \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "OWNER_MONGODB_ID",
    "farm_id": "FARM_MONGODB_ID",
    "worker_email": "newworker@test.com",
    "worker_name": "Test Worker"
  }'
```
✅ Réponse attendue (201):
```json
{
  "success": true,
  "worker": {
    "id": "...",
    "full_name": "Test Worker",
    "email": "newworker@test.com",
    "status": "ACTIVE",
    "default_password": "azerty"
  }
}
```

### Test 5.2: Lister les workers
```bash
curl -X GET "http://localhost:3000/api/owner/workers/list?owner_id=OWNER_MONGODB_ID"
```
✅ Réponse attendue (200):
```json
{
  "success": true,
  "workers": [
    {
      "id": "...",
      "full_name": "Ahmed Ali",
      "email": "worker1@example.com",
      "farm_name": "Ferme A",
      "status": "ACTIVE"
    }
  ],
  "farms": [...]
}
```

### Test 5.3: Connexion worker
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker1@example.com",
    "password": "azerty"
  }'
```
✅ Réponse attendue (200):
```json
{
  "token": "mobile_...",
  "user": {
    "id": "...",
    "email": "worker1@example.com",
    "name": "Ahmed Ali",
    "role": "WORKER"
  }
}
```

### Test 5.4: Refus Owner à mobile login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "correct_password"
  }'
```
✅ Réponse attendue (403):
```json
{
  "error": "Owners must use web dashboard"
}
```

---

## 🧪 TEST 6: Scénario Complet E2E

### Scénario 1: Créer un Owner et ajouter des workers
1. **Créer un nouvel Owner** (via web signup ou directement en DB):
   - Email: `farm_owner_test@example.com`
   - Mot de passe: `Test1234!`
   - Role: `OWNER`

2. **Créer une ferme** pour cet owner:
   - Nom: "Test Farm"
   - Location: "Sfax, Tunisia"
   - Taille: 100m x 50m

3. **Owner ajoute 3 workers**:
   - worker_test1@example.com → "Ali"
   - worker_test2@example.com → "Fatima"
   - worker_test3@example.com → "Mohamed"

4. **Chaque worker se connecte** via mobile avec:
   - Email: worker_testX@example.com
   - Mot de passe: `azerty`

5. ✅ **Résultats attendus**:
   - ✓ Chaque worker voit sa ferme
   - ✓ Chaque worker voit les tâches de sa ferme
   - ✓ Owner voit tous ses workers
   - ✓ Owner peut assigner des tâches

---

## 🐛 DÉBOGAGE - Vérifier les Logs

### Logs Web (Next.js):
```bash
# Dans le terminal du serveur Next.js, vérifier:
# - "Add worker error: ..."
# - "List workers error: ..."
# - Erreurs de connexion DB
```

### Logs Mobile (Android Studio):
```
Logcat → com.irrigai.mobile
Chercher:
- "Network error: ..."
- "Response: 403 Owners must use web dashboard"
- Token sauvegardé
```

### Logs Base de Données:
```javascript
// Vérifier dans MongoDB:
// Users créés avec role "WORKER"
// Workers liés à leurs fermes
// Vérifier que les passwords sont hashed
db.users.find({ role: "WORKER" })
db.workers.find({ farm_id: ObjectId("...") })
```

---

## ❌ ERREURS COURANTES & SOLUTIONS

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Email already exists" | Worker existe déjà | Utiliser un nouveau email |
| "Farm not found or you don't own this farm" | Owner ne possède pas la ferme | Ajouter la farm à l'owner |
| "Owners must use web dashboard" | Owner tente de se connecter sur mobile | Utiliser le web |
| "Network error" sur Android | Connexion au serveur impossible | Vérifier l'URL, vérifier que le serveur tourne |
| Mot de passe incorrect | Password pas "azerty" | Vérifier le hash bcrypt en DB |
| Worker n'a pas de ferme | Worker_id mal linké | Vérifier farm_id dans collection Workers |

---

## ✨ TESTS SUPPLÉMENTAIRES (Optionnel)

### Changer le mot de passe
- [ ] Worker peut changer "azerty" vers un autre mot de passe
- [ ] Ancien mot de passe ne fonctionne plus

### Désactiver un worker
- [ ] Owner peut désactiver un worker (status: "DISABLED")
- [ ] Worker désactivé ne peut pas se connecter

### Invitations par email
- [ ] Owner envoie invitation par email
- [ ] Worker reçoit email avec lien/code
- [ ] Worker se connecte avec ses identifiants

### Permissions
- [ ] Un worker ne peut pas voir les données des autres workers
- [ ] Un owner pour voir ses workers uniquement
