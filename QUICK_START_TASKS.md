# Quick Start: Task Assignment Feature

## What's New?

Farm owners can now **assign tasks to workers** directly from the web dashboard. Workers will automatically see these tasks in their mobile app.

## How to Use (Owner - Web)

### Step 1: Access Task Management
Go to http://localhost:3000/owner/tasks

**Or click:**
- Sidebar: "📋 Assign Tasks" (blue button)
- Header: "📋 Tasks" (orange button)

### Step 2: Create a Task
1. **Select Farm** - Choose which farm the task is for
2. **Select Worker** - Choose which worker to assign the task to
3. **Enter Task Title** - e.g., "Water Zone A" (required)
4. **Add Description** - Optional details about the task
5. **Set Priority** - Low, Medium, or High (default: Medium)
6. **Set Due Date** - Optional deadline
7. Click **"Assign Task to Worker"**

✅ Task is created and worker will see it on mobile!

### Step 3: View All Tasks
1. Select a farm from "Filter by Farm" dropdown
2. Optionally filter by status (TODO, IN_PROGRESS, DONE)
3. See all tasks with worker assignments

## How It Works (Worker - Mobile)

### Step 1: Login
Worker logs in to mobile app with email and password "azerty"

### Step 2: View Tasks
- Tasks tab is the **default view** after login
- All assigned tasks appear automatically
- Each task shows:
  - Title and description
  - Priority badge (colored)
  - Status badge
  - Due date (if set)

### Step 3: Refresh Tasks
- **Pull down** to refresh task list
- New tasks from owner appear immediately

## UI Layout

### Web Dashboard (Owner)
```
┌─────────────────────────────────────────┐
│  Assign New Task                        │
├─────────────────────────────────────────┤
│  Farm: [Dropdown]    Worker: [Dropdown] │
│  Title: [___________________________]   │
│  Description: [____________________]    │
│  Priority: [Dropdown]  Due: [Date]     │
│  [Assign Task to Worker]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  All Tasks                              │
├─────────────────────────────────────────┤
│  Filter: [Farm Dropdown] [Status Drop]  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Water Zone A                    HIGH││
│  │ Apply 50mm water              TODO  ││
│  │ 👤 John Doe  📧 john@example.com    ││
│  │ 📅 Due: March 5, 2026               ││
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Check sensors                MEDIUM ││
│  │ Test all sensors in Zone B    TODO ││
│  │ 👤 Jane Smith 📧 jane@example.com   ││
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Mobile App (Worker)
```
┌─────────────────────────────────────────┐
│  Tasks                                  │
├─────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │ Water Zone A              HIGH     ││
│  │ Apply 50mm water         TODO      ││
│  │ Due: March 5, 2026                 ││
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Check sensors            MEDIUM    ││
│  │ Test all sensors         TODO      ││
│  │ Due: March 6, 2026                 ││
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  📋 Tasks  📍 Zones  🤖 Robots  👤 Me   │
└─────────────────────────────────────────┘
```

## Color Codes

### Priority
- 🔴 **HIGH** - Red badge - Urgent tasks
- 🟡 **MEDIUM** - Yellow badge - Normal priority
- ⚪ **LOW** - Gray badge - Can wait

### Status
- 🔵 **TODO** - Blue badge - Not started
- 🟠 **IN_PROGRESS** - Orange badge - Currently working
- 🟢 **DONE** - Green badge - Completed

## Quick Testing

### Test 1: Create Task
1. Go to `/owner/tasks`
2. Select farm "Olive Farm - Tunis"
3. Select worker "Ahmed Ben Ali"
4. Title: "Test Task"
5. Priority: HIGH
6. Click submit
7. ✅ Success message appears

### Test 2: View on Mobile
1. Open mobile app
2. Login as Ahmed (email from worker list, password: azerty)
3. Tasks tab shows "Test Task"
4. Priority: RED badge (HIGH)
5. Status: BLUE badge (TODO)

## API Endpoints

### Create Task
```
POST /api/owner/tasks/create

Body:
{
  "farm_id": "...",
  "worker_id": "...",
  "title": "Task name",
  "description": "Details",
  "priority": "HIGH",
  "due_date": "2026-03-10"
}
```

### List Tasks
```
GET /api/owner/tasks/list?farm_id=...
```

### Worker Info (includes tasks)
```
GET /api/worker/info
Header: Authorization: Bearer <token>
```

## Files Created

1. **API Endpoints:**
   - `/app/api/owner/tasks/create/route.ts`
   - `/app/api/owner/tasks/list/route.ts`

2. **Web UI:**
   - `/app/owner/tasks/page.tsx`

3. **Updated:**
   - `/app/owner/layout.tsx` (added navigation links)

## Common Issues

### "Worker does not belong to this farm"
- Check that you selected a worker from the same farm
- Workers can only be assigned to their own farm

### Worker doesn't see task on mobile
- Pull down to refresh
- Check that task was assigned to correct worker
- Verify worker is logged in

### No workers in dropdown
- Add workers to farm first via `/owner/workers`
- Select a farm that has workers

## Next Steps

1. ✅ Task creation and assignment - **DONE**
2. 🔄 Task status updates from mobile - **FUTURE**
3. 🔄 Photo evidence upload - **FUTURE**
4. 🔄 Task comments - **FUTURE**
5. 🔄 Push notifications - **FUTURE**

## Documentation

Full documentation: `TASK_ASSIGNMENT_FEATURE.md`

## Support

Check logs:
- **Web:** Browser console (F12)
- **Mobile:** Android Studio Logcat
- **API:** Terminal running Next.js

## Success! 🎉

You can now:
- ✅ Create tasks from web dashboard
- ✅ Assign tasks to specific workers
- ✅ Set priority and due dates
- ✅ View all tasks per farm
- ✅ Worker sees tasks automatically on mobile
- ✅ Filter tasks by status
- ✅ Color-coded priority and status
