# Complete Worker Mobile Testing Guide

## Overview
This guide walks through testing the complete worker mobile flow from owner adding a worker to the worker accessing zones and tasks.

## Prerequisites
- Android emulator or physical device
- Access to the Next.js backend running
- MongoDB database with test data
- Android Studio with the app installed

## Part 1: Web - Owner Adds Worker

### Step 1.1: Login as Owner
1. Go to http://localhost:3000/login
2. Login with test owner credentials:
   - Email: `owner@irrigai.com`
   - Password: (whatever your owner password is)
3. You should see the owner dashboard

### Step 1.2: Access Worker Management
There are 3 ways to access the worker management page:

**Option A: Main Menu**
1. Look at the sidebar menu
2. Find "👥 Manage All Workers" button (highlighted in green)
3. Click it

**Option B: Farms Page**
1. Click on "🌾 Farms" in the sidebar
2. Scroll down to your farm card
3. Click "Go to Workers" quick action

**Option C: Direct URL**
- Go to http://localhost:3000/owner/workers

### Step 1.3: Add a Test Worker
1. On the workers page, find the "Add New Worker" form at the top
2. Fill in the fields:
   - Farm: Select your test farm from dropdown
   - Worker Name: `Test Worker`
   - Worker Email: `testworker@example.com`
3. Click "Add Worker" button
4. You should see success message: "Worker added successfully!"
5. Worker card should appear below form showing:
   - Name: Test Worker
   - Email: testworker@example.com
   - Farm: [Your Farm Name]
   - Status: Active

### Step 1.4: Verify in Database
Run this query in MongoDB to verify:
```javascript
db.workers.findOne({ user_id: ObjectId("...") })
db.users.findOne({ email: "testworker@example.com" })
```

Verify:
- User created with role: "WORKER"
- Password hashed (bcrypted "azerty")
- Worker linked to farm_id

## Part 2: Android - Worker Login

### Step 2.1: Install App on Emulator
```bash
cd c:\4eme\Sem2\PI\android
./gradlew installDebug  # Or ./gradlew.bat installDebug on Windows
```

### Step 2.2: Clear Previous Data
1. Open app
2. Click "Settings" or logout if already logged in
3. If you see a "Clear Storage" button, click it to remove old test data

### Step 2.3: Login with Worker Account
1. You should see the Auth page (Login/Signup toggle)
2. Switch to Login mode if in Signup
3. Enter credentials:
   - Email: `testworker@example.com`
   - Password: `azerty`
4. Click "Connexion" (Login) button

### Step 2.4: Verify Authentication
Wait for the app to:
1. Show success toast: "Connexion réussie"
2. Automatically fetch worker info from API
3. Redirect to WorkerMainActivity

**What happens behind the scenes:**
- `AuthActivity.handleAuthSuccess()` saves token and user info
- `AuthActivity.fetchWorkerInfoAndRedirect()` calls `GET /api/worker/info`
- Farm ID and name are automatically saved to SharedPreferences
- App navigates to `WorkerMainActivity`

### Step 2.5: Troubleshooting Login Issues

**Error: "Owners must use web dashboard"**
- You're trying to login as an OWNER account
- Use a WORKER account instead

**Error: "Compte introuvable"**
- Email doesn't exist in database
- Make sure worker was added via web interface first
- Check email spelling

**Error: "Mot de passe incorrect"**
- Password is incorrect
- Default password for owner-created workers is: `azerty`

**Error: "Erreur réseau"**
- Backend server not running
- Check http://localhost:3000 is accessible
- Check API routes are working

## Part 3: Android - Worker Dashboard

### Step 3.1: Verify Dashboard Loaded
After login, you should see:
- Bottom navigation bar with 4 tabs:
  - 📋 Tasks
  - 📍 Zones
  - 🤖 Robots
  - 👤 Profile
- Tasks tab is selected by default (highlighted)

### Step 3.2: Check Profile Tab First
Before checking Tasks and Zones, verify worker info:
1. Click the "👤 Profile" tab at bottom
2. You should see:
   - Worker Name: "Test Worker"
   - Email: "testworker@example.com"
   - Farm Name: (Your farm name)
   - Farm Location: (Your location)
   - Logout button

**If Profile is empty:**
- Farm ID didn't save properly
- Check SharedPreferences in Android Studio
- Re-login to trigger fetchWorkerInfoAndRedirect()

### Step 3.3: Check Tasks Tab
1. Click "📋 Tasks" tab at bottom
2. App should load and display tasks assigned to this worker
3. Each task card shows:
   - **Title:** Task name
   - **Description:** Task details
   - **Priority:** HIGH (red) / MEDIUM (yellow) / LOW (gray)
   - **Status:** TODO (red badge) / IN_PROGRESS (yellow) / DONE (green)

**If no tasks appear:**
- Might be normal if no tasks created for this worker yet
- Check by:
  1. Going back to web dashboard
  2. Creating a task and assigning it to this worker
  3. Coming back to mobile and pulling to refresh

**Pull to Refresh:**
1. Swipe down on the tasks list
2. Should see refresh spinner
3. Tasks list updates

### Step 3.4: Check Zones Tab
1. Click "📍 Zones" tab at bottom
2. App should load and display all zones in the farm
3. Each zone card shows:
   - **Zone Name:** Zone identifier
   - **Area:** Area in square meters
   - **Description:** Crop type or description
   - **Mode:** AUTO or MANUAL

**If no zones appear:**
- Check if zones exist in the farm
- Go to web dashboard
- Create test zones in the farm
- Return to mobile and pull to refresh

**Pull to Refresh:**
1. Swipe down on the zones list
2. Should see refresh spinner
3. Zones list updates

## Part 4: Data Flow Verification

### API Endpoint: POST /api/auth/login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testworker@example.com",
    "password": "azerty"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_123",
    "email": "testworker@example.com",
    "name": "Test Worker",
    "role": "WORKER"
  }
}
```

### API Endpoint: GET /api/worker/info

**Request:**
```bash
curl http://localhost:3000/api/worker/info \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "success": true,
  "worker": {
    "id": "worker_id_123",
    "user_id": "user_id_123",
    "full_name": "Test Worker",
    "email": "testworker@example.com",
    "status": "active"
  },
  "farm": {
    "id": "farm_id_123",
    "name": "Test Farm",
    "location": "Test Location"
  },
  "zones": [
    {
      "id": "zone_id_1",
      "name": "Zone A",
      "area": 1000,
      "description": "North section"
    }
  ],
  "tasks": [
    {
      "id": "task_id_1",
      "title": "Water plants",
      "description": "Morning irrigation",
      "status": "TODO",
      "priority": "HIGH",
      "due_date": "2024-01-20T10:00:00Z",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Part 5: Complete End-to-End Test

### Scenario: Owner assigns worker to task, worker sees it mobile

**Step 1: Create Zone (via MongoDB or API)**
```javascript
db.zones.insertOne({
  farm_id: ObjectId("farm_id_123"),
  name: "Test Zone",
  crop_type: "Tomatoes",
  width: 100,
  length: 50,
  x: 0,
  y: 0,
  mode: "AUTO",
  created_at: new Date()
})
```

**Step 2: Create Task (via MongoDB or API)**
```javascript
db.tasks.insertOne({
  farm_id: ObjectId("farm_id_123"),
  worker_id: ObjectId("worker_id_123"),
  title: "Water Test Zone",
  description: "Apply 50mm water to test zone",
  priority: "HIGH",
  status: "TODO",
  due_date: new Date("2024-01-25"),
  created_at: new Date()
})
```

**Step 3: Test Mobile**
1. Open mobile app
2. Login with testworker@example.com / azerty
3. Check Tasks tab - should see "Water Test Zone"
4. Check Zones tab - should see "Test Zone"
5. Pull to refresh both tabs

## Part 6: Edge Cases and Error Handling

### Test Case 1: Owner Trying to Login on Mobile
1. On mobile auth page, enter owner email/password
2. Expected: Error "Owners must use web dashboard"
3. Verify error displayed as toast message

### Test Case 2: Invalid Token
1. Delete token from SharedPreferences (Android Studio)
2. Try to access Zones/Tasks tab
3. Expected: Error "Token not found"

### Test Case 3: Network Error
1. Disconnect WiFi on emulator/device
2. Try to pull to refresh
3. Expected: Error toast with network error message
4. Reconnect WiFi and retry

### Test Case 4: Empty Data
1. Create worker without assigning to any tasks
2. Login on mobile
3. Expected: Tasks tab shows empty state gracefully
4. No crashes or blank screens

## Part 7: Database Check Commands

```javascript
// Check all workers
db.workers.find()

// Check all tasks
db.tasks.find()

// Check all zones
db.zones.find()

// Check user passwords (should be hashed)
db.users.find({ role: "WORKER" }, { email: 1, password: 1 })

// Check zones for specific farm
db.zones.find({ farm_id: ObjectId("farm_id_123") })

// Check tasks for specific worker
db.tasks.find({ 
  worker_id: ObjectId("worker_id_123"),
  farm_id: ObjectId("farm_id_123")
})
```

## Part 8: Troubleshooting Checklist

- [ ] Backend server running on http://localhost:3000
- [ ] MongoDB connection working
- [ ] Android app successfully installed on emulator
- [ ] Worker account created from web (not mobile)
- [ ] Default password is "azerty"
- [ ] Token being saved to SharedPreferences
- [ ] Farm ID being saved after login
- [ ] API response includes zones and tasks
- [ ] RecyclerView showing data or displaying empty properly
- [ ] Pull to refresh working
- [ ] No crashes in logcat

## Logcat Debug Commands

```bash
# View all logs
adb logcat

# View logs from app only
adb logcat | grep AuthActivity
adb logcat | grep WorkerTasksFragment
adb logcat | grep WorkerZonesFragment

# Clear logs
adb logcat -c

# Save logs to file
adb logcat > logs.txt
```

## Files to Check if Issues Occur

1. **Web Backend:**
   - `/app/api/auth/login/route.ts` - Login endpoint
   - `/app/api/worker/info/route.ts` - Worker info endpoint

2. **Android:**
   - `AuthActivity.java` - fetchWorkerInfoAndRedirect() method
   - `WorkerTasksFragment.java` - loadTasks() method
   - `WorkerZonesFragment.java` - loadZones() method
   - `ApiService.java` - getWorkerInfo() method

3. **Database:**
   - User model with "WORKER" role and hashed "azerty" password
   - Worker with farm_id link
   - Zones in farm_id
   - Tasks with worker_id and farm_id

## Expected Timeline

- **Login:** 2-3 seconds
- **Worker info fetch:** 1-2 seconds
- **Tasks/Zones load:** 1-2 seconds
- **Pull to refresh:** 1-2 seconds

If loading takes longer than 3 seconds consistently, check network connection and API performance.
